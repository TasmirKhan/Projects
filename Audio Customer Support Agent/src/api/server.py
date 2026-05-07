import io
import logging
import os
from collections import defaultdict
from docx import Document
from pypdf import PdfReader

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from src.pipeline import AudioSupportPipeline, create_pipeline

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("audio-support")

app = FastAPI(title="Audio Customer Support Agent")
pipeline: AudioSupportPipeline | None = None
memory: dict[str, list[dict[str, str]]] = defaultdict(list)


class TextRequest(BaseModel):
    text: str
    session_id: str = "default"


@app.on_event("startup")
async def startup_event() -> None:
    global pipeline
    stt_config = {"model": os.getenv("WHISPER_MODEL", "base"), "language": "en"}
    llm_config = {"api_key": os.getenv("OPENAI_API_KEY"), "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"), "temperature": 0.2}
    tts_config = {"voice": os.getenv("EDGE_TTS_VOICE", "en-US-AriaNeural")}
    pipeline = await create_pipeline(stt_config, llm_config, tts_config)


@app.get("/health")
async def health() -> dict:
    return {"ready": bool(pipeline and pipeline.is_initialized), "sessions": len(memory)}


@app.post("/chat/text")
async def chat_text(request: TextRequest) -> JSONResponse:
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline not ready")
    try:
        memory[request.session_id].append({"role": "user", "content": request.text})
        output = await pipeline.process_text(request.text, history=memory[request.session_id])
        memory[request.session_id].append({"role": "assistant", "content": output["response"]})
        return JSONResponse({"ok": True, "session_id": request.session_id, **output})
    except Exception as exc:
        logger.exception("text chat failure")
        return JSONResponse(status_code=500, content={"ok": False, "error": str(exc)})


@app.post("/chat/audio")
async def chat_audio(session_id: str = Form("default"), audio: UploadFile = File(...)) -> JSONResponse:
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline not ready")
    try:
        audio_bytes = await audio.read()
        output = await pipeline.process_audio(audio_bytes, history=memory[session_id])
        memory[session_id].append({"role": "user", "content": output["transcript"]})
        memory[session_id].append({"role": "assistant", "content": output["response"]})
        return JSONResponse({"ok": True, "session_id": session_id, "transcript": output["transcript"], "response": output["response"], "sources": output["sources"]})
    except Exception as exc:
        logger.exception("audio chat failure")
        return JSONResponse(status_code=500, content={"ok": False, "error": str(exc)})


@app.get("/chat/audio/{text}")
async def synth_audio(text: str) -> StreamingResponse:
    if not pipeline or not pipeline.tts:
        raise HTTPException(status_code=503, detail="Pipeline not ready")
    audio = await pipeline.tts.synthesize(text)
    return StreamingResponse(io.BytesIO(audio), media_type="audio/mpeg")


@app.post("/kb/upload")
async def upload_kb(file: UploadFile = File(...)) -> JSONResponse:
    if not pipeline or not pipeline.llm_agent:
        raise HTTPException(status_code=503, detail="Pipeline not ready")
    name = file.filename or "uploaded"
    raw = await file.read()
    ext = os.path.splitext(name.lower())[1]
    if ext == ".txt":
        text = raw.decode("utf-8", errors="ignore")
    elif ext == ".pdf":
        pdf = PdfReader(io.BytesIO(raw))
        text = "\n".join((page.extract_text() or "") for page in pdf.pages)
    elif ext == ".docx":
        doc = Document(io.BytesIO(raw))
        text = "\n".join(p.text for p in doc.paragraphs)
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use txt/pdf/docx")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Empty or unsupported file content")
    doc_id = await pipeline.llm_agent.ingest_document(title=name, content=text, source="upload")
    return JSONResponse({"ok": True, "doc_id": doc_id, "title": name})

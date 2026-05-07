import io
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from src.pipeline import AudioSupportPipeline, create_pipeline

load_dotenv()
app = FastAPI(title="Audio Customer Support Agent")
pipeline: AudioSupportPipeline | None = None


class TextRequest(BaseModel):
    text: str


@app.on_event("startup")
async def startup_event() -> None:
    global pipeline
    stt_config = {"model": os.getenv("WHISPER_MODEL", "base")}
    llm_config = {
        "api_key": os.getenv("OPENAI_API_KEY"),
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "temperature": 0.2,
    }
    tts_config = {"voice": os.getenv("EDGE_TTS_VOICE", "en-US-AriaNeural")}
    pipeline = await create_pipeline(stt_config, llm_config, tts_config)


@app.get("/health")
async def health() -> dict:
    return {
        "ready": bool(pipeline and pipeline.is_initialized),
        "stt_ready": bool(pipeline and pipeline.stt and pipeline.stt.is_initialized),
        "tts_ready": bool(pipeline and pipeline.tts and pipeline.tts.is_initialized),
    }


@app.post("/chat/text")
async def chat_text(request: TextRequest) -> JSONResponse:
    if not pipeline or not pipeline.llm_agent:
        raise HTTPException(status_code=503, detail="Pipeline not ready")
    response = await pipeline.llm_agent.process_query(request.text)
    return JSONResponse({"response": response})


@app.post("/chat/audio")
async def chat_audio(audio: UploadFile = File(...)) -> StreamingResponse:
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline not ready")
    audio_bytes = await audio.read()
    result = await pipeline.process_audio(audio_bytes)
    return StreamingResponse(io.BytesIO(result), media_type="audio/mpeg")

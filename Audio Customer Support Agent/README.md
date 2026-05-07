# AI Audio Customer Support Agent

Production-ready scaffold for STT → RAG → LLM → TTS support workflows.

## Features
- Voice conversation (record in Streamlit, transcribe via Whisper)
- Text conversation fallback
- RAG retrieval via ChromaDB
- Knowledge base document upload endpoint (`/kb/upload`)
- Session-based conversation memory
- Audio response playback via Edge TTS
- Health/status endpoint for monitoring

## Run locally
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8000
streamlit run streamlit_app.py
```

## API endpoints
- `GET /health`
- `POST /chat/text`
- `POST /chat/audio`
- `GET /chat/audio/{text}`
- `POST /kb/upload`

## Deployment notes
### Render / HuggingFace Spaces
- Start command: `uvicorn src.api.server:app --host 0.0.0.0 --port $PORT`
- Add env vars from `.env.example`

### Streamlit Cloud
- App entry: `streamlit_app.py`
- Backend should be publicly reachable and set in sidebar Backend URL.

## Supported KB formats
- TXT supported directly.
- PDF/DOCX can be uploaded; add parser extensions in `/kb/upload` for richer extraction.

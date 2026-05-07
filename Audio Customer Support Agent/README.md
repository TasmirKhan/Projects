# Audio Customer Support Agent

STT → LLM (with RAG) → TTS customer support assistant scaffold.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python src/utils/kb_test.py
python -m src.api.server
```

Then run UI:

```bash
streamlit run streamlit_app.py
```

## Defaults used in this scaffold
- STT: OpenAI Whisper (local)
- LLM: OpenAI Chat Completions API
- TTS: Edge TTS (local)

These choices avoid prohibited real-time framework libraries.

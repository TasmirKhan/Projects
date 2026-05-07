from datetime import datetime
from urllib.parse import quote

import requests
import streamlit as st

st.set_page_config(page_title="AI Audio Customer Support Agent", layout="wide")
st.title("🎧 AI Audio Customer Support Agent")

if "chat" not in st.session_state:
    st.session_state.chat = []


def safe_get_json(method: str, url: str, **kwargs):
    try:
        response = requests.request(method, url, **kwargs)
        response.raise_for_status()
        if "application/json" in response.headers.get("content-type", ""):
            return True, response.json()
        return True, response.content
    except requests.exceptions.ConnectionError:
        return False, {
            "error": "Cannot connect to backend.",
            "hint": "Start FastAPI server: python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8000",
            "url": url,
        }
    except requests.exceptions.RequestException as exc:
        return False, {"error": str(exc), "url": url}


with st.sidebar:
    st.subheader("Controls")
    backend = st.text_input("Backend URL", "http://localhost:8000")
    session_id = st.text_input("Session ID", "default")

    ok, health = safe_get_json("GET", f"{backend}/health", timeout=10)
    st.caption("Backend Status")
    if ok:
        st.success("Connected")
        st.json(health)
    else:
        st.error(health["error"])
        st.info(health.get("hint", "Check backend URL/server."))

    st.subheader("Knowledge Base Upload")
    kb_file = st.file_uploader("Upload TXT/PDF/DOCX", type=["txt", "pdf", "docx"])
    if kb_file and st.button("Index Document"):
        files = {"file": (kb_file.name, kb_file.getvalue(), kb_file.type)}
        ok, payload = safe_get_json("POST", f"{backend}/kb/upload", files=files, timeout=120)
        st.write(payload)

left, right = st.columns([2, 1])
with left:
    st.subheader("Conversation")
    for msg in st.session_state.chat:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            st.caption(msg["time"])
            if msg.get("sources"):
                st.json(msg["sources"])

    text = st.chat_input("Ask a support question")
    if text:
        now = datetime.utcnow().strftime("%H:%M:%S UTC")
        st.session_state.chat.append({"role": "user", "content": text, "time": now})
        with st.spinner("Assistant is typing..."):
            ok, res = safe_get_json("POST", f"{backend}/chat/text", json={"text": text, "session_id": session_id}, timeout=180)
        reply = res.get("response", res.get("error", "No response")) if isinstance(res, dict) else "No response"
        st.session_state.chat.append({"role": "assistant", "content": reply, "time": now, "sources": res.get("sources", []) if isinstance(res, dict) else []})
        st.rerun()

with right:
    st.subheader("Voice (English)")
    st.caption("Use the mic to ask in English. You will get both text and generated voice response.")
    audio = st.audio_input("🎤 Record your question")
    if audio is not None:
        st.audio(audio)
        if st.button("Send Voice Query"):
            files = {"audio": ("voice.wav", audio.read(), "audio/wav")}
            data = {"session_id": session_id}
            with st.spinner("Processing voice pipeline..."):
                ok, res = safe_get_json("POST", f"{backend}/chat/audio", files=files, data=data, timeout=300)
            now = datetime.utcnow().strftime("%H:%M:%S UTC")
            if not ok:
                st.error(res.get("error", "Voice request failed"))
            else:
                transcript = res.get("transcript", "[voice input]")
                answer = res.get("response", res.get("error", "No response"))
                st.session_state.chat.append({"role": "user", "content": transcript, "time": now})
                st.session_state.chat.append({"role": "assistant", "content": answer, "time": now, "sources": res.get("sources", [])})
                st.markdown("### Voice Result")
                st.write("**Transcript:**", transcript)
                st.write("**Assistant Reply:**", answer)
                ok_audio, audio_resp = safe_get_json("GET", f"{backend}/chat/audio/{quote(answer)}", timeout=180)
                if ok_audio and isinstance(audio_resp, (bytes, bytearray)):
                    st.audio(audio_resp)
                else:
                    st.warning("Could not fetch generated audio response.")

from datetime import datetime

import requests
import streamlit as st

st.set_page_config(page_title="AI Audio Customer Support Agent", layout="wide")
st.title("🎧 AI Audio Customer Support Agent")

if "chat" not in st.session_state:
    st.session_state.chat = []

with st.sidebar:
    st.subheader("Controls")
    backend = st.text_input("Backend URL", "http://localhost:8000")
    session_id = st.text_input("Session ID", "default")
    if st.button("Check Health"):
        st.write(requests.get(f"{backend}/health", timeout=30).json())

    st.subheader("Knowledge Base Upload")
    kb_file = st.file_uploader("Upload TXT/PDF/DOCX", type=["txt", "pdf", "docx"])
    if kb_file and st.button("Index Document"):
        files = {"file": (kb_file.name, kb_file.getvalue(), kb_file.type)}
        res = requests.post(f"{backend}/kb/upload", files=files, timeout=120)
        st.write(res.json())

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
            res = requests.post(f"{backend}/chat/text", json={"text": text, "session_id": session_id}, timeout=180).json()
        reply = res.get("response", res.get("error", "No response"))
        st.session_state.chat.append({"role": "assistant", "content": reply, "time": now, "sources": res.get("sources", [])})
        st.rerun()

with right:
    st.subheader("Voice")
    audio = st.audio_input("Record your question")
    if audio is not None:
        st.audio(audio)
        if st.button("Send Voice Query"):
            files = {"audio": ("voice.wav", audio.read(), "audio/wav")}
            data = {"session_id": session_id}
            with st.spinner("Processing voice pipeline..."):
                res = requests.post(f"{backend}/chat/audio", files=files, data=data, timeout=300).json()
            now = datetime.utcnow().strftime("%H:%M:%S UTC")
            st.session_state.chat.append({"role": "user", "content": res.get("transcript", "[voice input]"), "time": now})
            st.session_state.chat.append({"role": "assistant", "content": res.get("response", res.get("error", "No response")), "time": now, "sources": res.get("sources", [])})
            audio_resp = requests.get(f"{backend}/chat/audio/{res.get('response', '')}", timeout=180)
            st.audio(audio_resp.content)

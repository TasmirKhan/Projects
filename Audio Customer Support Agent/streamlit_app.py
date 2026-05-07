import requests
import streamlit as st

st.title("Audio Customer Support Agent")
base = st.text_input("Backend URL", "http://localhost:8000")

q = st.text_input("Ask a question")
if st.button("Send") and q:
    r = requests.post(f"{base}/chat/text", json={"text": q}, timeout=120)
    st.write(r.json().get("response", "No response"))

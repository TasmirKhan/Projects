import tempfile
from typing import Any

import whisper


class STTService:
    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.client = None
        self.is_initialized = False

    async def initialize(self) -> None:
        model_name = self.config.get("model", "base")
        self.client = whisper.load_model(model_name)
        self.is_initialized = True

    async def transcribe(self, audio_bytes: bytes, **kwargs) -> str:
        if not self.is_initialized or self.client is None:
            raise RuntimeError("STT service is not initialized")
        with tempfile.NamedTemporaryFile(suffix=".wav") as temp_file:
            temp_file.write(audio_bytes)
            temp_file.flush()
            result = self.client.transcribe(temp_file.name, language=self.config.get("language", "en"))
        return (result.get("text") or "").strip()

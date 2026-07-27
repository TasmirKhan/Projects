import importlib
import importlib.util
import tempfile
from typing import Any


class STTService:
    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.client: Any | None = None
        self.is_initialized = False

    async def initialize(self) -> None:
        self.is_initialized = True

    def _load_client(self) -> None:
        if self.client is not None:
            return
        if importlib.util.find_spec("whisper") is None:
            raise RuntimeError(
                "Whisper speech-to-text is not installed. Install it with "
                "`pip install -r requirements.txt` or `pip install openai-whisper` "
                "before using voice chat. Text chat can still run without Whisper."
            )
        whisper = importlib.import_module("whisper")
        model_name = self.config.get("model", "base")
        self.client = whisper.load_model(model_name)

    async def transcribe(self, audio_bytes: bytes, **kwargs) -> str:
        if not self.is_initialized:
            raise RuntimeError("STT service is not initialized")
        self._load_client()
        with tempfile.NamedTemporaryFile(suffix=".wav") as temp_file:
            temp_file.write(audio_bytes)
            temp_file.flush()
            result = self.client.transcribe(temp_file.name, language=self.config.get("language", "en"))
        return (result.get("text") or "").strip()

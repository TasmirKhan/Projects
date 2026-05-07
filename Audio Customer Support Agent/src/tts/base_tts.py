from typing import Any

import edge_tts


class TTSService:
    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.is_initialized = False
        self.voice = "en-US-AriaNeural"

    async def initialize(self) -> None:
        self.voice = self.config.get("voice", "en-US-AriaNeural")
        self.is_initialized = True

    async def synthesize(self, text: str, **kwargs) -> bytes:
        if not self.is_initialized:
            raise RuntimeError("TTS service is not initialized")
        communicate = edge_tts.Communicate(text, self.voice)
        audio_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]
        return audio_bytes

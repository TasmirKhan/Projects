from dataclasses import dataclass

from src.llm.agent import CustomerSupportAgent
from src.stt.base_stt import STTService
from src.tts.base_tts import TTSService


@dataclass
class PipelineConfig:
    stt_config: dict
    llm_config: dict
    tts_config: dict


class AudioSupportPipeline:
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.stt: STTService | None = None
        self.llm_agent: CustomerSupportAgent | None = None
        self.tts: TTSService | None = None
        self.is_initialized = False

    async def initialize(self) -> None:
        self.stt = STTService(self.config.stt_config)
        await self.stt.initialize()

        self.llm_agent = CustomerSupportAgent(self.config.llm_config)
        await self.llm_agent.initialize()

        self.tts = TTSService(self.config.tts_config)
        await self.tts.initialize()

        self.is_initialized = True

    async def process_audio(self, audio_bytes: bytes, **kwargs) -> bytes:
        if not self.is_initialized or not self.stt or not self.llm_agent or not self.tts:
            raise RuntimeError("Pipeline is not initialized")
        text_input = await self.stt.transcribe(audio_bytes)
        agent_response = await self.llm_agent.process_query(text_input)
        return await self.tts.synthesize(agent_response)


async def create_pipeline(stt_config: dict, llm_config: dict, tts_config: dict) -> AudioSupportPipeline:
    pipeline = AudioSupportPipeline(PipelineConfig(stt_config=stt_config, llm_config=llm_config, tts_config=tts_config))
    await pipeline.initialize()
    return pipeline

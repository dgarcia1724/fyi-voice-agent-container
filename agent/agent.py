import logging
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import openai, silero

logging.basicConfig(level=logging.INFO)


class FYIAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=(
                "You are a helpful assistant for FYI, a creative productivity platform. "
                "Keep answers short and conversational — this is a voice interface. "
                "Help users with creative projects, team collaboration, and their workspace."
            )
        )


async def entrypoint(ctx: JobContext):
    await ctx.connect()

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(),
    )

    await session.start(agent=FYIAssistant(), room=ctx.room)

    await session.generate_reply(
        instructions="Greet the user warmly and ask how you can help them today."
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))

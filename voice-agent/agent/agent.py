"""
FYI Voice Agent
───────────────
LiveKit Agents v1.x worker — OpenAI Realtime API (VAD + STT + LLM + TTS in one).
"""
from __future__ import annotations

import logging
from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins.openai import realtime

load_dotenv()
logger = logging.getLogger("fyi-agent")

SYSTEM_PROMPT = """
You must always speak and respond in English only.

You are FYI's AI assistant — a warm, helpful creative co-pilot.

Your personality:
- Concise and direct (keep replies short unless asked to elaborate)
- Warm and encouraging — you believe in the user's creative vision
- Practical — give actionable suggestions, not generic advice

Always respond in plain spoken English — no markdown, no bullet points,
since your words will be read aloud via text-to-speech.
"""


async def entrypoint(ctx: JobContext):
    logger.info("FYI agent joining room: %s", ctx.room.name)

    await ctx.connect()

    session = AgentSession(
        llm=realtime.RealtimeModel(
            voice="shimmer",
            temperature=0.8,
        ),
        allow_interruptions=False,
    )

    await session.start(
        room=ctx.room,
        agent=Agent(instructions=SYSTEM_PROMPT),
    )

    await session.generate_reply(
        instructions="Respond in English. Greet the user warmly and ask what they'd like help with today."
    )

    logger.info("FYI agent ready in room: %s", ctx.room.name)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))

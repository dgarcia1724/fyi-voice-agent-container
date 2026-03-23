"""
FYI Voice Agent
───────────────
LiveKit Agents v1.x — Silero VAD + OpenAI Whisper STT + GPT-4o + OpenAI TTS
Receives conversation history from the browser via data channel and injects
it into the system prompt so the agent has full context across chat/voice modes.
"""
from __future__ import annotations

import asyncio
import json
import logging
from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import openai as lk_openai
from livekit.plugins import silero

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

    # Wait up to 2s for conversation history sent by the browser via data channel
    history: list[dict] = []
    history_event = asyncio.Event()

    def on_data(data_packet):
        nonlocal history
        try:
            payload = json.loads(bytes(data_packet.data).decode())
            if payload.get("type") == "conversation_history":
                history = payload.get("messages", [])
                logger.info("Received conversation history: %d messages", len(history))
                history_event.set()
        except Exception as e:
            logger.warning("Failed to parse data packet: %s", e)

    ctx.room.on("data_received", on_data)
    try:
        await asyncio.wait_for(history_event.wait(), timeout=0.5)
    except asyncio.TimeoutError:
        logger.info("No conversation history received, starting fresh")
    ctx.room.off("data_received", on_data)

    # Inject previous conversation into the system prompt
    effective_prompt = SYSTEM_PROMPT
    if history:
        lines = [
            f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
            for m in history
            if m.get("content", "").strip()
        ]
        if lines:
            effective_prompt += "\n\nPrevious conversation context:\n" + "\n".join(lines)
            logger.info("Injected %d history messages into system prompt", len(lines))

    session = AgentSession(
        # Silero VAD runs locally — filters keyboard noise and breathing
        vad=silero.VAD.load(
            min_speech_duration=0.1,
            min_silence_duration=0.6,
            activation_threshold=0.65,
            prefix_padding_duration=0.3,
        ),

        # language="en" forces Whisper to reject non-English audio
        stt=lk_openai.STT(
            model="gpt-4o-transcribe",
            language="en",
        ),

        llm=lk_openai.LLM(model="gpt-4o"),

        tts=lk_openai.TTS(voice="shimmer"),
    )

    await session.start(
        room=ctx.room,
        agent=Agent(instructions=effective_prompt),
    )

    logger.info("FYI agent ready in room: %s", ctx.room.name)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))

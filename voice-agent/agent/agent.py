"""
FYI Voice Agent
───────────────
LiveKit Agents worker — STT (Whisper) → LLM (GPT-4o-mini) → TTS (OpenAI).
Runs as a persistent job dispatcher; one agent per room.
"""
from __future__ import annotations

import logging
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import openai, silero

load_dotenv()
logger = logging.getLogger("fyi-agent")


SYSTEM_PROMPT = """
You are FYI's AI assistant — a creative co-pilot built for professionals in
music, film, design, and content creation.

Your personality:
- Concise and direct (keep replies short unless asked to elaborate)
- Warm and encouraging — you believe in the user's creative vision
- Practical — give actionable suggestions, not generic advice

You can help with:
- Drafting copy, lyrics, scripts, pitches, and creative briefs
- Brainstorming ideas and giving feedback
- Summarising projects or conversations
- Answering questions about FYI's features

Always respond in plain spoken English — no markdown, no bullet points,
since your words will be read aloud via text-to-speech.
"""


async def entrypoint(ctx: JobContext):
    logger.info("FYI agent joining room: %s", ctx.room.name)

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    initial_ctx = llm.ChatContext().append(
        role="system",
        text=SYSTEM_PROMPT,
    )

    assistant = VoiceAssistant(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(voice="alloy"),
        chat_ctx=initial_ctx,
    )

    assistant.start(ctx.room)

    await assistant.say(
        "Hey, I'm your FYI assistant. What are we creating today?",
        allow_interruptions=True,
    )

    logger.info("FYI agent ready in room: %s", ctx.room.name)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))

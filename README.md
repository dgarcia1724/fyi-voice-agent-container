# FYI — AI Voice Assistant Platform

A full-stack MERN application with a **live voice assistant** powered by a self-hosted LiveKit media server and a Python AI agent. Users can chat with an AI (text or voice) in a unified conversation thread.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│   Next.js Frontend (localhost:3001)                                 │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  Dashboard — AI Tab                                         │  │
│   │  ┌───────────────────────────────────────────────────────┐  │  │
│   │  │  AIConversation.tsx                                   │  │  │
│   │  │                                                       │  │  │
│   │  │  • Text chat  ──────────────────► /api/chat           │  │  │
│   │  │                                       │               │  │  │
│   │  │  • Voice (mic) ─► LiveKit Room ◄──────┼── WebRTC      │  │  │
│   │  │                        │              │               │  │  │
│   │  │  • One shared          │  transcripts │               │  │  │
│   │  │    conversation        ▼              │               │  │  │
│   │  │    thread         Agent audio         │               │  │  │
│   │  └───────────────────────────────────────┼───────────────┘  │  │
│   └───────────────────────────────────────────┼───────────────────┘  │
└───────────────────────────────────────────────┼─────────────────────┘
                                                │ WebRTC (audio)
                    ┌───────────────────────────┼───────────────────┐
                    │     Docker Compose         │                   │
                    │                           ▼                   │
                    │   ┌──────────────────────────────────────┐   │
                    │   │   LiveKit Server (media server)      │   │
                    │   │   Port 7880 (WebRTC signaling)       │   │
                    │   │   Port 7881 (HTTP/internal)          │   │
                    │   │                                      │   │
                    │   │   Handles:                           │   │
                    │   │   • WebRTC room creation             │   │
                    │   │   • Audio track routing              │   │
                    │   │   • Participant management           │   │
                    │   └──────────────┬───────────────────────┘   │
                    │                  │ dispatches job             │
                    │                  ▼                            │
                    │   ┌──────────────────────────────────────┐   │
                    │   │   Python AI Agent (agent.py)         │   │
                    │   │                                      │   │
                    │   │   Pipeline:                          │   │
                    │   │   Silero VAD (local, noise filter)   │   │
                    │   │        ↓                             │   │
                    │   │   OpenAI Whisper STT (speech→text)   │   │
                    │   │        ↓                             │   │
                    │   │   GPT-4o LLM (generate response)     │   │
                    │   │        ↓                             │   │
                    │   │   OpenAI TTS (text→speech)           │   │
                    │   │        ↓                             │   │
                    │   │   Audio back to user via LiveKit     │   │
                    │   └──────────────────────────────────────┘   │
                    └───────────────────────────────────────────────┘

                    ┌───────────────────────────────────────────────┐
                    │   Express Backend (localhost:3000)            │
                    │                                               │
                    │   /api/chat       → GPT-4o (streamed text)    │
                    │   /api/livekit/token → LiveKit JWT token       │
                    │   /api/auth       → Firebase Auth             │
                    │   /api/tts        → OpenAI TTS                │
                    └───────────────────────────────────────────────┘
```

---

## How It Works

### Text Chat
1. User types a message → frontend sends it to `/api/chat` on the Express backend
2. Backend calls GPT-4o with the full conversation history and **streams** the response back
3. Words appear in real time as they're generated (like ChatGPT)

### Voice Chat
1. **On page load** — the frontend silently fetches a LiveKit room token and pre-connects to the LiveKit server. The mic permission is also pre-warmed so there's zero delay when the user taps the mic.
2. The LiveKit server detects a new room and **dispatches a job** to the Python agent container.
3. The Python agent joins the room and waits for the user's audio.
4. **User taps mic** — microphone activates instantly (already pre-warmed).
5. **Silero VAD** (running locally in the Docker container) listens to audio and filters out background noise, breathing, and keyboard sounds before sending anything to OpenAI.
6. When speech is detected → **OpenAI Whisper** transcribes it to text (English-only).
7. Text goes to **GPT-4o** which generates a response.
8. Response goes to **OpenAI TTS** which converts it to audio.
9. Audio streams back to the user's browser through the LiveKit media server.
10. Transcripts (both user speech and AI responses) appear in the same conversation thread as text chat.

### Unified Conversation
Both text chat and voice share the same message history. When switching from text to voice, the agent receives the full chat history via a LiveKit data channel and can reference previous conversations naturally.

---

## Project Structure

```
fyi-mern/
├── src/                          # Express backend (Node.js + TypeScript)
│   ├── index.ts                  # Server entry point (port 3000)
│   ├── chat.ts                   # /api/chat → GPT-4o streaming
│   ├── livekit.ts                # /api/livekit/token → JWT token generation
│   ├── auth.ts                   # /api/auth → Firebase Auth
│   └── tts.ts                    # /api/tts → OpenAI TTS
│
├── client/                       # Next.js frontend (port 3001)
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Landing page
│       │   ├── login/page.tsx    # Login (Firebase Auth)
│       │   └── dashboard/page.tsx # Main app shell + navigation
│       ├── components/ui/
│       │   └── AIConversation.tsx # Unified AI chat + voice component
│       └── lib/
│           └── AuthContext.tsx   # Firebase auth state
│
└── voice-agent/                  # Docker Compose (LiveKit + Python agent)
    ├── docker-compose.yml        # Runs LiveKit server + Python agent together
    ├── livekit.yaml              # LiveKit server config
    └── agent/
        ├── Dockerfile
        ├── requirements.txt      # livekit-agents[openai,silero]
        └── agent.py              # Python voice agent entrypoint
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, LiveKit React SDK |
| Backend | Node.js, Express, TypeScript |
| Auth | Firebase Authentication |
| AI (text) | OpenAI GPT-4o (streamed) |
| AI (voice) | LiveKit Agents SDK (Python), Silero VAD, OpenAI Whisper, GPT-4o, OpenAI TTS |
| Media server | LiveKit (self-hosted via Docker) |
| Voice transport | WebRTC (via LiveKit) |

---

## Running Locally

### 1. Start the voice agent containers
```bash
cd voice-agent
docker compose up -d
```

### 2. Start the backend
```bash
npm run dev
```

### 3. Start the frontend
```bash
cd client
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### Environment Variables

**Backend** (`.env` in root):
```
OPENAI_API_KEY=...
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret
FIREBASE_PROJECT_ID=...
```

**Python agent** (`voice-agent/agent/.env`):
```
OPENAI_API_KEY=...
LIVEKIT_URL=ws://livekit:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret
```

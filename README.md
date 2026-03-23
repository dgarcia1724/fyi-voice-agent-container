# FYI — AI Voice Assistant Platform

A full-stack web app where users can talk to an AI assistant by voice or text. Built with a self-hosted **LiveKit media server** and a **Python AI agent** running in Docker containers.

**Live Demo:** [https://fyi-voice-agent.xyz](https://fyi-voice-agent.xyz)

---

## What It Does

- **Talk or type** to an AI assistant from a single conversation thread
- **Voice:** Speak into your mic → AI listens, thinks, and talks back in real time
- **Text:** Type a message → AI responds with streaming text (like ChatGPT)
- Both modes share the same conversation history — switch between them seamlessly
- Secured with Firebase login

---

## System Design

```
                        ┌─────────────────────────────┐
                        │        USER'S BROWSER        │
                        │                              │
                        │  ┌────────────────────────┐  │
                        │  │   Next.js Frontend     │  │
                        │  │  (Vercel — HTTPS)      │  │
                        │  └────────┬───────┬───────┘  │
                        └──────────┼───────┼───────────┘
                                   │       │
                    HTTPS REST     │       │  WebRTC (audio)
                    (text chat)    │       │  WSS (signaling)
                                   │       │
              ┌────────────────────┼───────┼──────────────────────────┐
              │  EC2 Server (AWS)  │       │                           │
              │                   ▼       ▼                           │
              │  ┌─────────────────────────────────────────────────┐  │
              │  │             Caddy (HTTPS reverse proxy)         │  │
              │  │  api.fyi-voice-agent.xyz  →  Express :3000      │  │
              │  │  livekit.fyi-voice-agent.xyz  →  LiveKit :7880  │  │
              │  └──────────────┬──────────────┬────────────────────┘  │
              │                 │              │                        │
              │                 ▼              ▼                        │
              │  ┌──────────────────┐  ┌──────────────────────────┐   │
              │  │  Express Backend │  │   Docker Compose          │   │
              │  │  (Node.js)       │  │                           │   │
              │  │                  │  │  ┌─────────────────────┐  │   │
              │  │  /api/chat       │  │  │  LiveKit Server     │  │   │
              │  │  /api/livekit/   │  │  │  (Media Server)     │  │   │
              │  │    token         │  │  │  Port 7880          │  │   │
              │  │  /api/tts        │  │  │                     │  │   │
              │  │  /api/auth       │  │  │  Routes WebRTC      │  │   │
              │  │                  │  │  │  audio between      │  │   │
              │  │  MongoDB (local) │  │  │  browser & agent    │  │   │
              │  └──────────────────┘  │  └──────────┬──────────┘  │   │
              │                        │             │ dispatches   │   │
              │                        │             ▼  job        │   │
              │                        │  ┌─────────────────────┐  │   │
              │                        │  │  Python AI Agent    │  │   │
              │                        │  │                     │  │   │
              │                        │  │  1. Silero VAD      │  │   │
              │                        │  │     (noise filter)  │  │   │
              │                        │  │  2. Whisper STT     │  │   │
              │                        │  │     (speech→text)   │  │   │
              │                        │  │  3. GPT-4o LLM      │  │   │
              │                        │  │     (response)      │  │   │
              │                        │  │  4. OpenAI TTS      │  │   │
              │                        │  │     (text→speech)   │  │   │
              │                        │  └─────────────────────┘  │   │
              │                        └───────────────────────────┘   │
              └────────────────────────────────────────────────────────┘
```

---

## How Voice Works (Step by Step)

1. **Page loads** — frontend silently fetches a LiveKit token and pre-connects to the media server. Mic permission is pre-warmed so there's zero delay when the user taps the mic button.
2. **LiveKit detects a new room** and dispatches a job to the Python agent container.
3. **User taps the mic** — microphone activates instantly.
4. **Silero VAD** (Voice Activity Detection) runs locally in the container, filtering out background noise and silence before sending anything to the cloud.
5. When speech is detected → **OpenAI Whisper** transcribes it to text.
6. Text goes to **GPT-4o**, which generates a response using the full conversation history.
7. Response goes to **OpenAI TTS**, which converts it to natural speech.
8. Audio streams back to the browser through the LiveKit media server via WebRTC.
9. Transcripts appear in the shared conversation thread alongside text messages.

---

## How Text Chat Works

1. User types a message → frontend sends it to `/api/chat` on the Express backend.
2. Backend calls GPT-4o with the full conversation history and **streams** the response back.
3. Words appear in real time as they're generated.

---

## Architecture Decisions

| Decision | Why |
|---|---|
| **LiveKit for WebRTC** | Handles the hard parts of WebRTC (ICE, DTLS, SRTP, room management) so the agent can focus on AI logic |
| **Python agent** | LiveKit Agents SDK is Python-first; tight integration with Whisper, VAD, and TTS pipelines |
| **Self-hosted LiveKit** | Full control over the media server — no per-minute costs, data stays on our server |
| **Docker Compose** | LiveKit server + Python agent run together as a single deployable unit |
| **Caddy for HTTPS** | Auto-provisions and renews TLS certs via Let's Encrypt — required for browser mic access and WSS connections |
| **Next.js on Vercel** | Free HTTPS hosting, auto-deploys on git push, global CDN |
| **Shared conversation thread** | Voice transcripts and text messages share one history — agent receives full context via LiveKit data channel on connect |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, LiveKit React SDK |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB |
| Auth | Firebase Authentication |
| AI — Text | OpenAI GPT-4o (streamed) |
| AI — Voice | LiveKit Agents SDK (Python), Silero VAD, OpenAI Whisper, GPT-4o, OpenAI TTS |
| Media Server | LiveKit (self-hosted, Docker) |
| Voice Transport | WebRTC via LiveKit |
| Hosting | AWS EC2 (backend + LiveKit), Vercel (frontend) |
| HTTPS / Proxy | Caddy |

---

## Project Structure

```
fyi-mern/
├── src/                          # Express backend (Node.js + TypeScript)
│   ├── index.ts                  # Server entry, CORS, routes (port 3000)
│   ├── chat.ts                   # /api/chat — GPT-4o streaming
│   ├── livekit.ts                # /api/livekit/token — LiveKit JWT
│   ├── tts.ts                    # /api/tts — OpenAI text-to-speech
│   └── auth.ts                   # /api/auth — Firebase token verification
│
├── client/                       # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Landing page
│       │   ├── login/page.tsx    # Login with Firebase
│       │   └── dashboard/page.tsx # App shell + tab navigation
│       ├── components/ui/
│       │   └── AIConversation.tsx # Unified voice + text chat component
│       └── lib/
│           └── AuthContext.tsx   # Firebase auth context
│
└── voice-agent/                  # Docker Compose — LiveKit + Python agent
    ├── docker-compose.yml        # Runs LiveKit server + Python agent together
    ├── livekit.yaml              # LiveKit server config (ports, keys)
    └── agent/
        ├── Dockerfile
        ├── requirements.txt      # livekit-agents[openai,silero]
        └── agent.py              # Voice agent — VAD → STT → LLM → TTS pipeline
```

---

## Running Locally

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- OpenAI API key
- Firebase project

### 1. Clone and configure
```bash
git clone https://github.com/dgarcia1724/fyi-voice-agent-container.git
cd fyi-voice-agent-container
cp .env.example .env       # fill in your keys
cp client/.env.example client/.env.local
```

### 2. Start LiveKit + Python agent
```bash
cd voice-agent
docker compose up -d
```

### 3. Start the backend
```bash
npm install && npm run dev
```

### 4. Start the frontend
```bash
cd client && npm install && npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

---

## Environment Variables

**Root `.env`:**
```
OPENAI_API_KEY=sk-...
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret-fyi-mern-app-key-long-enough
MONGO_URI=mongodb://localhost:27017/fyi
ALLOWED_ORIGINS=http://localhost:3001
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

**`client/.env.local`:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

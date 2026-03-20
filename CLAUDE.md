# FYI MERN Project

## Project Overview
A MERN-stack application for the company **FYI**.

## Backend
- **Runtime**: Node.js + Express + TypeScript
- **Entry point**: `src/index.ts`
- **Port**: 3000
- **Dev command**: `npm run dev` (nodemon + ts-node)

---

## Frontend (Next.js)

### Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Location**: `client/` directory

### Brand Guidelines
Based on the official FYI brand screenshots. All UI must follow these tokens — no exceptions.

#### Colors
| Token | Value | Usage |
|---|---|---|
| Black (bg) | `#000000` | Primary background, black sections |
| Blue (primary) | `#2563EB` | Blue sections, blue buttons, accents |
| Blue dark | `#1D4ED8` | Hover states on blue |
| White | `#FFFFFF` | All text, white buttons |
| Off-white (muted) | `rgba(255,255,255,0.7)` | Body text on blue/black bg |

#### Typography
- **Font**: Inter (via `next/font/google`) — clean, geometric sans-serif
- **Headlines**: Very large, heavy weight (`font-weight: 800–900`), tight tracking
- **Body**: Regular weight (`400`), generous line-height (~1.7)
- **Uppercase labels**: `letter-spacing: 0.1em`, `font-weight: 700` (e.g. "MAKE CONTENT CALLS")
- **No gradient text. No glow. No shimmer.**

#### Buttons
| Variant | Background | Text | Border-radius | Usage |
|---|---|---|---|---|
| Primary (on black bg) | `#2563EB` | White | `999px` pill | Main CTAs on dark sections |
| Secondary (on blue bg) | `#FFFFFF` | `#000000` | `999px` pill | CTAs on blue sections |
| No glassmorphism, no gradients on buttons |

#### Section Backgrounds
- Sections alternate: **black → blue → black → blue**
- Blue sections use solid `#2563EB` — no gradients, no overlays
- Black sections use solid `#000000`

#### Layout
- Max content width: `1200px`, centered
- Section padding: `5rem 2rem` vertical
- Border radius on cards: `16px`
- No glassmorphism. No blurred backgrounds. No aurora effects.

#### ReactBits Animations — Approved Simple Ones Only
Use only these — they are stable and won't break builds:
- **`FadeContent`** — fade + slide up on scroll (use for all section reveals)
- **`BlurText`** — animated word-by-word reveal (hero headline only)
- **`ScrollVelocity`** — horizontal scrolling text strip between sections
- **`CountUp`** — animating numbers for stats
- **Framer Motion** `motion.div` with simple `opacity` + `y` transitions — for cards, buttons

Do NOT use: Aurora, ShinyText, GradientText, Magnet, SpotlightCard, or any WebGL components.

---

### Design Direction
- Match the **official FYI screenshots** exactly: bold, clean, minimal
- Alternating black and blue full-bleed sections
- Large bold white text on both backgrounds
- White pill buttons (black text) on blue sections
- Blue pill buttons (white text) on black sections
- FYI logo: bold white text in a speech-bubble icon shape
- No purple, no indigo, no cyan, no gradients on text, no glassmorphism

---

### Pages

#### Landing Page (`/`)
- **Hero**: Blue background (`#2563EB`), FYI logo top-left, "DOWNLOAD" white pill button top-right, large bold headline white text, app screenshot right side
- **Feature sections**: Alternate black/blue, large uppercase section titles, body text, pill CTA button
- **Stats strip**: ScrollVelocity text strip between major sections
- **How it works**: Black bg, numbered steps with large white text
- **Final CTA**: Blue section, bold headline, white pill button

#### Login Page (`/login`)
- Black background
- Centered card — dark surface (`#111`) with `1px solid rgba(255,255,255,0.1)` border
- FYI logo at top in blue
- Email + password fields, clean minimal styling
- Blue pill submit button (white text)
- Simple fade-in animation on card mount

#### Dashboard (`/dashboard`)
- Black background
- Top nav: FYI logo left, nav links center, user avatar right
- Stat cards: dark surface, white text, blue accents
- Panels: dark surface cards, blue progress bars
- Blue primary action buttons

---

## Voice Agent (LiveKit)

### Architecture
- **Media server**: LiveKit — self-hosted container, handles WebRTC rooms and media routing
- **Agent**: Python service using the **LiveKit Agent SDK** — runs as a separate container, connects to the LiveKit server as a participant
- **Frontend**: Next.js client connects to the LiveKit room via `livekit-client` JS SDK, renders a branded voice assistant widget on the website

### Containers (`voice-agent/`)
```
voice-agent/
├── docker-compose.yml        # LiveKit server + agent together
├── livekit.yaml              # LiveKit server config
├── agent/
│   ├── Dockerfile
│   ├── requirements.txt      # livekit-agents, openai/deepgram/etc
│   └── agent.py              # Agent entrypoint
```

### Agent Behaviour
- Connects to the LiveKit room as an AI participant
- Listens for user speech → STT → LLM → TTS → speaks back
- Persona: FYI's AI assistant — helpful, concise, creative-professional tone
- Runs as a persistent worker (LiveKit job dispatch model)

### Frontend Widget (`/dashboard` + landing page)
- Floating voice button — blue (`#2563EB`) pill button, white text/icon
- On click: requests a LiveKit token from the Express backend (`/api/voice/token`), joins the room
- Shows live speaking indicator (simple animated pulse rings using framer-motion)
- Matches brand: black panel, white text, blue accents — no glassmorphism

### Backend Token Route (`src/`)
- `GET /api/voice/token` — generates a short-lived LiveKit access token (JWT) for the requesting user
- Uses `livekit-server-sdk` (Node.js) to sign tokens

### Environment Variables
```
# LiveKit
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret

# Agent LLM / STT / TTS keys (in agent container)
OPENAI_API_KEY=...
```

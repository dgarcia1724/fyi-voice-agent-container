'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeContent } from '@/components/ui/FadeContent';
import { BlurText } from '@/components/ui/BlurText';
import { ScrollVelocity } from '@/components/ui/ScrollVelocity';

const WAVEFORM_BARS = Array.from({ length: 20 }, (_, i) => ({
  height: Math.round((8 + Math.sin(i * 0.8) * 14 + 14) * 1000) / 1000,
  opacity: Math.round((0.6 + Math.sin(i * 0.5) * 0.4) * 1000) / 1000,
}));

const AUDIO_BARS = Array.from({ length: 14 }, (_, i) => ({
  height: Math.round((6 + Math.abs(Math.sin(i)) * 16) * 1000) / 1000,
}));

const CHAT_LIST = [
  { initials: 'W',  color: '#8B5CF6', name: 'will.i.am',      preview: 'Can we lock in the studio session?',   time: '2m',       unread: 2 },
  { initials: 'DT', color: '#2563EB', name: 'Design Team',     preview: 'New album cover just dropped 🔥',      time: '15m',      unread: 0 },
  { initials: 'M',  color: '#EC4899', name: 'Maria K.',        preview: 'Perfect, thank you! 🙌',               time: '1h',       unread: 0 },
  { initials: 'SA', color: '#10B981', name: 'Sarah A.',        preview: 'Just sent the final master files',     time: '3h',       unread: 1 },
  { initials: 'AR', color: '#F59E0B', name: 'Alex Rodriguez',  preview: 'Love the new direction bro',           time: 'Yesterday', unread: 0 },
  { initials: 'F',  color: '#2563EB', name: 'FYI.AI',          preview: "Scheduled tomorrow's call ✅",          time: 'Now',      unread: 0 },
  { initials: 'K',  color: '#EF4444', name: 'Katy P.',         preview: 'Are you free for a quick call?',       time: '2d',       unread: 3 },
  { initials: 'JD', color: '#06B6D4', name: 'J. Daniels',      preview: 'Sent you the contract draft',          time: '3d',       unread: 0 },
];

function ChatListMockup() {
  return (
    <div style={{
      width: '300px',
      background: '#111',
      borderRadius: '20px 0 0 20px',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRight: 'none',
      overflow: 'hidden',
      boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>Messages</span>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>✏</span>
          </div>
        </div>
        {/* Search bar */}
        <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>🔍</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>Search</span>
        </div>
      </div>
      {/* Rows */}
      {CHAT_LIST.map((chat, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '11px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: i === 0 ? 'rgba(255,255,255,0.05)' : 'transparent',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: chat.color, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700, color: '#fff',
          }}>
            {chat.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{chat.name}</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginLeft: '8px' }}>{chat.time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '175px' }}>
                {chat.preview}
              </span>
              {chat.unread > 0 && (
                <div style={{ background: '#2563EB', borderRadius: '50%', width: '17px', height: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {chat.unread}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const LAPTOP_CHATS = [
  { initial: 'D', color: '#2563EB', name: 'Design Team',    preview: 'New album cover dropped 🔥',     time: '2m',        active: true  },
  { initial: 'W', color: '#8B5CF6', name: 'will.i.am',      preview: "Can we lock in the studio?",    time: '15m',       active: false },
  { initial: 'M', color: '#EC4899', name: 'Maria K.',        preview: 'Perfect, thank you! 🙌',        time: '1h',        active: false },
  { initial: 'S', color: '#10B981', name: 'Sarah A.',        preview: 'Sent the final master files',   time: '3h',        active: false },
  { initial: 'F', color: '#2563EB', name: 'FYI.AI',          preview: "Scheduled tomorrow's call ✅",  time: '4h',        active: false },
  { initial: 'A', color: '#F59E0B', name: 'Alex Rodriguez',  preview: 'Love the new direction bro',   time: 'Yesterday', active: false },
];

function HeroDevice() {
  return (
    <div className="hero-device">
      {/* Laptop frame */}
      <div className="lp-wrap">
        <div className="lp-screen-bezel">
          <div className="lp-cam" />
          <div className="lp-screen">
            {/* Menu bar */}
            <div className="lp-menubar">
              <div className="lp-dots">
                <span className="lp-dot" style={{ background: '#ff5f57' }} />
                <span className="lp-dot" style={{ background: '#febc2e' }} />
                <span className="lp-dot" style={{ background: '#28c840' }} />
              </div>
              <span className="lp-app-title">FYI</span>
            </div>
            {/* App body */}
            <div className="lp-body">
              {/* Sidebar */}
              <div className="lp-sidebar">
                <div className="lp-sidebar-head">Chats</div>
                {LAPTOP_CHATS.map((c, i) => (
                  <div key={i} className={`lp-row${c.active ? ' lp-row-active' : ''}`}>
                    <div className="lp-avatar" style={{ background: c.color }}>{c.initial}</div>
                    <div className="lp-row-info">
                      <span className="lp-row-name">{c.name}</span>
                      <span className="lp-row-preview">{c.preview}</span>
                    </div>
                    <span className="lp-row-time">{c.time}</span>
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="lp-main">
                <div className="lp-main-header">
                  <span className="lp-main-title">Design Team</span>
                  <span className="lp-main-sub">4 members</span>
                </div>
                <div className="lp-messages">
                  <div className="lp-msg lp-msg-in">Can you suggest a colour palette for the new album?</div>
                  <div className="lp-msg lp-msg-out">I was thinking something bold and moody 🎨</div>
                  <div className="lp-msg lp-msg-in">Yes! FYI.AI what do you think?</div>
                  <div className="lp-msg lp-msg-ai">Here are 3 concept directions for your review 🎨</div>
                  <div className="lp-media-row">
                    <div className="lp-media-card" style={{ background: '#2563EB' }}>Design Team</div>
                    <div className="lp-media-card" style={{ background: '#8B5CF6' }}>New Album</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Laptop base */}
        <div className="lp-base">
          <div className="lp-hinge" />
          <div className="lp-stand" />
        </div>
      </div>

      {/* Phone overlay — lower-right of laptop */}
      <div className="lp-phone">
        <div className="lp-phone-inner">
          <div className="lp-phone-bar">Projects</div>
          <div className="lp-phone-grid">
            {[{ label: 'Album Art', c: '#2563EB' }, { label: 'New Merch', c: '#8B5CF6' }, { label: 'Tour Dates', c: '#10B981' }, { label: 'Press Kit', c: '#F59E0B' }].map((p, i) => (
              <div key={i} className="lp-phone-tile">
                <div className="lp-phone-icon" style={{ background: p.c }} />
                <span className="lp-phone-label">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlameIcon() {
  return <span style={{ display: 'inline-block', marginLeft: '0.06em', verticalAlign: '-0.05em' }}>🔥</span>;
}

function FYILogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="8" fill="white" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Open Sans, sans-serif" fontWeight="900" fontSize="18" fill="#000">
        FYI
      </text>
      <polygon points="8,48 8,42 16,48" fill="white" />
    </svg>
  );
}

// ── Reusable phone mockup wrapper ──────────────────────────────────────────
function PhoneWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={s.phoneWrap}>
      <div style={s.phoneScreen}>{children}</div>
    </div>
  );
}

// ── Chat bubbles ───────────────────────────────────────────────────────────
function BubbleUser({ text }: { text: string }) {
  return <div style={s.bubbleUser}>{text}</div>;
}
function BubbleAI({ text }: { text: string }) {
  return <div style={s.bubbleAI}>{text}</div>;
}

// ── Section two-column layout ──────────────────────────────────────────────
function FeatureRow({
  mockupLeft,
  bg,
  children,
  mockup,
}: {
  mockupLeft: boolean;
  bg: string;
  children: React.ReactNode;
  mockup: React.ReactNode;
}) {
  return (
    <section style={{ background: bg }}>
      <div
        style={{
          ...s.featureRow,
          flexDirection: mockupLeft ? 'row' : 'row-reverse',
        }}
      >
        <FadeContent direction={mockupLeft ? 'right' : 'left'} delay={0}>
          {mockup}
        </FadeContent>
        <FadeContent direction={mockupLeft ? 'left' : 'right'} delay={0.12}>
          <div style={s.textBlock}>{children}</div>
        </FadeContent>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: '#000', fontFamily: 'var(--font-open-sans), Open Sans, sans-serif' }}>

      {/* ── SECTION 1: HERO (blue) ─────────────────────────────────────── */}
      <section style={s.hero}>
        <nav style={s.nav}>
          <div style={s.navLeft}>
            <FYILogo size={44} />
            <button style={s.hamburger} aria-label="menu">
              <span style={s.hamburgerLine} />
              <span style={s.hamburgerLine} />
              <span style={s.hamburgerLine} />
            </button>
          </div>
          <Link href="/login">
            <button style={s.downloadBtn}>DOWNLOAD</button>
          </Link>
        </nav>

        <div className="hero-row">
          <div className="hero-text-col">
            <BlurText
              text="FYI is the ultimate productivity tool for"
              delay={60}
              animateBy="words"
              className="hero-headline"
              getTokenStyle={() => ({ fontWeight: 200 })}
              suffix={
                <span style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 900 }}>creatives</span>
                  <FlameIcon />
                </span>
              }
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              style={{ marginTop: '2rem' }}
            >
              <Link href="/login">
                <button style={s.downloadBtn}>GET STARTED FREE</button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="hero-device-col"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <HeroDevice />
          </motion.div>
        </div>
      </section>

      {/* ── VELOCITY STRIP ─────────────────────────────────────────────── */}
      <div style={s.strip}>
        <ScrollVelocity
          texts={[
            'Creative Assistant · Project Management · Content Calls · Secure Messaging · Smart Calendar · Team Chat · ',
            'AI-Powered · End-to-End Encrypted · Real-Time Sync · Video Calls · Unlimited Files · ',
          ]}
          velocity={50}
          className="velocity-text"
          numCopies={4}
        />
      </div>

      {/* ── SECTION 2: Turbocharge (black) ─────────────────────────────── */}
      <FeatureRow mockupLeft bg="#000" mockup={
        <PhoneWrap>
          <div style={s.phoneHeader}>
            <span style={s.phoneHeaderTitle}>FYI.AI</span>
            <span style={s.onlineDot} />
          </div>
          <BubbleUser text="Write a hook for my new music video concept — lo-fi cyberpunk" />
          <BubbleAI text="Neon rain drips on chrome streets, while your heartbeat syncs to the city's forgotten frequency. 🎵" />
          <BubbleUser text="Love it. Now give me a full verse." />
          <BubbleAI text="Static haze and digital dreams, I'm chasing ghosts through neon beams..." />
        </PhoneWrap>
      }>
        <p style={s.eyebrow}>AI CREATIVE CO-PILOT</p>
        <h2 style={s.featureTitle}>Turbocharge your creativity with FYI.AI</h2>
        <p style={s.featureBody}>
          FYI.AI is your creative co-pilot. Ask it to draft stories, lyrics, marketing copy,
          and more — and riff naturally with your team members, all in one place.
        </p>
      </FeatureRow>

      {/* ── SECTION 3: Turn ideas into projects (black) ─────────────────── */}
      <FeatureRow mockupLeft={false} bg="#000" mockup={
        <PhoneWrap>
          <div style={s.phoneHeader}>
            <span style={s.phoneHeaderTitle}>FYI.AI</span>
          </div>
          <BubbleUser text="Start a project to track all Formula 1 races this season" />
          <BubbleAI text="Done! I've created your F1 Season Tracker project 🏎️" />
          <div style={s.projectCard}>
            <span style={s.projectCardTitle}>F1 Season Tracker</span>
            <span style={s.projectCardSub}>12 races · 3 tasks pending</span>
          </div>
          <BubbleAI text="I've added race dates, team standings, and key milestones to get you started." />
        </PhoneWrap>
      }>
        <p style={s.eyebrow}>PROJECT CREATION</p>
        <h2 style={s.featureTitle}>TURN YOUR IDEAS INTO PROJECTS</h2>
        <p style={s.featureBody}>
          FYI.AI transforms your ideas into organized projects with clear action plans,
          milestones, and progress tracking — from first spark to final delivery.
        </p>
      </FeatureRow>

      {/* ── SECTION 4: FYI in the loop (black) ─────────────────────────── */}
      <FeatureRow mockupLeft bg="#000" mockup={
        <PhoneWrap>
          <div style={s.phoneHeader}>
            <span style={s.phoneHeaderTitle}>Creative Team 🎤</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>4 members</span>
          </div>
          <div style={s.groupMsg}>
            <span style={s.groupName}>will.i.am</span>
            <span style={s.groupText}>Can we schedule the studio session?</span>
          </div>
          <BubbleAI text="@FYI.AI — Finding availability across all time zones..." />
          <BubbleAI text="✅ Best slot: Tuesday 3PM PST / 6PM EST / 11PM GMT" />
          <div style={s.groupMsg}>
            <span style={s.groupName}>will.i.am</span>
            <span style={s.groupText}>Perfect, lock it in!</span>
          </div>
        </PhoneWrap>
      }>
        <p style={s.eyebrow}>GROUP CHAT AI</p>
        <h2 style={s.featureTitle}>FYI IN THE LOOP</h2>
        <p style={s.featureBody}>
          Add FYI.AI to any group chat. It summarizes conversations, recalls key information,
          and handles scheduling across time zones — so your team stays aligned.
        </p>
      </FeatureRow>

      {/* ── SECTION 5: Build projects (blue) ───────────────────────────── */}
      <FeatureRow mockupLeft={false} bg="#2563EB" mockup={
        <PhoneWrap>
          <div style={s.phoneHeader}>
            <span style={s.phoneHeaderTitle}>My Projects</span>
          </div>
          <div style={s.projectsGrid}>
            {['Album Art', 'New Merch', 'Tour Dates', 'Press Kit', 'Music Video', 'Collab EP'].map((p) => (
              <div key={p} style={s.projectTile}>
                <div style={s.projectTileIcon} />
                <span style={s.projectTileLabel}>{p}</span>
              </div>
            ))}
          </div>
        </PhoneWrap>
      }>
        <p style={{ ...s.eyebrow, color: 'rgba(255,255,255,0.7)' }}>ORGANIZATION</p>
        <h2 style={{ ...s.featureTitle, color: '#fff' }}>BUILD PROJECTS</h2>
        <p style={{ ...s.featureBody, color: 'rgba(255,255,255,0.8)' }}>
          Organize your work into Projects. Store files, manage assets, add team members,
          and keep everything in one place — no more scattered folders and lost links.
        </p>
        <button style={s.btnWhite}>READ MORE</button>
      </FeatureRow>

      {/* ── SECTION 6: Encryption (black) ──────────────────────────────── */}
      <FeatureRow mockupLeft bg="#000" mockup={
        <PhoneWrap>
          <div style={s.phoneHeader}>
            <span style={s.phoneHeaderTitle}>🔒 Encrypted Chat</span>
          </div>
          <div style={{ ...s.encryptBadge }}>End-to-end encrypted · ECDHE + ECDSA</div>
          <BubbleUser text="Sending you the final master files" />
          <div style={s.attachmentCard}>
            <span style={s.attachIcon}>🎵</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>Final_Master_v3.wav</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>248 MB · Encrypted</div>
            </div>
          </div>
          <BubbleAI text="Received! Your file is protected with Bitcoin-grade encryption 🔐" />
        </PhoneWrap>
      }>
        <p style={s.eyebrow}>PRIVACY & SECURITY</p>
        <h2 style={s.featureTitle}>Protecting your data with the Most Advanced Encryption</h2>
        <p style={s.featureBody}>
          End-to-end encryption using ECDHE and ECDSA — the same cryptography securing
          Bitcoin and Ethereum. Your creative work stays private, always.
        </p>
        <button style={s.btnBlue}>READ MORE</button>
      </FeatureRow>

      {/* ── SECTION 7: Content calls (blue) ────────────────────────────── */}
      <FeatureRow mockupLeft={false} bg="#2563EB" mockup={
        <PhoneWrap>
          <div style={s.phoneHeader}>
            <span style={s.phoneHeaderTitle}>Content Call · Live</span>
            <span style={{ ...s.onlineDot, background: '#22c55e' }} />
          </div>
          <div style={s.callParticipants}>
            {['JD', 'MK', 'AL'].map((i) => (
              <div key={i} style={s.callAvatar}>{i}</div>
            ))}
          </div>
          <div style={s.waveformBar}>
            {WAVEFORM_BARS.map((bar, i) => (
              <div
                key={i}
                style={{
                  ...s.waveformPulse,
                  height: `${bar.height}px`,
                  opacity: bar.opacity,
                }}
              />
            ))}
          </div>
          <div style={s.sharedFileCard}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Shared on call</span>
            <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>Campaign_Draft_v2.pdf</span>
          </div>
        </PhoneWrap>
      }>
        <p style={{ ...s.eyebrow, color: 'rgba(255,255,255,0.7)' }}>VIDEO & CONTENT CALLS</p>
        <h2 style={{ ...s.featureTitle, color: '#fff' }}>MAKE CONTENT CALLS</h2>
        <p style={{ ...s.featureBody, color: 'rgba(255,255,255,0.8)' }}>
          Share and sync content on calls more easily than any other app. Make one-on-one or
          group calls worldwide. All files shared on a call are saved in your history.
        </p>
        <button style={s.btnWhite}>READ MORE</button>
      </FeatureRow>

      {/* ── SECTION 8: Messaging (black) ───────────────────────────────── */}
      <FeatureRow mockupLeft bg="#000" mockup={
        <PhoneWrap>
          <div style={s.phoneHeader}>
            <span style={s.phoneHeaderTitle}>Studio Chat</span>
          </div>
          <BubbleUser text="Just dropped the new beat 🔥" />
          <div style={s.reactionRow}>
            <span style={s.reaction}>🔥 12</span>
            <span style={s.reaction}>👍 8</span>
            <span style={s.reaction}>💯 5</span>
          </div>
          <div style={s.audioCard}>
            <span style={s.audioIcon}>▶</span>
            <div style={s.audioWave}>
              {AUDIO_BARS.map((bar, i) => (
                <div key={i} style={{ ...s.audioBar, height: `${bar.height}px` }} />
              ))}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>2:34</span>
          </div>
          <div style={s.meetingCard}>
            <span style={s.meetingLabel}>📅 Meeting</span>
            <span style={s.meetingTitle}>Studio Session — Tomorrow 2PM</span>
          </div>
        </PhoneWrap>
      }>
        <p style={s.eyebrow}>MESSAGING</p>
        <h2 style={s.featureTitle}>POWERFUL & EXPRESSIVE MESSAGING</h2>
        <p style={s.featureBody}>
          Default power user settings. Organize by contacts or projects.
          No file size limits. Reactions, voice notes, and meeting cards — built in.
        </p>
        <button style={s.btnBlue}>READ MORE</button>
      </FeatureRow>

      {/* ── SECTION 9: Calendar (black) ─────────────────────────────────── */}
      <FeatureRow mockupLeft={false} bg="#000" mockup={
        <PhoneWrap>
          <div style={s.phoneHeader}>
            <span style={s.phoneHeaderTitle}>FYI Calendar</span>
          </div>
          <div style={s.calendarEvent}>
            <div style={s.calendarEventDot} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>New Album Release</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Today · 18:00</div>
            </div>
          </div>
          <div style={{ ...s.calendarEvent, borderColor: 'rgba(37,99,235,0.4)' }}>
            <div style={{ ...s.calendarEventDot, background: '#2563EB' }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Team Launch Call</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Tomorrow · 14:00</div>
            </div>
          </div>
          <div style={{ ...s.calendarEvent, borderColor: 'rgba(34,197,94,0.4)' }}>
            <div style={{ ...s.calendarEventDot, background: '#22c55e' }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Merch Deadline</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Friday · All day</div>
            </div>
          </div>
        </PhoneWrap>
      }>
        <p style={s.eyebrow}>SMART SCHEDULING</p>
        <h2 style={s.featureTitle}>FYI CALENDAR</h2>
        <p style={s.featureBody}>
          Track project deadlines and deliverables. Schedule team meetings and launch calls
          directly from event reminders. Create 1-1 or group events with ease.
        </p>
      </FeatureRow>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={s.footer}>
        <FYILogo size={40} />
        <p style={s.footerCopy}>© 2024 FYI.FYI, Inc.</p>
      </footer>

      <style>{`
        .hero-headline {
          font-size: clamp(2.4rem, 5vw, 5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 0.95;
          color: #ffffff;
          justify-content: flex-start;
          text-align: left;
          font-family: var(--font-open-sans), Open Sans, sans-serif;
          row-gap: 0.08em;
        }

        /* ── HERO RESPONSIVE LAYOUT ── */
        .hero-row {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 2rem 5rem;
        }
        .hero-text-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 600px;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .hero-device-col {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 0;
        }

        @media (max-width: 900px) {
          .hero-row {
            flex-direction: column;
            padding: 1.5rem 1.5rem 4rem;
            gap: 2.5rem;
            align-items: center;
            position: relative;
          }
          .hero-text-col {
            align-items: center;
            order: 2;
            z-index: 1;
          }
          .hero-device-col {
            position: static;
            transform: none;
            order: 1;
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .hero-headline {
            justify-content: center;
            text-align: center;
          }
        }

        /* ── LAPTOP MOCKUP ── */
        .hero-device {
          position: relative;
          width: 100%;
          max-width: 560px;
        }
        .lp-wrap { display: flex; flex-direction: column; width: 100%; }
        .lp-screen-bezel {
          background: #1c1c1e;
          border-radius: 10px 10px 0 0;
          padding: 6px 6px 0;
          box-shadow: 0 0 0 1px #3a3a3c, 0 24px 70px rgba(0,0,0,0.8);
        }
        .lp-cam {
          width: 6px; height: 6px; border-radius: 50%;
          background: #3a3a3c; margin: 0 auto 4px;
        }
        .lp-screen { background: #0f0f14; border-radius: 4px; overflow: hidden; }
        .lp-menubar {
          background: #1a1a24; padding: 5px 10px;
          display: flex; align-items: center; gap: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lp-dots { display: flex; gap: 4px; }
        .lp-dot { width: 8px; height: 8px; border-radius: 50%; display: block; }
        .lp-app-title { margin-left: 8px; font-size: 0.6rem; color: rgba(255,255,255,0.35); font-weight: 600; }
        .lp-body { display: flex; height: 230px; }
        .lp-sidebar {
          width: 145px; flex-shrink: 0;
          background: #111118; border-right: 1px solid rgba(255,255,255,0.05); overflow: hidden;
        }
        .lp-sidebar-head {
          padding: 7px 10px 5px; font-size: 0.52rem; font-weight: 700;
          color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .lp-row {
          display: flex; align-items: center; gap: 6px; padding: 5px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.025);
        }
        .lp-row-active { background: rgba(37,99,235,0.2); }
        .lp-avatar {
          width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.44rem; font-weight: 700; color: #fff;
        }
        .lp-row-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
        .lp-row-name { font-size: 0.54rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lp-row-preview { font-size: 0.46rem; color: rgba(255,255,255,0.36); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lp-row-time { font-size: 0.4rem; color: rgba(255,255,255,0.26); flex-shrink: 0; }
        .lp-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .lp-main-header {
          padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: baseline; gap: 6px;
        }
        .lp-main-title { font-size: 0.58rem; font-weight: 700; color: #fff; }
        .lp-main-sub { font-size: 0.46rem; color: rgba(255,255,255,0.32); }
        .lp-messages { flex: 1; padding: 8px 10px; display: flex; flex-direction: column; gap: 5px; justify-content: flex-end; }
        .lp-msg { border-radius: 6px; padding: 4px 7px; font-size: 0.48rem; max-width: 78%; line-height: 1.4; }
        .lp-msg-in { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.82); align-self: flex-start; border-radius: 6px 6px 6px 2px; }
        .lp-msg-out { background: #2563EB; color: #fff; align-self: flex-end; border-radius: 6px 6px 2px 6px; }
        .lp-msg-ai { background: rgba(37,99,235,0.14); color: rgba(255,255,255,0.8); border: 1px solid rgba(37,99,235,0.35); align-self: flex-start; border-radius: 6px 6px 6px 2px; }
        .lp-media-row { display: flex; gap: 5px; align-self: flex-start; margin-top: 2px; }
        .lp-media-card { width: 54px; height: 34px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 0.38rem; color: rgba(255,255,255,0.85); font-weight: 600; }
        .lp-base { display: flex; flex-direction: column; align-items: center; }
        .lp-hinge { width: 100%; height: 5px; background: linear-gradient(180deg,#6b6b6b,#505050); }
        .lp-stand { width: 106%; height: 13px; background: linear-gradient(180deg,#9ca3af,#6b7280); border-radius: 0 0 8px 8px; box-shadow: 0 6px 24px rgba(0,0,0,0.55); }
        .lp-phone {
          position: absolute; bottom: -8px; right: -20px; width: 120px;
        }
        .lp-phone-inner {
          background: #111; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12); overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.7);
        }
        .lp-phone-bar { padding: 8px 10px 6px; font-size: 0.54rem; font-weight: 700; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .lp-phone-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 8px; }
        .lp-phone-tile { background: rgba(255,255,255,0.07); border-radius: 8px; padding: 7px 5px; display: flex; flex-direction: column; gap: 5px; align-items: center; }
        .lp-phone-icon { width: 22px; height: 22px; border-radius: 6px; }
        .lp-phone-label { font-size: 0.37rem; color: rgba(255,255,255,0.68); font-weight: 600; text-align: center; }

        @media (max-width: 900px) {
          .hero-device { max-width: 360px; }
          .lp-body { height: 170px; }
          .lp-sidebar { width: 105px; }
          .lp-phone { right: -28px; width: 95px; bottom: -6px; }
        }
        .velocity-text {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          font-family: var(--font-open-sans), Open Sans, sans-serif;
        }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  /* ── HERO ── */
  hero: {
    background: 'linear-gradient(to bottom, #2563EB 0%, #2563EB 12%, #1a3a8a 42%, #071530 68%, #000 88%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 3rem',
    width: '100%',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  hamburger: {
    background: 'transparent',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '4px',
    cursor: 'pointer',
  },
  hamburgerLine: {
    display: 'block',
    width: '22px',
    height: '2px',
    background: '#fff',
    borderRadius: '2px',
  },
  downloadBtn: {
    padding: '0.7rem 1.8rem',
    background: '#fff',
    color: '#000',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  /* ── DESKTOP MOCKUP (hero) — kept for style refs ── */
  mockup: {
    flex: '0 0 auto',
  },
  mockupScreen: {
    background: '#1a1a2e',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  mockupBar: {
    background: '#0d0d1a',
    padding: '0.6rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  mockupDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  mockupTitle: {
    marginLeft: '0.75rem',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  mockupBody: {
    display: 'flex',
    height: '280px',
  },
  mockupSidebar: {
    width: '130px',
    background: '#111122',
    padding: '0.75rem 0',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  mockupChan: {
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
  },
  mockupChat: {
    flex: 1,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
  bubbleBlue: {
    alignSelf: 'flex-end',
    background: '#2563EB',
    color: '#fff',
    padding: '0.6rem 0.9rem',
    borderRadius: '12px 12px 2px 12px',
    fontSize: '0.75rem',
    maxWidth: '80%',
    lineHeight: 1.4,
  },
  bubbleDark: {
    alignSelf: 'flex-start',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    padding: '0.6rem 0.9rem',
    borderRadius: '12px 12px 12px 2px',
    fontSize: '0.75rem',
    maxWidth: '80%',
    lineHeight: 1.4,
  },

  /* ── STRIP ── */
  strip: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '1.25rem 0',
    overflow: 'hidden',
    background: '#000',
  },

  /* ── FEATURE ROW LAYOUT ── */
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4rem',
    padding: '6rem 3rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  textBlock: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },

  /* ── PHONE MOCKUP ── */
  phoneWrap: {
    borderRadius: '32px',
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    width: '260px',
    background: '#111',
    flexShrink: 0,
  },
  phoneScreen: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: '480px',
  },
  phoneHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '4px',
  },
  phoneHeaderTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
  },

  /* ── CHAT BUBBLES (phone) ── */
  bubbleUser: {
    alignSelf: 'flex-end',
    background: '#2563EB',
    color: '#fff',
    padding: '0.55rem 0.85rem',
    borderRadius: '14px 14px 2px 14px',
    fontSize: '0.72rem',
    maxWidth: '85%',
    lineHeight: 1.4,
  },
  bubbleAI: {
    alignSelf: 'flex-start',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    padding: '0.55rem 0.85rem',
    borderRadius: '14px 14px 14px 2px',
    fontSize: '0.72rem',
    maxWidth: '85%',
    lineHeight: 1.4,
  },

  /* ── TEXT BLOCK ── */
  eyebrow: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#2563EB',
    textTransform: 'uppercase' as const,
  },
  featureTitle: {
    fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
    fontWeight: 800,
    letterSpacing: '0.01em',
    lineHeight: 1.1,
    color: '#fff',
  },
  featureBody: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.75,
    maxWidth: '480px',
  },

  /* ── BUTTONS ── */
  btnBlue: {
    padding: '0.85rem 2.2rem',
    background: '#2563EB',
    color: '#fff',
    borderRadius: '999px',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    border: 'none',
    cursor: 'pointer',
    alignSelf: 'flex-start' as const,
  },
  btnWhite: {
    padding: '0.85rem 2.2rem',
    background: '#fff',
    color: '#000',
    borderRadius: '999px',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    border: 'none',
    cursor: 'pointer',
    alignSelf: 'flex-start' as const,
  },

  /* ── PROJECT CARD (section 3) ── */
  projectCard: {
    background: 'rgba(37,99,235,0.15)',
    border: '1px solid rgba(37,99,235,0.4)',
    borderRadius: '12px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  projectCardTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#fff',
  },
  projectCardSub: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.5)',
  },

  /* ── GROUP CHAT (section 4) ── */
  groupMsg: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  groupName: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#2563EB',
    paddingLeft: '4px',
  },
  groupText: {
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    padding: '0.5rem 0.75rem',
    borderRadius: '14px 14px 14px 2px',
    fontSize: '0.72rem',
    lineHeight: 1.4,
  },

  /* ── PROJECTS GRID (section 5) ── */
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    flex: 1,
  },
  projectTile: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-start',
  },
  projectTileIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: '#2563EB',
  },
  projectTileLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#fff',
  },

  /* ── ENCRYPTION (section 6) ── */
  encryptBadge: {
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '0.65rem',
    color: '#22c55e',
    fontWeight: 600,
    textAlign: 'center' as const,
  },
  attachmentCard: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  attachIcon: {
    fontSize: '1.4rem',
  },

  /* ── CONTENT CALLS (section 7) ── */
  callParticipants: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    padding: '12px 0',
  },
  callAvatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#2563EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#fff',
  },
  waveformBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    justifyContent: 'center',
    height: '40px',
  },
  waveformPulse: {
    width: '4px',
    background: '#fff',
    borderRadius: '2px',
  },
  sharedFileCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },

  /* ── MESSAGING (section 8) ── */
  reactionRow: {
    display: 'flex',
    gap: '8px',
    paddingLeft: '4px',
  },
  reaction: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '999px',
    padding: '3px 10px',
    fontSize: '0.7rem',
    color: '#fff',
  },
  audioCard: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  audioIcon: {
    fontSize: '0.85rem',
    color: '#2563EB',
    fontWeight: 700,
  },
  audioWave: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flex: 1,
  },
  audioBar: {
    width: '3px',
    background: '#2563EB',
    borderRadius: '2px',
  },
  meetingCard: {
    background: 'rgba(37,99,235,0.15)',
    border: '1px solid rgba(37,99,235,0.4)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  meetingLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.5)',
  },
  meetingTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#fff',
  },

  /* ── CALENDAR (section 9) ── */
  calendarEvent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 14px',
  },
  calendarEventDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#fff',
    flexShrink: 0,
  },

  /* ── FOOTER ── */
  footer: {
    background: '#000',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  footerCopy: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.35)',
  },
};

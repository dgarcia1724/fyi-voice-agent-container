'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VoiceAssistant } from '@/components/ui/VoiceAssistant';

interface User { name: string; email: string; }

type Tab = 'dashboard' | 'assistant';

// ── Dummy data ──────────────────────────────────────────────────────────────

const PROJECTS = [
  { id: 1, name: 'Q2 Content Strategy', status: 'active', progress: 72, collab: 4, updated: '2h ago' },
  { id: 2, name: 'Brand Voice Refresh', status: 'review', progress: 90, collab: 2, updated: '5h ago' },
  { id: 3, name: 'Social Media Calendar', status: 'active', progress: 41, collab: 3, updated: '1d ago' },
  { id: 4, name: 'Investor Deck v3', status: 'draft', progress: 18, collab: 1, updated: '2d ago' },
  { id: 5, name: 'Product Launch Copy', status: 'done', progress: 100, collab: 5, updated: '3d ago' },
];

const TEAMMATES = [
  { id: 1, name: 'Alex Rivera', role: 'Content Lead', initials: 'AR', active: true },
  { id: 2, name: 'Jordan Lee', role: 'Designer', initials: 'JL', active: true },
  { id: 3, name: 'Sam Chen', role: 'Copywriter', initials: 'SC', active: false },
  { id: 4, name: 'Maya Patel', role: 'Strategist', initials: 'MP', active: true },
  { id: 5, name: 'Chris Kim', role: 'Editor', initials: 'CK', active: false },
];

const ACTIVITY = [
  { id: 1, who: 'Alex Rivera', action: 'commented on', target: 'Q2 Content Strategy', time: '12m ago' },
  { id: 2, who: 'Jordan Lee', action: 'uploaded to', target: 'Brand Voice Refresh', time: '1h ago' },
  { id: 3, who: 'Maya Patel', action: 'completed task in', target: 'Social Media Calendar', time: '3h ago' },
  { id: 4, who: 'Sam Chen', action: 'shared', target: 'Investor Deck v3', time: '6h ago' },
  { id: 5, who: 'Chris Kim', action: 'reviewed', target: 'Product Launch Copy', time: '1d ago' },
];

const STATUS_COLOR: Record<string, string> = {
  active: '#22c55e',
  review: '#f59e0b',
  draft: 'rgba(255,255,255,0.3)',
  done: '#2563EB',
};

const STATUS_BG: Record<string, string> = {
  active: 'rgba(34,197,94,0.12)',
  review: 'rgba(245,158,11,0.12)',
  draft: 'rgba(255,255,255,0.06)',
  done: 'rgba(37,99,235,0.18)',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); else router.push('/login'); })
      .catch(() => router.push('/login'));
  }, [router]);

  if (!user) return null;

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.logo}>FYI</span>
          {/* Tab toggle */}
          <div style={s.tabs}>
            <button
              style={{ ...s.tab, ...(tab === 'dashboard' ? s.tabActive : {}) }}
              onClick={() => setTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              style={{ ...s.tab, ...(tab === 'assistant' ? s.tabActive : {}) }}
              onClick={() => setTab('assistant')}
            >
              AI Assistant
            </button>
          </div>
        </div>
        <div style={s.navRight}>
          <span style={s.email}>{user.email}</span>
          <button style={s.signOut} onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}>
            Sign out
          </button>
        </div>
      </nav>

      {tab === 'dashboard' ? <DashView user={user} /> : <AssistantView />}
    </div>
  );
}

// ── Dashboard View ───────────────────────────────────────────────────────────

function DashView({ user }: { user: User }) {
  return (
    <div style={s.main}>
      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Good morning, {user.name || user.email.split('@')[0]} 👋</h1>
          <p style={s.pageSub}>Here's what's happening with your workspace today.</p>
        </div>
        <button style={s.newBtn}>+ New Project</button>
      </div>

      {/* Stat cards */}
      <div style={s.statsRow}>
        {[
          { label: 'Active Projects', value: '5', delta: '+2 this month' },
          { label: 'Teammates', value: '5', delta: '3 online now' },
          { label: 'Collaborations', value: '12', delta: '+4 this week' },
          { label: 'AI Conversations', value: '38', delta: 'last 7 days' },
        ].map((c) => (
          <div key={c.label} style={s.statCard}>
            <span style={s.statCardValue}>{c.value}</span>
            <span style={s.statCardLabel}>{c.label}</span>
            <span style={s.statCardDelta}>{c.delta}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={s.grid}>
        {/* Projects */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Projects</span>
            <button style={s.cardAction}>View all</button>
          </div>
          <div style={s.projectList}>
            {PROJECTS.map((p) => (
              <div key={p.id} style={s.projectRow}>
                <div style={s.projectLeft}>
                  <span style={s.projectName}>{p.name}</span>
                  <div style={s.projectMeta}>
                    <span style={{ ...s.badge, color: STATUS_COLOR[p.status], background: STATUS_BG[p.status] }}>
                      {p.status}
                    </span>
                    <span style={s.metaText}>{p.collab} members</span>
                    <span style={s.metaText}>{p.updated}</span>
                  </div>
                </div>
                <div style={s.projectRight}>
                  <div style={s.progressTrack}>
                    <div style={{ ...s.progressFill, width: `${p.progress}%`, background: p.progress === 100 ? '#22c55e' : '#2563EB' }} />
                  </div>
                  <span style={s.progressLabel}>{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={s.rightCol}>
          {/* Teammates */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Teammates</span>
              <button style={s.cardAction}>Invite</button>
            </div>
            <div style={s.teammateList}>
              {TEAMMATES.map((t) => (
                <div key={t.id} style={s.teammateRow}>
                  <div style={s.avatarWrap}>
                    <div style={s.avatar}>{t.initials}</div>
                    <div style={{ ...s.dot, background: t.active ? '#22c55e' : 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <div style={s.teammateInfo}>
                    <span style={s.teammateName}>{t.name}</span>
                    <span style={s.teammateRole}>{t.role}</span>
                  </div>
                  <button style={s.dmBtn}>Message</button>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Recent Activity</span>
            </div>
            <div style={s.activityList}>
              {ACTIVITY.map((a) => (
                <div key={a.id} style={s.activityRow}>
                  <div style={s.activityDot} />
                  <div style={s.activityText}>
                    <span style={s.activityWho}>{a.who}</span>
                    {' '}<span style={s.activityAction}>{a.action}</span>{' '}
                    <span style={s.activityTarget}>{a.target}</span>
                  </div>
                  <span style={s.activityTime}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI Assistant View ────────────────────────────────────────────────────────

function AssistantView() {
  return (
    <>
      <section style={s.hero}>
        <h1 style={s.heroHeading}>Your AI Assistant</h1>
        <p style={s.heroSub}>Talk to FYI — get answers, create content, manage your workspace.</p>
      </section>

      <section style={s.voiceSection}>
        <div style={s.voiceCard}>
          <p style={s.voiceLabel}>VOICE ASSISTANT</p>
          <h2 style={s.voiceHeading}>Start a conversation</h2>
          <p style={s.voiceSub}>Click below, allow microphone access, and start talking.</p>
          <div style={s.vaWrap}>
            <VoiceAssistant />
          </div>
        </div>
      </section>

      <section style={s.statsSection}>
        {[
          { label: 'Conversations', value: '38' },
          { label: 'Messages sent', value: '214' },
          { label: 'Projects active', value: '5' },
        ].map((item) => (
          <div key={item.label} style={s.stat}>
            <span style={s.statValue}>{item.value}</span>
            <span style={s.statLabel}>{item.label}</span>
          </div>
        ))}
      </section>
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif' },

  // Nav
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: '#000', zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '2rem' },
  logo: { fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.08em', color: '#fff' },

  // Tabs
  tabs: { display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', padding: '4px' },
  tab: { padding: '0.35rem 1.1rem', borderRadius: '999px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
  tabActive: { background: '#2563EB', color: '#fff' },

  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  email: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' },
  signOut: { padding: '0.4rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' },

  // Dashboard layout
  main: { maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' },
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 0.3rem', color: '#fff' },
  pageSub: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', margin: 0 },
  newBtn: { padding: '0.6rem 1.4rem', background: '#2563EB', border: 'none', borderRadius: '999px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },

  // Stat cards
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  statCardValue: { fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 },
  statCardLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.35rem' },
  statCardDelta: { fontSize: '0.78rem', color: '#2563EB', fontWeight: 600, marginTop: '0.15rem' },

  // Grid
  grid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem', alignItems: 'start' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '1rem' },

  // Card
  card: { background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' },
  cardAction: { fontSize: '0.8rem', fontWeight: 600, color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 },

  // Projects
  projectList: { display: 'flex', flexDirection: 'column', gap: '0' },
  projectRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '1rem' },
  projectLeft: { display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 0 },
  projectName: { fontSize: '0.9rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  projectMeta: { display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' },
  badge: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.15rem 0.55rem', borderRadius: '999px' },
  metaText: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 },
  projectRight: { display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 },
  progressTrack: { width: '80px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '999px', transition: 'width 0.3s' },
  progressLabel: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, minWidth: '28px', textAlign: 'right' },

  // Teammates
  teammateList: { display: 'flex', flexDirection: 'column', gap: '0' },
  teammateRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fff', letterSpacing: '0.03em' },
  dot: { position: 'absolute', bottom: 0, right: 0, width: '9px', height: '9px', borderRadius: '50%', border: '2px solid #111' },
  teammateInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 },
  teammateName: { fontSize: '0.85rem', fontWeight: 600, color: '#fff' },
  teammateRole: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' },
  dmBtn: { fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.25rem 0.7rem', cursor: 'pointer', flexShrink: 0 },

  // Activity
  activityList: { display: 'flex', flexDirection: 'column', gap: '0' },
  activityRow: { display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  activityDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: '0.3rem' },
  activityText: { flex: 1, fontSize: '0.8rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' },
  activityWho: { fontWeight: 700, color: '#fff' },
  activityAction: { color: 'rgba(255,255,255,0.4)' },
  activityTarget: { fontWeight: 600, color: 'rgba(255,255,255,0.7)' },
  activityTime: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', flexShrink: 0 },

  // AI Assistant view
  hero: { background: '#2563EB', padding: '5rem 2rem', textAlign: 'center' },
  heroHeading: { fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 1rem', color: '#fff' },
  heroSub: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 },

  voiceSection: { background: '#000', padding: '5rem 2rem', display: 'flex', justifyContent: 'center' },
  voiceCard: { width: '100%', maxWidth: '520px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '3rem 2.5rem', textAlign: 'center' },
  voiceLabel: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#2563EB', textTransform: 'uppercase', marginBottom: '1rem' },
  voiceHeading: { fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 0.75rem', letterSpacing: '-0.02em' },
  voiceSub: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', lineHeight: 1.6 },
  vaWrap: { display: 'flex', justifyContent: 'center' },

  statsSection: { background: '#2563EB', padding: '4rem 2rem', display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' },
  statValue: { fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' },
  statLabel: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' },
};

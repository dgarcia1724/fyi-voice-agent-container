'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { AIConversation } from '@/components/ui/AIConversation';

type Tab = 'contacts' | 'chats' | 'ai' | 'projects' | 'profile';

export type SharedMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source: 'chat' | 'voice';
};

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('ai');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div style={s.page}>
      <div style={s.content}>
        {tab === 'contacts' && <ContactsView />}
        {tab === 'chats' && <ChatsView />}
        {tab === 'ai' && <AIView />}
        {tab === 'projects' && <ProjectsView />}
        {tab === 'profile' && <ProfileView email={user.email ?? ''} />}
      </div>

      <nav style={s.navbar}>
        <NavItem icon={<ContactsIcon />} label="Contacts" active={tab === 'contacts'} onClick={() => setTab('contacts')} />
        <NavItem icon={<ChatsIcon />} label="Chats" active={tab === 'chats'} onClick={() => setTab('chats')} />
        <NavItem icon={<AIIcon active={tab === 'ai'} />} label="AI" active={tab === 'ai'} onClick={() => setTab('ai')} isCenter />
        <NavItem icon={<ProjectsIcon />} label="Projects" active={tab === 'projects'} onClick={() => setTab('projects')} />
        <NavItem icon={<ProfileIcon />} label="Profile" active={tab === 'profile'} onClick={() => setTab('profile')} />
      </nav>
    </div>
  );
}

function FYILogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="8" fill="white" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Open Sans, sans-serif" fontWeight="900" fontSize="18" fill="#000">
        FYI
      </text>
      <polygon points="8,48 8,42 16,48" fill="white" />
    </svg>
  );
}

function PageHeader({ title, aiLogo }: { title: string; aiLogo?: boolean }) {
  return (
    <div style={s.header}>
      {aiLogo ? (
        <div style={s.aiHeader}>
          <FYILogo />
          <span style={s.pageTitle}>{title}</span>
        </div>
      ) : (
        <span style={s.pageTitle}>{title}</span>
      )}
    </div>
  );
}

function AIView() {
  const [messages, setMessages] = useState<SharedMessage[]>([]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: '72px' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99, background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/ai-persona.jpg"
            alt="Fyiona"
            style={{ width: '62px', height: '62px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Fyiona</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>AI Persona</div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 8px' }}
          >
            + New chat
          </button>
        )}
      </div>
      <AIConversation messages={messages} setMessages={setMessages} />
    </div>
  );
}

function ProfileView({ email }: { email: string }) {
  const initial = email.charAt(0).toUpperCase();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem 1.5rem 1rem' }}>
        <span style={s.pageTitle}>Profile</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: '#1c1c1e', margin: '0 1rem', borderRadius: '16px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {initial}
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>{email.split('@')[0]}</div>
          <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.4)' }}>{email}</div>
        </div>
      </div>
    </div>
  );
}

function ProjectsView() {
  const [projTab, setProjTab] = useState<'yours' | 'shared' | 'followed'>('yours');
  const tabs = ['yours', 'shared', 'followed'] as const;

  const projects = [
    { name: 'Muscle', time: '2 hrs ago', bg: '#2a2a2a', emoji: '💪' },
    { name: 'Build ai voice assist...', time: 'Yesterday', bg: '#1a2a1a', emoji: '🐕' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem 0.75rem' }}>
        <span style={s.pageTitle}>Projects</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', padding: '0 1.5rem', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setProjTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.6rem 0',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: projTab === t ? '#fff' : 'rgba(255,255,255,0.35)',
            borderBottom: projTab === t ? '2px solid #2563EB' : '2px solid transparent',
            marginBottom: '-1px',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem' }}>
        {projects.map((p, i) => (
          <div key={i} style={{ borderRadius: '14px', overflow: 'hidden', background: '#1c1c1e', cursor: 'pointer' }}>
            {/* Thumbnail */}
            <div style={{ height: '130px', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
              {p.emoji}
            </div>
            {/* Info */}
            <div style={{ padding: '0.6rem 0.75rem 0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{p.time}</span>
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatsView() {
  const [chatTab, setChatTab] = useState<'all' | 'groups' | 'projects' | 'calls'>('all');
  const tabs = ['all', 'groups', 'projects', 'calls'] as const;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem 0.75rem' }}>
        <span style={s.pageTitle}>Chat</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', padding: '0 1.5rem', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setChatTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.6rem 0',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: chatTab === t ? '#fff' : 'rgba(255,255,255,0.35)',
            borderBottom: chatTab === t ? '2px solid #2563EB' : '2px solid transparent',
            marginBottom: '-1px',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Chat rows */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem 1rem', gap: '0.75rem' }}>
        {/* Row 1 — plain dark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', background: '#1c1c1e', borderRadius: '14px', padding: '0.85rem 1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#333', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>🐕</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Build ai voice assistant</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginLeft: '0.5rem' }}>Yesterday</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="3,9 21,9"/><path d="m9 21 3-3 3 3"/><line x1="12" y1="9" x2="12" y2="21"/></svg>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>Attachments: image</span>
            </div>
          </div>
        </div>

        {/* Row 2 — blue border */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', background: '#0d1526', border: '1.5px solid #2563EB', borderRadius: '14px', padding: '0.85rem 1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#1a3a8f', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="9" cy="9" r="1.5" fill="#2563EB" stroke="none"/>
              <circle cx="15" cy="9" r="1.5" fill="#2563EB" stroke="none"/>
              <path d="M9 15h6" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>FYI.FYI</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginLeft: '0.5rem' }}>Yesterday</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              Welcome to FYI, the ultimate productivity t…
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactsView() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem 1rem' }}>
        <span style={s.pageTitle}>Contacts</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>

      {/* Empty state */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '1.25rem' }}>
        {/* Blue add-contact icon */}
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="4" />
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          <path d="M19 8v6M22 11h-6" />
        </svg>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
          Invite Contacts
        </h2>

        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.6, margin: 0, maxWidth: '260px' }}>
          You have no contacts on FYI yet.<br />Invite your friends to start chatting!
        </p>

        <button style={{
          background: '#2563EB',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          padding: '1rem 0',
          width: '100%',
          maxWidth: '320px',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: 'pointer',
          marginTop: '0.5rem',
        }}>
          Invite Contacts
        </button>
      </div>
    </div>
  );
}

function BlankView({ title, aiLogo }: { title: string; aiLogo?: boolean }) {
  return (
    <div style={{ flex: 1 }}>
      <PageHeader title={title} aiLogo={aiLogo} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick, isCenter }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  isCenter?: boolean;
}) {
  if (isCenter) {
    return (
      <button style={s.navCenter} onClick={onClick}>
        <div style={{ ...s.aiCircle, background: active ? '#2563EB' : '#333' }}>
          {icon}
        </div>
        <span style={{ ...s.navLabel, color: active ? '#2563EB' : 'rgba(255,255,255,0.5)' }}>{label}</span>
      </button>
    );
  }
  return (
    <button style={s.navItem} onClick={onClick}>
      <div style={{ color: active ? '#2563EB' : 'rgba(255,255,255,0.55)' }}>{icon}</div>
      <span style={{ ...s.navLabel, color: active ? '#2563EB' : 'rgba(255,255,255,0.5)' }}>{label}</span>
    </button>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ContactsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
    </svg>
  );
}

function ChatsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function AIIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 9h.01M15 9h.01M9 15h6" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '80px',
  },
  header: {
    padding: '1.25rem 1.5rem 1rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  navbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: '#1c1c1e',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: '12px',
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0 0',
  },
  navCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 0 0',
  },
  aiCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '-10px',
    transition: 'background 0.2s',
  },
  navLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
  },
};

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function FYILogo() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="8" fill="#2563EB" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill="#fff">
        FYI
      </text>
      <polygon points="8,48 8,42 16,48" fill="#2563EB" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch {
      setError('Could not connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Link href="/" style={s.back}>← Back</Link>

      <motion.div
        style={s.card}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Logo */}
        <div style={s.logoRow}>
          <FYILogo />
        </div>

        <h1 style={s.heading}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={s.subheading}>
          {mode === 'login'
            ? 'Sign in to your FYI workspace'
            : 'Start building with FYI today'}
        </p>

        {/* Tabs */}
        <div style={s.tabs}>
          <button
            type="button"
            style={{ ...s.tab, ...(mode === 'login' ? s.tabActive : {}) }}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign in
          </button>
          <button
            type="button"
            style={{ ...s.tab, ...(mode === 'register' ? s.tabActive : {}) }}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Create account
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            style={s.form}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {mode === 'register' && (
              <div style={s.field}>
                <label style={s.label}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={s.input}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                />
              </div>
            )}

            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={s.input}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={s.input}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={s.error}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ ...s.submit, opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? mode === 'login' ? 'Signing in…' : 'Creating account…'
                : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const focusStyle = { borderColor: '#2563EB', outline: 'none' };
const blurStyle  = { borderColor: 'rgba(255,255,255,0.12)', outline: 'none' };

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  back: {
    position: 'fixed',
    top: '1.5rem',
    left: '1.5rem',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.45)',
    zIndex: 10,
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#111',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '2.5rem',
  },
  logoRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 900,
    color: '#fff',
    textAlign: 'center',
    marginBottom: '0.4rem',
    letterSpacing: '-0.02em',
  },
  subheading: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginBottom: '1.75rem',
  },
  tabs: {
    display: 'flex',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '4px',
    gap: '4px',
    marginBottom: '1.5rem',
  },
  tab: {
    flex: 1,
    padding: '0.55rem',
    borderRadius: '7px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#2563EB',
    color: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.6)',
  },
  input: {
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  error: {
    fontSize: '0.85rem',
    color: '#f87171',
    padding: '0.6rem 0.9rem',
    borderRadius: '8px',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.2)',
  },
  submit: {
    marginTop: '0.5rem',
    padding: '0.85rem',
    background: '#2563EB',
    color: '#fff',
    borderRadius: '999px',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.2s',
  },
};

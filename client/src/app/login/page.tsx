'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function FYILogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="8" fill="#2563EB" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill="#fff">
        FYI
      </text>
      <polygon points="8,48 8,42 16,48" fill="#2563EB" />
    </svg>
  );
}

function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      {error && <div style={s.error}>{error}</div>}
      <label style={s.label}>Email</label>
      <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com" required autoComplete="email" />
      <label style={s.label}>Password</label>
      <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder="••••••••" required autoComplete="current-password" />
      <button style={{ ...s.button, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      {error && <div style={s.error}>{error}</div>}
      <label style={s.label}>Email</label>
      <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com" required autoComplete="email" />
      <label style={s.label}>Password</label>
      <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder="••••••••" required autoComplete="new-password" />
      <button style={{ ...s.button, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
    default: return 'Something went wrong. Please try again.';
  }
}

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div style={s.page}>
      <Link href="/" style={s.back}>← Back</Link>

      <motion.div
        style={s.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div style={s.top}>
          <FYILogo />
          <h1 style={s.brand}>FYI</h1>
        </div>

        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(mode === 'signin' ? s.tabActive : {}) }} onClick={() => setMode('signin')}>
            Sign In
          </button>
          <button style={{ ...s.tab, ...(mode === 'signup' ? s.tabActive : {}) }} onClick={() => setMode('signup')}>
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {mode === 'signin' ? <SignInForm /> : <SignUpForm />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

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
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.4)',
    zIndex: 10,
    textDecoration: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '2.5rem',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#fff',
    margin: 0,
    letterSpacing: '0.06em',
  },
  tabs: {
    display: 'flex',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '4px',
    gap: '4px',
    marginBottom: '2rem',
  },
  tab: {
    flex: 1,
    padding: '0.6rem',
    borderRadius: '9px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.9rem',
    fontWeight: 700,
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
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
  },
  input: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    padding: '0.75rem 1rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: '0.75rem',
  },
  button: {
    marginTop: '0.5rem',
    background: '#2563EB',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    padding: '0.85rem',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    width: '100%',
  },
  error: {
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '0.85rem',
    padding: '0.75rem 1rem',
    marginBottom: '0.75rem',
  },
};

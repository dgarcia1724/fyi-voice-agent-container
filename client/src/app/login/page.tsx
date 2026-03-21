'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  return (
    <div style={s.page}>
      <Link href="/" style={s.back}>← Back</Link>

      <motion.div
        style={s.wrapper}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div style={s.logoRow}>
          <FYILogo />
        </div>

        <SignIn
          routing="hash"
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: '#2563EB',
              colorBackground: '#111111',
              colorText: '#ffffff',
              colorTextSecondary: 'rgba(255,255,255,0.5)',
              colorInputBackground: 'rgba(255,255,255,0.05)',
              colorInputText: '#ffffff',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
            },
            elements: {
              card: {
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                boxShadow: 'none',
              },
              headerTitle: { display: 'none' },
              headerSubtitle: { display: 'none' },
              socialButtonsBlockButton: {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                borderRadius: '8px',
              },
              formButtonPrimary: {
                background: '#2563EB',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              },
              footerActionLink: { color: '#2563EB' },
              identityPreviewEditButton: { color: '#2563EB' },
            },
          }}
        />
      </motion.div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
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
    textDecoration: 'none',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  logoRow: {
    display: 'flex',
    justifyContent: 'center',
  },
};

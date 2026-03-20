'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeContent } from '@/components/ui/FadeContent';
import { BlurText } from '@/components/ui/BlurText';
import { ScrollVelocity } from '@/components/ui/ScrollVelocity';

function FYILogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="8" fill="white" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill="#000">
        FYI
      </text>
      <polygon points="8,48 8,42 16,48" fill="white" />
    </svg>
  );
}

const FEATURES = [
  {
    title: 'AI CREATIVE ASSISTANT',
    body: 'FYI.Ai is your creative co-pilot. Ask FYI.Ai to draft stories, song lyrics, product descriptions, marketing copy, or any written content — and see the results within seconds.',
    bg: '#000',
  },
  {
    title: 'TURN YOUR IDEAS INTO PROJECTS',
    body: 'Organize your creative work intelligently. FYI identifies gaps, creates action plans, and keeps every project on track from first idea to final delivery.',
    bg: '#2563EB',
  },
  {
    title: 'MAKE CONTENT CALLS',
    body: 'Share and sync content on calls more easily than any other app. Make one-on-one or group calls with contacts around the world. All files shared on a call are saved in your history, accessible anytime.',
    bg: '#000',
  },
  {
    title: 'SECURE MESSAGING',
    body: 'Unlimited file transfers with military-grade encryption — ECDHE and ECDSA, the same cryptography securing Bitcoin. Your creative work stays private.',
    bg: '#2563EB',
  },
];

const STATS = [
  { value: '10k+', label: 'Creatives' },
  { value: '98%', label: 'Satisfaction' },
  { value: '3×', label: 'Faster delivery' },
  { value: '∞', label: 'File transfers' },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#000' }}>

      {/* ── HERO (blue) ───────────────────────── */}
      <section style={s.hero}>
        {/* NAV */}
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

        {/* HERO CONTENT */}
        <div style={s.heroContent}>
          <div style={s.heroLeft}>
            <BlurText
              text="FYI is the ultimate productivity tool for creatives 🔥"
              delay={60}
              animateBy="words"
              className="hero-headline"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              style={{ marginTop: '2.5rem' }}
            >
              <Link href="/login">
                <button style={s.downloadBtn}>GET STARTED FREE</button>
              </Link>
            </motion.div>
          </div>

          {/* App mockup */}
          <motion.div
            style={s.mockup}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div style={s.mockupScreen}>
              <div style={s.mockupBar}>
                <div style={{ ...s.mockupDot, background: '#ff5f57' }} />
                <div style={{ ...s.mockupDot, background: '#febc2e' }} />
                <div style={{ ...s.mockupDot, background: '#28c840' }} />
                <span style={s.mockupTitle}>FYI</span>
              </div>
              <div style={s.mockupBody}>
                <div style={s.mockupSidebar}>
                  {['Design Team', 'Marketing', 'Dev Squad', 'Podcast'].map((c) => (
                    <div key={c} style={s.mockupChan}>{c}</div>
                  ))}
                </div>
                <div style={s.mockupChat}>
                  <div style={s.bubbleBlue}>Can you start a project to keep track of all Formula 1 races?</div>
                  <div style={s.bubbleDark}>Absolutely! Here you go. 🏎️</div>
                  <div style={s.bubbleBlue}>Generate a race recap for the last GP</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── VELOCITY STRIP ───────────────────── */}
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

      {/* ── STATS (black) ────────────────────── */}
      <section style={{ ...s.section, background: '#000', paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div style={s.statsGrid}>
          {STATS.map((stat, i) => (
            <FadeContent key={stat.label} delay={i * 0.1} direction="up">
              <div style={s.statItem}>
                <span style={s.statValue}>{stat.value}</span>
                <span style={s.statLabel}>{stat.label}</span>
              </div>
            </FadeContent>
          ))}
        </div>
      </section>

      {/* ── FEATURE SECTIONS ─────────────────── */}
      {FEATURES.map((f, i) => (
        <section
          key={f.title}
          style={{ ...s.featureSection, background: f.bg }}
        >
          <FadeContent direction="up">
            <div style={s.featureInner}>
              <h2 style={{ ...s.featureTitle, color: f.bg === '#000' ? '#fff' : '#fff' }}>
                {f.title}
              </h2>
              <p style={s.featureBody}>{f.body}</p>
              <button style={f.bg === '#000' ? s.btnBlue : s.btnWhite}>
                {f.bg === '#000' ? 'LEARN MORE' : 'READ MORE'}
              </button>
            </div>
          </FadeContent>
        </section>
      ))}

      {/* ── HOW IT WORKS (black) ─────────────── */}
      <section style={{ ...s.section, background: '#000', paddingTop: '6rem', paddingBottom: '6rem' }}>
        <FadeContent direction="up">
          <div style={s.sectionCenter}>
            <p style={s.eyebrow}>SIMPLE BY DESIGN</p>
            <h2 style={s.sectionTitle}>From idea to launch in minutes</h2>
          </div>
        </FadeContent>
        <div style={s.stepsGrid}>
          {[
            { n: '01', title: 'Spark an idea', body: 'Describe your creative vision to FYI. It generates a first draft instantly.' },
            { n: '02', title: 'Refine together', body: 'Iterate through feedback loops. Invite your team to collaborate in real time.' },
            { n: '03', title: 'Ship it', body: 'Manage deadlines, share files, schedule calls — all inside FYI. Never switch apps.' },
          ].map((step, i) => (
            <FadeContent key={step.n} delay={i * 0.15} direction="up">
              <div style={s.stepCard}>
                <span style={s.stepNum}>{step.n}</span>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepBody}>{step.body}</p>
              </div>
            </FadeContent>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA (blue) ─────────────────── */}
      <section style={{ ...s.featureSection, background: '#2563EB' }}>
        <FadeContent direction="up">
          <div style={s.featureInner}>
            <h2 style={{ ...s.featureTitle, color: '#fff' }}>
              READY TO CREATE MORE?
            </h2>
            <p style={s.featureBody}>
              Join thousands of creatives who have already made FYI their home.
            </p>
            <Link href="/login">
              <button style={s.btnWhite}>GET STARTED FREE</button>
            </Link>
          </div>
        </FadeContent>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FYILogo size={32} />
            <span style={s.footerBrand}>FYI</span>
          </div>
          <p style={s.footerCopy}>© 2025 FYI. Built for creatives.</p>
          <div style={s.footerLinks}>
            {['Privacy', 'Terms', 'Security', 'Contact'].map((l) => (
              <a key={l} href="#" style={s.footerLink}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        .hero-headline {
          font-size: clamp(2.5rem, 6vw, 5.5rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1.08;
          color: #ffffff;
          justify-content: flex-start;
        }
        .velocity-text {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  /* HERO */
  hero: {
    background: '#2563EB',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
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
  heroContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4rem 3rem 5rem',
    gap: '3rem',
    maxWidth: '1300px',
    margin: '0 auto',
    width: '100%',
  },
  heroLeft: {
    flex: 1,
    maxWidth: '600px',
  },

  /* MOCKUP */
  mockup: {
    flex: 1,
    maxWidth: '540px',
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

  /* STRIP */
  strip: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '1.25rem 0',
    overflow: 'hidden',
    background: '#000',
  },

  /* STATS */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '0 2rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '3.5rem',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 600,
  },

  /* FEATURE SECTIONS */
  featureSection: {
    padding: '6rem 3rem',
  },
  featureInner: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  featureTitle: {
    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
    fontWeight: 900,
    letterSpacing: '0.02em',
    lineHeight: 1.1,
    color: '#fff',
  },
  featureBody: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.75,
    maxWidth: '620px',
  },

  /* BUTTONS */
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
  },

  /* HOW IT WORKS */
  section: {
    padding: '5rem 3rem',
  },
  sectionCenter: {
    textAlign: 'center',
    marginBottom: '4rem',
    maxWidth: '1200px',
    margin: '0 auto 4rem',
  },
  eyebrow: {
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#2563EB',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    color: '#fff',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  stepCard: {
    padding: '2.5rem 2rem',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#111',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  stepNum: {
    fontSize: '3.5rem',
    fontWeight: 900,
    color: '#2563EB',
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  stepTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#fff',
  },
  stepBody: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.7,
  },

  /* FOOTER */
  footer: {
    background: '#000',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '2rem 3rem',
  },
  footerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap' as const,
  },
  footerBrand: {
    fontSize: '1.1rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    color: '#fff',
  },
  footerCopy: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.35)',
    marginRight: 'auto',
  },
  footerLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  footerLink: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
  },
};

'use client';

import { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  AudioTrack,
  useVoiceAssistant,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useAuth } from '@/lib/AuthContext';

type Phase = 'idle' | 'connecting' | 'active' | 'error';

export function VoiceAgent() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lkToken, setLkToken] = useState('');
  const [lkUrl, setLkUrl] = useState('');

  async function start() {
    if (!user) return;
    setPhase('connecting');
    setErrorMsg('');
    // Unlock AudioContext during the user gesture so subsequent audio.play() calls succeed
    try { const ctx = new AudioContext(); await ctx.resume(); ctx.close(); } catch {}
    try {
      const res = await fetch(`http://localhost:3000/api/livekit/token?uid=${user.uid}`);
      if (!res.ok) throw new Error('Failed to get token');
      const { token, url } = await res.json();
      setLkToken(token);
      setLkUrl(url);
      setPhase('active');
    } catch (e: any) {
      setErrorMsg(e.message || 'Connection failed');
      setPhase('error');
    }
  }

  function stop() {
    setPhase('idle');
    setLkToken('');
    setLkUrl('');
  }

  if (phase === 'active') {
    return (
      <LiveKitRoom
        token={lkToken}
        serverUrl={lkUrl}
        connect
        audio
        onDisconnected={stop}
        style={{ display: 'contents' }}
      >
        <VoiceAgentRoom onStop={stop} />
      </LiveKitRoom>
    );
  }

  return (
    <div style={s.wrap}>
      <p style={s.statusLabel}>{phase === 'error' ? 'Something went wrong' : 'Tap to talk to FYI'}</p>
      <div style={s.buttonWrap}>
        <button
          style={{ ...s.micBtn, background: '#1c1c1e', border: '1.5px solid rgba(255,255,255,0.15)' }}
          onClick={start}
          disabled={phase === 'connecting'}
        >
          {phase === 'connecting' ? <SpinnerIcon /> : <MicIcon />}
        </button>
      </div>
      {phase === 'error' && <p style={s.error}>{errorMsg}</p>}
      <style>{pulseKeyframes}</style>
    </div>
  );
}

function VoiceAgentRoom({ onStop }: { onStop: () => void }) {
  const { state } = useVoiceAssistant();
  const room = useRoomContext();

  // Must be called after user gesture to unblock browser autoplay
  useEffect(() => { room.startAudio(); }, [room]);

  // Get all remote audio tracks and render them explicitly
  const tracks = useTracks([Track.Source.Microphone, Track.Source.Unknown], { onlySubscribed: true });
  const remoteAudioTracks = tracks.filter(t => !t.participant.isLocal);

  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';

  const label = isSpeaking
    ? 'FYI is speaking…'
    : isListening
    ? 'Listening…'
    : state === 'thinking'
    ? 'Thinking…'
    : 'Connected';

  return (
    <div style={s.wrap}>
      {/* Render each remote audio track explicitly */}
      {remoteAudioTracks.map(t => (
        <AudioTrack key={t.publication.trackSid} trackRef={t} />
      ))}
      <p style={s.statusLabel}>{label}</p>
      <div style={s.buttonWrap}>
        {isSpeaking && (
          <>
            <div style={{ ...s.ring, animationDelay: '0s' }} />
            <div style={{ ...s.ring, animationDelay: '0.3s' }} />
            <div style={{ ...s.ring, animationDelay: '0.6s' }} />
          </>
        )}
        {isListening && <div style={s.listeningRing} />}
        <button
          style={{ ...s.micBtn, background: '#2563EB', border: 'none' }}
          onClick={onStop}
        >
          <StopIcon />
        </button>
      </div>
      <style>{pulseKeyframes}</style>
    </div>
  );
}

const pulseKeyframes = `
@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(1.8); opacity: 0; }
}
@keyframes listen-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.8; transform: scale(1.05); }
}
@keyframes spin { to { transform: rotate(360deg); } }
`;

function MicIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'spin 0.8s linear infinite' }} />
    </svg>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
    padding: '3rem 1.5rem',
  },
  statusLabel: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    letterSpacing: '0.01em',
    textAlign: 'center',
  },
  buttonWrap: {
    position: 'relative',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '2px solid #2563EB',
    animation: 'pulse-ring 1.5s ease-out infinite',
  },
  listeningRing: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '2px solid rgba(37,99,235,0.5)',
    animation: 'listen-pulse 1.5s ease-in-out infinite',
  },
  micBtn: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    zIndex: 1,
  },
  error: {
    fontSize: '0.85rem',
    color: '#f87171',
    textAlign: 'center',
    margin: 0,
  },
};

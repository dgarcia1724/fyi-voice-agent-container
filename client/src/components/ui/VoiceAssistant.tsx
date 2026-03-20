'use client';

import { useState, useCallback } from 'react';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

function AgentSession({ onEnd }: { onEnd: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  const labels: Record<string, string> = {
    listening: 'Listening…',
    thinking:  'Thinking…',
    speaking:  'Speaking…',
    idle:      'Connected',
  };
  return (
    <div style={s.session}>
      <RoomAudioRenderer />
      <div style={s.vizWrap}>
        <BarVisualizer state={state} trackRef={audioTrack} style={s.viz} barCount={28} />
      </div>
      <p style={s.stateLabel}>{labels[state] ?? 'Connecting…'}</p>
      <button onClick={onEnd} style={s.endBtn}>END CALL</button>
    </div>
  );
}

export function VoiceAssistant() {
  const [token,     setToken]     = useState<string | null>(null);
  const [roomName,  setRoomName]  = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState('ws://localhost:7880');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const jwt = localStorage.getItem('token');
      const res = await fetch('/api/livekit/token', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error('Token request failed');
      const data = await res.json();
      setServerUrl(data.url);
      setRoomName(data.roomName);
      setToken(data.token);
    } catch {
      setError('Could not connect. Make sure the voice server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  const end = useCallback(() => {
    setToken(null);
    setRoomName(null);
    setError(null);
  }, []);

  if (!token) {
    return (
      <div style={s.idle}>
        <div style={s.micRing}>
          <button onClick={start} disabled={loading} style={s.micBtn} aria-label="Start voice call">
            {loading ? '…' : '🎙️'}
          </button>
        </div>
        <button onClick={start} disabled={loading} style={s.startBtn}>
          {loading ? 'CONNECTING…' : 'TALK TO FYI AI'}
        </button>
        {error && <p style={s.error}>{error}</p>}
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      audio={true}
      video={false}
      onDisconnected={end}
      style={{ display: 'contents' }}
    >
      <AgentSession onEnd={end} />
    </LiveKitRoom>
  );
}

const s: Record<string, React.CSSProperties> = {
  idle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.25rem',
  },
  micRing: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    border: '2px solid rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    background: '#fff',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    padding: '0.75rem 2.2rem',
    background: '#fff',
    color: '#000',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    border: 'none',
    cursor: 'pointer',
  },
  error: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    maxWidth: '280px',
    lineHeight: 1.5,
  },
  session: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
  },
  vizWrap: {
    width: '100%',
    height: '64px',
    borderRadius: '12px',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viz: { width: '100%', height: '100%' },
  stateLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  endBtn: {
    padding: '0.6rem 1.75rem',
    background: 'transparent',
    border: '2px solid rgba(255,255,255,0.4)',
    borderRadius: '999px',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.06em',
  },
};

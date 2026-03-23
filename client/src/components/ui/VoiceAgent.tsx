'use client';

import { useState, useEffect, useRef } from 'react';
import {
  LiveKitRoom,
  AudioTrack,
  useVoiceAssistant,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { Track, RoomEvent, ConnectionState } from 'livekit-client';
import { useAuth } from '@/lib/AuthContext';
import type { SharedMessage } from '@/app/dashboard/page';

type Phase = 'idle' | 'connecting' | 'active' | 'error';

interface VoiceAgentProps {
  messages: SharedMessage[];
  onVoiceMessage: (msg: SharedMessage) => void;
}

export function VoiceAgent({ messages, onVoiceMessage }: VoiceAgentProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lkToken, setLkToken] = useState('');
  const [lkUrl, setLkUrl] = useState('');

  async function start() {
    if (!user) return;
    setPhase('connecting');
    setErrorMsg('');
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
        onError={(err) => { setErrorMsg(err.message); setPhase('error'); }}
        style={{ display: 'contents' }}
      >
        <VoiceAgentRoom onStop={stop} sharedMessages={messages} onVoiceMessage={onVoiceMessage} />
      </LiveKitRoom>
    );
  }

  return (
    <div style={s.idleWrap}>
      <p style={s.statusLabel}>
        {phase === 'error' ? errorMsg || 'Something went wrong' : 'Tap to start voice conversation'}
      </p>
      <button
        style={{ ...s.micBtn, background: phase === 'connecting' ? '#1c1c1e' : '#2563EB', border: phase === 'connecting' ? '1.5px solid rgba(255,255,255,0.15)' : 'none' }}
        onClick={start}
        disabled={phase === 'connecting'}
      >
        {phase === 'connecting' ? <SpinnerIcon /> : <MicIcon />}
      </button>
      {phase === 'error' && (
        <button style={s.retryBtn} onClick={() => setPhase('idle')}>Try again</button>
      )}
      <style>{keyframes}</style>
    </div>
  );
}

type InterimEntry = { role: 'user' | 'assistant'; content: string };

function VoiceAgentRoom({
  onStop,
  sharedMessages,
  onVoiceMessage,
}: {
  onStop: () => void;
  sharedMessages: SharedMessage[];
  onVoiceMessage: (msg: SharedMessage) => void;
}) {
  const { state } = useVoiceAssistant();
  const room = useRoomContext();
  // In-progress (non-final) segments only — not committed to shared state
  const [interimMessages, setInterimMessages] = useState<Map<string, InterimEntry>>(new Map());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    room.startAudio();

    // Send conversation history to the Python agent via data channel.
    // Must wait until the room peer connection is fully open.
    const sendHistory = () => {
      if (sharedMessages.length === 0) return;
      try {
        const payload = new TextEncoder().encode(JSON.stringify({
          type: 'conversation_history',
          messages: sharedMessages.map(m => ({ role: m.role, content: m.content })),
        }));
        room.localParticipant.publishData(payload, { reliable: true } as any);
      } catch {
        // Room closed during teardown — ignore
      }
    };

    if (room.state === ConnectionState.Connected) {
      sendHistory();
    } else {
      room.once(RoomEvent.Connected, sendHistory);
    }

    return () => {
      room.off(RoomEvent.Connected, sendHistory);
    };
  }, [room]);

  // Scroll to bottom whenever display messages change
  const displayMessages: SharedMessage[] = [
    ...sharedMessages,
    ...[...interimMessages.entries()].map(([id, m]) => ({
      id,
      role: m.role,
      content: m.content,
      source: 'voice' as const,
    })),
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length]);

  useEffect(() => {
    const onTranscription = (segments: any[], participant: any) => {
      const role: 'user' | 'assistant' = participant?.isLocal ? 'user' : 'assistant';
      segments.forEach((seg: any) => {
        if (!seg.text?.trim()) return;
        if (seg.final) {
          // Commit to shared state, remove from interim
          onVoiceMessage({ id: seg.id, role, content: seg.text, source: 'voice' });
          setInterimMessages(prev => {
            const m = new Map(prev);
            m.delete(seg.id);
            return m;
          });
        } else {
          // Update interim display only
          setInterimMessages(prev => new Map(prev).set(seg.id, { role, content: seg.text }));
        }
      });
    };
    room.on(RoomEvent.TranscriptionReceived, onTranscription);
    return () => { room.off(RoomEvent.TranscriptionReceived, onTranscription); };
  }, [room, onVoiceMessage]);

  const tracks = useTracks([Track.Source.Microphone, Track.Source.Unknown], { onlySubscribed: true });
  const remoteAudioTracks = tracks.filter(t => !t.participant.isLocal);

  const statusLabel =
    state === 'speaking' ? 'FYI is speaking…' :
    state === 'listening' ? 'Listening…' :
    state === 'thinking' ? 'Thinking…' : 'Connected';

  const isActive = state === 'speaking' || state === 'listening';

  return (
    <div style={s.roomRoot}>
      {remoteAudioTracks.map(t => (
        <AudioTrack key={t.publication.trackSid} trackRef={t} />
      ))}

      {/* Unified transcript */}
      <div style={s.messages}>
        {displayMessages.length === 0 && (
          <div style={s.emptyState}>
            <p style={s.emptyText}>Start speaking — your conversation will appear here</p>
          </div>
        )}
        {displayMessages.map(msg => (
          msg.role === 'user' ? (
            <div key={msg.id} style={s.userRow}>
              <div style={s.userBubble}>{msg.content}</div>
            </div>
          ) : (
            <div key={msg.id} style={s.agentRow}>
              <div style={s.agentBubble}>{msg.content}</div>
            </div>
          )
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer: status + stop button */}
      <div style={s.footer}>
        <p style={s.footerLabel}>{statusLabel}</p>
        <div style={s.btnWrap}>
          {isActive && <div style={s.pulse} />}
          <button style={s.stopBtn} onClick={onStop}>
            <StopIcon />
          </button>
        </div>
      </div>

      <style>{keyframes}</style>
    </div>
  );
}

const keyframes = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(1.9); opacity: 0; }
}
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
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
  idleWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    padding: '3rem 1.5rem',
  },
  statusLabel: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    textAlign: 'center',
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
  },
  retryBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.6)',
    borderRadius: '8px',
    padding: '6px 16px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  roomRoot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem 1rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.9rem',
    textAlign: 'center',
    margin: 0,
  },
  userRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  userBubble: {
    background: '#2c2c2e',
    color: '#fff',
    borderRadius: '18px',
    padding: '0.65rem 1rem',
    maxWidth: '75%',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  agentRow: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  agentBubble: {
    color: '#fff',
    fontSize: '0.95rem',
    lineHeight: 1.7,
    maxWidth: '90%',
  },
  footer: {
    padding: '0.75rem 1.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  footerLabel: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.01em',
  },
  btnWrap: {
    position: 'relative',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '2px solid #2563EB',
    animation: 'pulse-ring 1.4s ease-out infinite',
    pointerEvents: 'none',
  },
  stopBtn: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#2563EB',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1,
  },
};

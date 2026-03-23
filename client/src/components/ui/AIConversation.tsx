'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
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

interface Props {
  messages: SharedMessage[];
  setMessages: React.Dispatch<React.SetStateAction<SharedMessage[]>>;
}

type InterimEntry = { role: 'user' | 'assistant'; content: string };
type InterimMap = Map<string, InterimEntry>;

export function AIConversation({ messages, setMessages }: Props) {
  const { user } = useAuth();

  // Text chat
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendTextRef = useRef(sendText);
  sendTextRef.current = sendText;

  // Voice (LiveKit)
  const [lkToken, setLkToken] = useState('');
  const [lkUrl, setLkUrl] = useState('');
  const [voiceActive, setVoiceActive] = useState(false);
  const [agentState, setAgentState] = useState('');
  const [interimMap, setInterimMap] = useState<InterimMap>(new Map());

  const bottomRef = useRef<HTMLDivElement>(null);

  // Pre-fetch LiveKit token on mount so voice is instant when tapped
  useEffect(() => {
    if (!user) return;
    prefetchToken();
  }, [user]);

  async function prefetchToken() {
    try {
      const res = await fetch(`http://localhost:3000/api/livekit/token?uid=${user!.uid}`);
      if (!res.ok) return;
      const { token, url } = await res.json();
      setLkToken(token);
      setLkUrl(url);
      // Pre-warm mic permission so setMicrophoneEnabled(true) is instant on tap
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch {}
    } catch {}
  }

  // Scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading, interimMap.size]);

  // ── Text chat ─────────────────────────────────────────────────────────────

  async function sendText(text: string) {
    const userMsg: SharedMessage = { id: crypto.randomUUID(), role: 'user', content: text, source: 'chat' };
    const placeholder: SharedMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', source: 'chat' };
    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg, placeholder]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...historyForApi, { role: 'user', content: text }] }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Something went wrong. Please try again.',
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function send() {
    const text = input.trim();
    if (!text || loading || voiceActive) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    sendText(text);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function onInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  // ── Voice ─────────────────────────────────────────────────────────────────

  function startVoice() {
    if (!lkToken) return;
    try { const ctx = new AudioContext(); ctx.resume(); ctx.close(); } catch {}
    setVoiceActive(true);
  }

  function stopVoice() {
    setVoiceActive(false);
    setAgentState('');
    setInterimMap(new Map());
    // Pre-fetch fresh token immediately for next session
    setLkToken('');
    setLkUrl('');
    prefetchToken();
  }

  // ── Display ───────────────────────────────────────────────────────────────

  const displayMessages: SharedMessage[] = [
    ...messages,
    ...[...interimMap.entries()].map(([id, m]) => ({
      id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      source: 'voice' as const,
    })),
  ];

  const isEmpty = displayMessages.length === 0;

  const voiceLabel =
    agentState === 'speaking' ? 'FYI is speaking…' :
    agentState === 'thinking' ? 'Thinking…' :
                                'Listening…';

  const voicePulsing = agentState === 'speaking' || agentState === 'listening';

  return (
    <div style={s.root}>

      {/* LiveKit room — hidden, pre-connected. Audio only flows when voiceActive=true */}
      {lkToken && lkUrl && (
        <LiveKitRoom
          token={lkToken}
          serverUrl={lkUrl}
          connect
          audio={false}
          onDisconnected={stopVoice}
          onError={() => stopVoice()}
          style={{ display: 'none' }}
        >
          <VoiceSessionManager
            active={voiceActive}
            sharedMessages={messages}
            onVoiceMessage={msg => setMessages(prev => [...prev, msg])}
            onInterimUpdate={setInterimMap}
            onAgentStateChange={setAgentState}
          />
        </LiveKitRoom>
      )}

      {/* Message thread */}
      <div style={s.messages}>
        <div style={s.messagesInner}>
        {isEmpty && (
          <div style={s.emptyState}>
            <p style={s.emptyHeading}>How can I help you today?</p>
          </div>
        )}

        {displayMessages.map((msg, i) => {
          const isLastAI = msg.role === 'assistant' && i === displayMessages.length - 1;
          const isStreaming = isLastAI && loading && msg.source === 'chat';

          return msg.role === 'user' ? (
            <div key={msg.id} style={s.userRow}>
              <div style={s.userBubble}>{msg.content}</div>
            </div>
          ) : (
            <div key={msg.id} style={s.aiBubble}>
              {isStreaming
                ? msg.content
                : <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>}
              {isStreaming && <span style={s.cursor}>|</span>}
            </div>
          );
        })}

        <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area: text bar ↔ voice status bar */}
      <div style={s.inputWrap}>
        <div style={s.inputInner}>
        {voiceActive ? (
          <div style={s.voiceBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <div style={{
                ...s.voiceDot,
                animation: voicePulsing ? 'pulse-dot 1.4s ease-out infinite' : 'none',
                background: voicePulsing ? '#2563EB' : 'rgba(255,255,255,0.3)',
              }} />
              <span style={s.voiceLabel}>{voiceLabel}</span>
            </div>
            <button style={s.stopBtn} onClick={stopVoice}>
              <StopIcon />
            </button>
          </div>
        ) : (
          <>
            {!isEmpty && (
              <div style={s.newChatRow}>
                <button style={s.newChatBtn} onClick={() => setMessages([])}>+ New chat</button>
              </div>
            )}
            <div style={s.inputBar}>
              <textarea
                ref={textareaRef}
                style={s.textarea}
                value={input}
                onChange={onInputChange}
                onKeyDown={onKeyDown}
                placeholder="Ask anything"
                rows={1}
                disabled={loading}
              />
              {input.trim() && (
                <button style={s.sendBtn} onClick={send} disabled={loading}>
                  <SendIcon />
                </button>
              )}
              <button
                style={{ ...s.micBtn, opacity: lkToken ? 1 : 0.45 }}
                onClick={startVoice}
                disabled={!lkToken}
                title={lkToken ? 'Start voice conversation' : 'Connecting…'}
              >
                {lkToken ? <MicIcon /> : <SpinnerIcon />}
              </button>
            </div>
          </>
        )}
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

// ── VoiceSessionManager ───────────────────────────────────────────────────────
// Must live inside <LiveKitRoom> to use livekit hooks.

function VoiceSessionManager({
  active,
  sharedMessages,
  onVoiceMessage,
  onInterimUpdate,
  onAgentStateChange,
}: {
  active: boolean;
  sharedMessages: SharedMessage[];
  onVoiceMessage: (msg: SharedMessage) => void;
  onInterimUpdate: React.Dispatch<React.SetStateAction<InterimMap>>;
  onAgentStateChange: (state: string) => void;
}) {
  const { state } = useVoiceAssistant();
  const room = useRoomContext();
  const tracks = useTracks([Track.Source.Microphone, Track.Source.Unknown], { onlySubscribed: true });
  const remoteAudioTracks = tracks.filter(t => !t.participant.isLocal);

  // Propagate agent state to parent
  useEffect(() => {
    onAgentStateChange(state ?? '');
  }, [state, onAgentStateChange]);

  // Send history as soon as room connects (pre-warm) so agent session starts immediately
  useEffect(() => {
    const sendHistory = () => {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({
          type: 'conversation_history',
          messages: sharedMessages.map(m => ({ role: m.role, content: m.content })),
        }));
        room.localParticipant.publishData(payload, { reliable: true } as any);
      } catch {}
    };
    if (room.state === ConnectionState.Connected) sendHistory();
    else room.once(RoomEvent.Connected, sendHistory);
    return () => { room.off(RoomEvent.Connected, sendHistory); };
  }, [room]);

  // startAudio needs a user gesture — only call when mic is tapped
  useEffect(() => {
    if (!active) return;
    room.startAudio();
  }, [room, active]);

  // Explicitly enable/disable the microphone when active changes
  useEffect(() => {
    room.localParticipant.setMicrophoneEnabled(active).catch(() => {});
  }, [room, active]);

  // Transcription — interim for streaming, final for shared state
  useEffect(() => {
    const onTranscription = (segments: any[], participant: any) => {
      const role: 'user' | 'assistant' = participant?.isLocal ? 'user' : 'assistant';
      segments.forEach((seg: any) => {
        if (!seg.text?.trim()) return;
        if (seg.final) {
          onVoiceMessage({ id: seg.id, role, content: seg.text, source: 'voice' });
          onInterimUpdate(prev => { const m = new Map(prev); m.delete(seg.id); return m; });
        } else {
          onInterimUpdate(prev => new Map(prev).set(seg.id, { role, content: seg.text }));
        }
      });
    };
    room.on(RoomEvent.TranscriptionReceived, onTranscription);
    return () => { room.off(RoomEvent.TranscriptionReceived, onTranscription); };
  }, [room, onVoiceMessage, onInterimUpdate]);

  return (
    <>
      {remoteAudioTracks.map(t => (
        <AudioTrack key={t.publication.trackSid} trackRef={t} />
      ))}
    </>
  );
}

// ── Markdown components ───────────────────────────────────────────────────────

const mdComponents = {
  p: ({ children }: any) => <p style={{ margin: '0 0 0.75em 0', lineHeight: 1.7 }}>{children}</p>,
  code: ({ inline, children }: any) =>
    inline
      ? <code style={{ background: '#2c2c2e', borderRadius: '4px', padding: '1px 5px', fontSize: '0.88em', fontFamily: 'monospace' }}>{children}</code>
      : <pre style={{ background: '#1c1c1e', borderRadius: '8px', padding: '1rem', overflowX: 'auto', margin: '0.5em 0' }}>
          <code style={{ fontFamily: 'monospace', fontSize: '0.88em', whiteSpace: 'pre' }}>{children}</code>
        </pre>,
  ul: ({ children }: any) => <ul style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ul>,
  ol: ({ children }: any) => <ol style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ol>,
  li: ({ children }: any) => <li style={{ marginBottom: '0.25em' }}>{children}</li>,
  strong: ({ children }: any) => <strong style={{ fontWeight: 700, color: '#fff' }}>{children}</strong>,
  h1: ({ children }: any) => <h1 style={{ fontSize: '1.2em', fontWeight: 700, margin: '0.75em 0 0.25em' }}>{children}</h1>,
  h2: ({ children }: any) => <h2 style={{ fontSize: '1.1em', fontWeight: 700, margin: '0.75em 0 0.25em' }}>{children}</h2>,
  h3: ({ children }: any) => <h3 style={{ fontSize: '1em', fontWeight: 700, margin: '0.5em 0 0.25em' }}>{children}</h3>,
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'spin 0.8s linear infinite' }} />
    </svg>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse-dot {
  0%   { transform: scale(1);   opacity: 0.8; }
  50%  { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1);   opacity: 0.8; }
}
`;

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    background: '#000',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem 1rem 120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  messagesInner: {
    width: '100%',
    maxWidth: '760px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60%',
    gap: '0.5rem',
  },
  emptyHeading: {
    fontSize: '1.4rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  suggestionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#1c1c1e',
    border: 'none',
    borderRadius: '12px',
    padding: '0.65rem 1.1rem',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
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
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  aiBubble: {
    color: '#fff',
    fontSize: '0.95rem',
    lineHeight: 1.7,
    maxWidth: '90%',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  cursor: {
    display: 'inline-block',
    marginLeft: '1px',
    animation: 'blink 0.7s step-end infinite',
    color: 'rgba(255,255,255,0.7)',
  },
  // Input area
  inputWrap: {
    position: 'fixed',
    bottom: '80px',
    left: 0,
    right: 0,
    padding: '0.5rem 1rem 1rem',
    background: '#000',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputInner: {
    width: '100%',
    maxWidth: '760px',
  },
  newChatRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '0.4rem',
  },
  newChatBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '2px 4px',
  },
  inputBar: {
    display: 'flex',
    alignItems: 'flex-end',
    background: '#1c1c1e',
    borderRadius: '20px',
    padding: '0.55rem 0.6rem 0.55rem 1.1rem',
    gap: '0.5rem',
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.95rem',
    lineHeight: 1.5,
    resize: 'none',
    fontFamily: 'inherit',
    padding: '2px 0',
    overflowY: 'hidden',
  },
  sendBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#2563EB',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: '1px',
  },
  micBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#2563EB',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: '1px',
    transition: 'opacity 0.2s',
  },
  // Voice status bar
  voiceBar: {
    display: 'flex',
    alignItems: 'center',
    background: '#1c1c1e',
    borderRadius: '20px',
    padding: '0.75rem 1rem',
    gap: '0.75rem',
  },
  voiceDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.3s',
  },
  voiceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    letterSpacing: '0.01em',
  },
  stopBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#2563EB',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

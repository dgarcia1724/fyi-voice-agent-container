'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import type { SharedMessage } from '@/app/dashboard/page';

interface ChatViewProps {
  messages: SharedMessage[];
  setMessages: React.Dispatch<React.SetStateAction<SharedMessage[]>>;
}

export function ChatView({ messages, setMessages }: ChatViewProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioQueueRef = useRef<HTMLAudioElement[]>([]);
  const pendingFetchesRef = useRef(0);
  const isPlayingRef = useRef(false);
  const voiceActiveRef = useRef(false);
  const sendTextRef = useRef(sendText);
  sendTextRef.current = sendText;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      cancelSpeech();
      recognitionRef.current?.stop();
    };
  }, []);

  function cancelSpeech() {
    voiceActiveRef.current = false;
    pendingFetchesRef.current = 0;
    audioQueueRef.current.forEach(a => URL.revokeObjectURL(a.src));
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setSpeaking(false);
  }

  function playNext() {
    if (audioQueueRef.current.length === 0) {
      if (pendingFetchesRef.current === 0) {
        isPlayingRef.current = false;
        setSpeaking(false);
        if (voiceActiveRef.current) {
          setTimeout(() => {
            const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SR) return;
            const rec = new SR();
            rec.lang = 'en-US';
            rec.interimResults = false;
            rec.onstart = () => setListening(true);
            rec.onend = () => setListening(false);
            rec.onerror = () => setListening(false);
            rec.onresult = (e: any) => {
              const t = e.results[0][0].transcript.trim();
              if (t) sendTextRef.current(t);
            };
            recognitionRef.current = rec;
            rec.start();
          }, 500);
        }
      }
      return;
    }
    isPlayingRef.current = true;
    const audio = audioQueueRef.current.shift()!;
    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      playNext();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      playNext();
    };
    setSpeaking(true);
    audio.play().catch(() => playNext());
  }

  async function queueSpeech(text: string) {
    if (!text.trim()) return;
    pendingFetchesRef.current++;
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioQueueRef.current.push(new Audio(url));
    } catch {
      // skip on error
    } finally {
      pendingFetchesRef.current--;
      if (!isPlayingRef.current) playNext();
    }
  }

  async function sendText(text: string) {
    const userMsg: SharedMessage = { id: crypto.randomUUID(), role: 'user', content: text, source: 'chat' };
    const placeholder: SharedMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', source: 'chat' };

    // Snapshot current messages for the API call before state update
    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg, placeholder]);
    setLoading(true);

    let sentenceBuffer = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...historyForApi, { role: 'user', content: text }] }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (sentenceBuffer.trim()) {
            queueSpeech(sentenceBuffer.trim());
          }
          break;
        }
        const chunk = decoder.decode(value);
        sentenceBuffer += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });

        const sentenceEnd = /[.!?](\s|$)/;
        let idx: number;
        while ((idx = sentenceBuffer.search(sentenceEnd)) !== -1) {
          const sentence = sentenceBuffer.slice(0, idx + 1).trim();
          queueSpeech(sentence);
          sentenceBuffer = sentenceBuffer.slice(idx + 1).trimStart();
        }
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
    if (!text || loading) return;
    voiceActiveRef.current = false;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    sendText(text);
  }

  function toggleMic() {
    if (speaking) { cancelSpeech(); return; }
    if (listening) { recognitionRef.current?.stop(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.trim();
      if (transcript) { voiceActiveRef.current = true; sendText(transcript); }
    };
    recognitionRef.current = rec;
    rec.start();
  }

  function onInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const isEmpty = messages.length === 0;
  const micActive = listening || speaking;

  return (
    <div style={s.root}>
      <div style={s.messages}>
        {isEmpty && (
          <div style={s.emptyState}>
            <p style={s.emptyHeading}>What's on your mind today?</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastAI = msg.role === 'assistant' && i === messages.length - 1;
          return msg.role === 'user' ? (
            <div key={msg.id} style={s.userRow}>
              <div style={s.userBubble}>{msg.content}</div>
            </div>
          ) : (
            <div key={msg.id} style={s.aiBubble}>
              {isLastAI && loading
                ? msg.content
                : <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>}
              {loading && isLastAI && <span style={s.cursor}>|</span>}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div style={s.inputWrap}>
        {!isEmpty && (
          <div style={s.newChatRow}>
            <button
              style={s.newChatBtn}
              onClick={() => {
                setMessages([]);
                cancelSpeech();
                recognitionRef.current?.stop();
                setListening(false);
              }}
            >
              + New chat
            </button>
          </div>
        )}
        <div style={s.inputBar}>
          <textarea
            ref={textareaRef}
            style={s.textarea}
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            placeholder={listening ? 'Listening…' : 'Ask anything'}
            rows={1}
            disabled={loading || listening}
          />
          {input.trim() && !listening && (
            <button style={s.sendBtn} onClick={send} disabled={loading}>
              <SendIcon />
            </button>
          )}
          <div style={s.micWrap}>
            {micActive && <div style={s.pulseRing} />}
            <button
              style={{ ...s.micBtn, cursor: loading ? 'not-allowed' : 'pointer' }}
              onClick={toggleMic}
              disabled={loading}
            >
              {speaking ? <SpeakerIcon /> : <MicIcon active={listening} />}
            </button>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

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
  h1: ({ children }: any) => <h1 style={{ fontSize: '1.2em', fontWeight: 700, margin: '0.75em 0 0.25em', color: '#fff' }}>{children}</h1>,
  h2: ({ children }: any) => <h2 style={{ fontSize: '1.1em', fontWeight: 700, margin: '0.75em 0 0.25em', color: '#fff' }}>{children}</h2>,
  h3: ({ children }: any) => <h3 style={{ fontSize: '1em', fontWeight: 700, margin: '0.5em 0 0.25em', color: '#fff' }}>{children}</h3>,
};

const css = `
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes pulse-mic {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}
`;

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MicIcon({ active }: { active: boolean }) {
  const color = active ? '#2563EB' : 'rgba(255,255,255,0.5)';
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: '#000' },
  messages: { flex: 1, overflowY: 'auto', padding: '1.5rem 1rem 120px', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  emptyState: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60%' },
  emptyHeading: { fontSize: '1.4rem', fontWeight: 600, color: '#fff', textAlign: 'center', margin: 0 },
  userRow: { display: 'flex', justifyContent: 'flex-end' },
  userBubble: { background: '#2c2c2e', color: '#fff', borderRadius: '18px', padding: '0.65rem 1rem', maxWidth: '75%', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  aiBubble: { color: '#fff', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '90%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  cursor: { display: 'inline-block', marginLeft: '1px', animation: 'blink 0.7s step-end infinite', color: 'rgba(255,255,255,0.7)' },
  inputWrap: { padding: '0.5rem 1rem 1rem', background: '#000', position: 'fixed', bottom: '80px', left: 0, right: 0, zIndex: 50 },
  newChatRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '0.4rem' },
  newChatBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer', padding: '2px 4px' },
  inputBar: { display: 'flex', alignItems: 'flex-end', background: '#1c1c1e', borderRadius: '20px', padding: '0.55rem 0.6rem 0.55rem 1.1rem', gap: '0.4rem' },
  textarea: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.95rem', lineHeight: 1.5, resize: 'none', fontFamily: 'inherit', padding: '2px 0', overflowY: 'hidden' },
  sendBtn: { width: '32px', height: '32px', borderRadius: '50%', background: '#2563EB', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '1px' },
  micWrap: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '32px', height: '32px', marginBottom: '1px' },
  pulseRing: { position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #2563EB', animation: 'pulse-mic 1.2s ease-out infinite', pointerEvents: 'none' },
  micBtn: { background: 'transparent', border: 'none', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 },
};

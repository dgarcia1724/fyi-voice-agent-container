'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = { role: 'user' | 'assistant'; content: string };

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [spokenWordCount, setSpokenWordCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const pendingUtterancesRef = useRef(0);

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
    pendingUtterancesRef.current = 0;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setSpokenWordCount(0);
  }

  function queueSpeech(text: string, wordOffset: number) {
    if (!text.trim()) return;
    pendingUtterancesRef.current++;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.onboundary = (e: SpeechSynthesisEvent) => {
      if (e.name === 'word') {
        const wordsSpoken = text
          .slice(0, e.charIndex + e.charLength)
          .trim().split(/\s+/).filter(Boolean).length;
        setSpokenWordCount(wordOffset + wordsSpoken);
      }
    };
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => {
      const totalWords = text.trim().split(/\s+/).filter(Boolean).length;
      setSpokenWordCount(wordOffset + totalWords);
      pendingUtterancesRef.current--;
      if (pendingUtterancesRef.current === 0) setSpeaking(false);
    };
    utt.onerror = () => {
      pendingUtterancesRef.current--;
      if (pendingUtterancesRef.current === 0) setSpeaking(false);
    };
    window.speechSynthesis.speak(utt);
  }

  async function sendText(text: string) {
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: 'assistant', content: '' }]);
    setSpokenWordCount(0);
    setLoading(true);

    let sentenceBuffer = '';
    let queuedWordCount = 0;

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (sentenceBuffer.trim()) {
            queueSpeech(sentenceBuffer.trim(), queuedWordCount);
          }
          break;
        }
        const chunk = decoder.decode(value);
        sentenceBuffer += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });

        const sentenceEnd = /[.!?](\s|$)/;
        let idx: number;
        while ((idx = sentenceBuffer.search(sentenceEnd)) !== -1) {
          const sentence = sentenceBuffer.slice(0, idx + 1).trim();
          queueSpeech(sentence, queuedWordCount);
          queuedWordCount += sentence.split(/\s+/).filter(Boolean).length;
          sentenceBuffer = sentenceBuffer.slice(idx + 1).trimStart();
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
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
      if (transcript) sendText(transcript);
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
            <p style={s.emptyHeading}>What&apos;s on your mind today?</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastAI = msg.role === 'assistant' && i === messages.length - 1;
          return msg.role === 'user' ? (
            <div key={i} style={s.userRow}>
              <div style={s.userBubble}>{msg.content}</div>
            </div>
          ) : (
            <div key={i} style={s.aiBubble}>
              {isLastAI && speaking
                ? <HighlightedText content={msg.content} spokenWords={spokenWordCount} />
                : isLastAI && loading
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

function HighlightedText({ content, spokenWords }: { content: string; spokenWords: number }) {
  const tokens = content.split(/(\s+)/);
  let wordCount = 0;
  return (
    <>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        const isSpoken = wordCount < spokenWords;
        wordCount++;
        return (
          <span key={i} style={{ color: isSpoken ? '#fff' : 'rgba(255,255,255,0.35)' }}>
            {token}
          </span>
        );
      })}
    </>
  );
}

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
  messages: { flex: 1, overflowY: 'auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  emptyState: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60%' },
  emptyHeading: { fontSize: '1.4rem', fontWeight: 600, color: '#fff', textAlign: 'center', margin: 0 },
  userRow: { display: 'flex', justifyContent: 'flex-end' },
  userBubble: { background: '#2c2c2e', color: '#fff', borderRadius: '18px', padding: '0.65rem 1rem', maxWidth: '75%', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  aiBubble: { color: '#fff', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '90%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  cursor: { display: 'inline-block', marginLeft: '1px', animation: 'blink 0.7s step-end infinite', color: 'rgba(255,255,255,0.7)' },
  inputWrap: { padding: '0.5rem 1rem 1rem', background: '#000' },
  newChatRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '0.4rem' },
  newChatBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer', padding: '2px 4px' },
  inputBar: { display: 'flex', alignItems: 'flex-end', background: '#1c1c1e', borderRadius: '20px', padding: '0.55rem 0.6rem 0.55rem 1.1rem', gap: '0.4rem' },
  textarea: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.95rem', lineHeight: 1.5, resize: 'none', fontFamily: 'inherit', padding: '2px 0', overflowY: 'hidden' },
  sendBtn: { width: '32px', height: '32px', borderRadius: '50%', background: '#2563EB', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '1px' },
  micWrap: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '32px', height: '32px', marginBottom: '1px' },
  pulseRing: { position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #2563EB', animation: 'pulse-mic 1.2s ease-out infinite', pointerEvents: 'none' },
  micBtn: { background: 'transparent', border: 'none', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 },
};

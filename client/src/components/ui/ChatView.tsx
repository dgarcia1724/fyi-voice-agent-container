'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];

    // Add user message + empty assistant placeholder immediately
    setMessages([...newMessages, { role: 'assistant', content: '' }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

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
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
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

  function onInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div style={s.root}>
      <div style={s.messages}>
        {isEmpty && (
          <div style={s.emptyState}>
            <p style={s.emptyHeading}>What&apos;s on your mind today?</p>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            <div key={i} style={s.userRow}>
              <div style={s.userBubble}>{msg.content}</div>
            </div>
          ) : (
            <div key={i} style={s.aiBubble}>
              {msg.content}
              {loading && i === messages.length - 1 && (
                <span style={s.cursor}>|</span>
              )}
            </div>
          )
        )}

        <div ref={bottomRef} />
      </div>

      <div style={s.inputWrap}>
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
          <button style={s.micBtn} disabled>
            <MicIcon />
          </button>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
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

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  );
}

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
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60%',
  },
  emptyHeading: {
    fontSize: '1.4rem',
    fontWeight: 600,
    color: '#fff',
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
  inputWrap: {
    padding: '0.75rem 1rem 1rem',
    background: '#000',
  },
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    background: '#1c1c1e',
    borderRadius: '999px',
    padding: '0.55rem 0.75rem 0.55rem 1.1rem',
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
    padding: 0,
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
  },
  micBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'not-allowed',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

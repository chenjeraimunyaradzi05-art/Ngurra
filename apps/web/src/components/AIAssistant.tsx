'use client';

import { useState, useRef, useEffect } from 'react';
import { API_BASE } from '@/lib/apiBase';
import { useAuth } from '@/hooks/useAuth';

const NextaGlyph = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="drop-shadow-md"
  >
    <defs>
      <linearGradient id="nexta-ai-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0F766E" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="nexta-ai-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="15" fill="url(#nexta-ai-bg)" />
    <path d="M14 34V14h4.2l13.6 16.2V14H36v20h-4.2L18.2 17.8V34H14Z" fill="white" />
    <path d="M36 8L40 12L36 16L32 12L36 8Z" fill="url(#nexta-ai-accent)" />
    <circle cx="36" cy="36" r="3" fill="#F8FAFC" opacity="0.78" />
  </svg>
);

export default function AIAssistant() {
  const { user, token, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>(() => {
    try {
      const raw = localStorage.getItem('nexta:ai:messages');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nexta:ai:messages', JSON.stringify(messages));
    } catch (e) {
      // Ignore storage access errors.
    }
    setTimeout(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
    }, 60);
  }, [messages, open]);

  useEffect(() => {
    if (!open || !isAuthenticated || !token) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/ai/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const payload = await res.json();
        const conversations = payload.conversations || [];

        if (conversations.length > 0) {
          const first = conversations[0];
          setConversationId(first.id);

          const detail = await fetch(`${API_BASE}/ai/conversations/${first.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (detail.ok) {
            const parsed = await detail.json();
            if (!cancelled && parsed.conversation?.messages) {
              setMessages(
                parsed.conversation.messages.map((message: any) => ({
                  role: message.role === 'assistant' ? 'ai' : 'user',
                  text: message.content,
                }))
              );
            }
          }
        } else {
          const created = await fetch(`${API_BASE}/ai/conversations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: 'Conversation with Nexta AI' }),
          });
          if (created.ok) {
            const parsed = await created.json();
            setConversationId(parsed.conversation.id);
            setMessages([]);
          }
        }
      } catch (err) {
        console.debug('Could not initialize AI conversation', err);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated, token]);

  const ask = async (question: string) => {
    setError(null);
    setLoading(true);

    try {
      if (isAuthenticated && conversationId && token) {
        const res = await fetch(`${API_BASE}/ai/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: 'user', content: question }),
        });

        if (res.status === 429) {
          setError('AI requests rate limited. Please try again later.');
          setMessages((prev) => [
            ...prev,
            { role: 'ai', text: 'Rate limit exceeded. Please wait and try again.' },
          ]);
          return;
        }

        if (!res.ok) throw new Error('AI service error');

        const payload = await res.json();
        if (payload?.assistantMessage) {
          const isSafetyFiltered = payload.source === 'safety';
          const text = isSafetyFiltered
            ? payload.assistantMessage.content || 'Content removed due to safety.'
            : payload.assistantMessage.content ||
              payload.assistantMessage.text ||
              'No response';
          setMessages((prev) => [...prev, { role: 'ai', text }]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'ai', text: "Sorry, I couldn't find anything. Try rephrasing." },
          ]);
        }
      } else {
        const res = await fetch(`${API_BASE}/ai/concierge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: isAuthenticated ? user?.id : undefined, context: question }),
        });

        if (!res.ok) throw new Error('AI service error');

        const payload = await res.json();
        if (payload.suggestions?.length) {
          const text = payload.suggestions.map((suggestion: string) => `- ${suggestion}`).join('\n');
          setMessages((prev) => [...prev, { role: 'ai', text }]);
        } else if (payload.text) {
          setMessages((prev) => [...prev, { role: 'ai', text: payload.text }]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'ai', text: "Sorry, I couldn't find anything. Try rephrasing." },
          ]);
        }
      }
    } catch (err) {
      console.error('AI ask error', err);
      setError('Failed to contact Nexta AI.');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, Nexta AI is unavailable right now.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');

    if (isAuthenticated && !conversationId && token) {
      try {
        const created = await fetch(`${API_BASE}/ai/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: 'Conversation with Nexta AI' }),
        });
        if (created.ok) {
          const parsed = await created.json();
          setConversationId(parsed.conversation.id);
        }
      } catch (err) {
        console.debug('Failed to create conversation', err);
      }
    }

    await ask(question);
    setOpen(true);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-gradient-to-br from-teal-600 to-slate-900 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label="Open Nexta AI"
        onClick={() => setOpen(true)}
      >
        <NextaGlyph />
        <span className="font-bold text-white text-base">AI</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

          <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl w-full max-w-lg z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <NextaGlyph />
                <div>
                  <h3 className="font-bold text-lg">Nexta AI</h3>
                  <div className="text-sm text-slate-500">
                    Ask for next steps, planning help, pathway guidance, or practical tools.
                  </div>
                </div>
              </div>
              <button
                className="text-slate-400 hover:text-teal-600"
                onClick={() => setOpen(false)}
                aria-label="Close Nexta AI"
              >
                ×
              </button>
            </div>

            <div
              ref={logRef}
              className="max-h-64 overflow-y-auto mb-3 bg-slate-50 rounded-lg p-3 space-y-2"
            >
              {messages.length === 0 && (
                <div className="text-sm text-slate-400">
                  Try a prompt like &quot;What should I do next for work this week?&quot;
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded ${
                    message.role === 'ai' ? 'bg-white' : 'bg-teal-50 text-slate-800'
                  }`}
                >
                  {message.role === 'ai' ? (
                    <strong className="text-teal-700">Nexta AI:</strong>
                  ) : (
                    <strong className="text-slate-700">You:</strong>
                  )}{' '}
                  <span className="ml-2 whitespace-pre-wrap">{message.text}</span>
                </div>
              ))}
            </div>

            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void submit();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ask Nexta AI for your next step..."
                aria-label="Ask Nexta AI"
              />
              <button
                className={`px-4 py-2 rounded-full text-white font-bold ${
                  loading || input.trim() === '' ? 'bg-slate-300' : 'bg-teal-700 hover:scale-105'
                }`}
                onClick={() => void submit()}
                disabled={loading || input.trim() === ''}
              >
                {loading ? 'Thinking...' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

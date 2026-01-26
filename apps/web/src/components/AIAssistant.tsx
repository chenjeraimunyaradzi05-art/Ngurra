import { useState, useRef, useEffect } from 'react';
import { API_BASE } from '@/lib/apiBase';
import { useAuth } from '@/hooks/useAuth';

const KangarooLogo = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="16" cy="16" r="16" fill="#F59E0B" />
    <path d="M10 20c2-4 6-7 10-7 2 0 3 2 2 4-1 2-4 3-6 3l-2 4-4-4z" fill="#fff" />
  </svg>
);

export default function AIAssistant() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>(() => {
    try {
      const raw = localStorage.getItem('gimbi:ai:messages');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      // localStorage may be unavailable in privacy mode
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('gimbi:ai:messages', JSON.stringify(messages));
    } catch (e) {
      // ignore storage errors (privacy mode)
    }
    // auto-scroll
    setTimeout(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
    }, 60);
  }, [messages, open]);

  const ask = async (question: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/concierge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: isAuthenticated ? user?.id : undefined, context: question }),
      });
      if (!res.ok) throw new Error('AI service error');
      const data = await res.json();
      if (data.suggestions && data.suggestions.length) {
        const text = data.suggestions.map((s: string) => `• ${s}`).join('\n');
        setMessages((prev) => [...prev, { role: 'ai', text }]);
      } else if (data.text) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: "Sorry, I couldn't find anything. Try rephrasing." },
        ]);
      }
    } catch (err) {
      console.error('AI ask error', err);
      setError('Failed to contact AI assistant.');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, the assistant is unavailable right now.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    await ask(q);
    setOpen(true);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-gradient-to-br from-amber-400 to-pink-500 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-pink-500"
        aria-label="Open AI Assistant"
        onClick={() => setOpen(true)}
      >
        <KangarooLogo />
        <span className="font-bold text-white text-base">AI</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

          <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl w-full max-w-lg z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <KangarooLogo />
                <div>
                  <h3 className="font-bold text-lg">Gimbi AI Assistant</h3>
                  <div className="text-sm text-slate-500">
                    Ask for grants, application help, or resources.
                  </div>
                </div>
              </div>
              <button
                className="text-slate-400 hover:text-pink-500"
                onClick={() => setOpen(false)}
                aria-label="Close AI Assistant"
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
                  Say hello to Athena — type a question below.
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-sm p-2 rounded ${m.role === 'ai' ? 'bg-white' : 'bg-pink-50 text-slate-800'}`}
                >
                  {m.role === 'ai' ? (
                    <strong className="text-emerald-600">Athena:</strong>
                  ) : (
                    <strong className="text-pink-600">You:</strong>
                  )}{' '}
                  <span className="ml-2 whitespace-pre-wrap">{m.text}</span>
                </div>
              ))}
            </div>

            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void submit();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Ask Athena for help..."
                aria-label="Ask Athena"
              />
              <button
                className={`px-4 py-2 rounded-full text-white font-bold ${loading || input.trim() === '' ? 'bg-amber-200' : 'bg-amber-400 hover:scale-105'}`}
                onClick={() => void submit()}
                disabled={loading || input.trim() === ''}
              >
                {loading ? 'Thinking…' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

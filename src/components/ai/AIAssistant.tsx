import { useState, useRef, useEffect, useCallback } from 'react';
import { aiAssistantService, type AiChatMessage } from '../../services/aiAssistantService';

const SUGGESTIONS = [
  { label: '🌾 What gluten-free options are available?', aria: 'Ask: What gluten-free options are available?' },
  { label: '🌱 Recommend vegetarian dishes', aria: 'Ask: Recommend vegetarian dishes' },
  { label: '⏱️ Which restaurant has the fastest prep time?', aria: 'Ask: Which restaurant has the fastest prep time?' },
  { label: '🍕 What pizzas can I pick up from Pizza Palace?', aria: 'Ask: What pizzas can I pick up from Pizza Palace?' },
];

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm your FoodOrder AI Assistant powered by Amazon Bedrock. I can recommend dishes grounded in our actual restaurant menus, answer questions about allergens, prices, and prep times for self-pickup.",
      isMock: true,
      provider: 'FoodOrder Assistant',
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  // Auto-scroll to bottom of messages (safeguarded for JSDOM where scrollIntoView may not exist)
  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle Escape key and focus trap inside the drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [isOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: AiChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await aiAssistantService.sendMessage(text, messages);

      const assistantMessage: AiChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        isMock: result.isMock,
        provider: result.provider,
        model: result.model,
        timestamp: result.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach AI assistant. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI Food Assistant' : 'Open AI Food Assistant'}
        aria-expanded={isOpen}
        aria-controls="bedrock-ai-drawer"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition-all duration-200 hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative flex items-center justify-center">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* Slide-over / Modal Chat Dialog */}
      {isOpen && (
        <section
          ref={drawerRef}
          id="bedrock-ai-drawer"
          role="dialog"
          aria-label="AI Food Assistant"
          aria-modal="true"
          aria-describedby="ai-assistant-welcome"
          className="fixed bottom-22 right-4 z-40 flex h-[580px] w-[92vw] max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:right-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-800 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <svg className="h-5 w-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 01-.82-7.915 4.962 4.962 0 012.82-1.085c1.01 0 1.97.3 2.82 1.085A4 4 0 0112 14z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">AI Food Assistant</h2>
                <p className="text-[11px] text-indigo-100">Amazon Bedrock • Grounded in Menus</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              className="rounded-lg p-1 text-indigo-100 hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages list */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Conversation messages"
            className="flex-1 space-y-3 overflow-y-auto p-4 text-sm"
          >
            {messages.map((m, idx) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  id={idx === 0 ? 'ai-assistant-welcome' : undefined}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-gray-100 text-gray-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                </div>

                {/* Badge distinguishing Live Bedrock vs Mock Demo fallback */}
                {m.role === 'assistant' && (
                  <div className="mt-1 flex items-center gap-1.5 px-1 text-[10px]">
                    {m.isMock ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Demo Mode (Safe Fallback)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Amazon Bedrock ({m.model || 'Claude 3 Haiku'})
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3 text-gray-500">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-600"></span>
                  <span className="ml-2 text-xs">Consulting menus...</span>
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (shown when at initial state) */}
          {messages.length <= 2 && (
            <div className="border-t border-gray-100 bg-gray-50/70 p-2.5">
              <p className="mb-1.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    aria-label={s.aria}
                    onClick={() => handleSend(s.label.replace(/^\S+\s/, ''))}
                    className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-2xs hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              maxLength={500}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about dishes, dietary needs, prep time..."
              aria-label="Ask AI Assistant a question"
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              aria-label="Send message"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </section>
      )}
    </>
  );
}

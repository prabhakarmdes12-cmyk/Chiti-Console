"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2, X, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function QueryBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setMessages([]);
        setInput("");
        setIsExpanded(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    if (!isExpanded) setIsExpanded(true);

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: err.error || "Query failed." },
        ]);
        return;
      }

      const { text } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-surface-2/50 border border-white/10 rounded-xl text-sm text-text-muted hover:text-text-main hover:border-brand-primary/40 hover:bg-surface-2/80 transition-all group cursor-text"
        >
          <Search className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-colors" />
          <span>Ask anything about your business...</span>
          <kbd className="ml-auto text-xs text-text-muted bg-surface-1/50 px-2 py-0.5 rounded border border-white/5 hidden sm:inline">
            Ctrl+K
          </kbd>
        </button>
      ) : (
        <div className="bg-surface-2/80 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
          {isExpanded && messages.length > 0 && (
            <div className="px-4 pt-3 pb-2 space-y-3 max-h-80 overflow-y-auto border-b border-white/5">
              {messages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.role === "user" ? "text-text-main" : "text-text-muted"}`}>
                  {msg.role === "user" ? (
                    <div className="flex items-start gap-2">
                      <span className="text-brand-primary font-medium text-xs mt-0.5">You</span>
                      <span>{msg.content}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand-secondary mt-0.5 shrink-0" />
                      <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-2.5">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. orders above ₹10K this month, top customers..."
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-muted/50 outline-none"
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3 py-1 bg-brand-primary/20 text-brand-primary text-xs font-medium rounded-lg hover:bg-brand-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Ask"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setMessages([]);
                setInput("");
                setIsExpanded(false);
              }}
              className="text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

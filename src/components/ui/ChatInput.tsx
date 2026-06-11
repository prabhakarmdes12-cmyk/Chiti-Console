"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    setContent("");
    await onSend(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-white/10 bg-surface-1">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        rows={1}
        disabled={disabled}
        className="flex-1 bg-surface-2 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-main placeholder:text-text-muted resize-none outline-none focus:border-brand-primary/50 transition-colors disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !content.trim()}
        className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white hover:bg-brand-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
      >
        <Send size={16} />
      </button>
    </div>
  );
}

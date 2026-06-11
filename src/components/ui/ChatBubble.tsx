"use client";

interface ChatBubbleProps {
  content: string;
  direction: "INBOUND" | "OUTBOUND";
  timestamp: Date;
}

export default function ChatBubble({ content, direction, timestamp }: ChatBubbleProps) {
  const isInbound = direction === "INBOUND";
  const time = timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isInbound
            ? "bg-surface-2 border border-white/10 rounded-bl-sm"
            : "bg-brand-primary/20 border border-brand-primary/30 rounded-br-sm"
        }`}
      >
        <p className="text-sm text-text-main whitespace-pre-wrap">{content}</p>
        <p className={`text-[10px] mt-1 ${isInbound ? "text-text-muted" : "text-brand-primary/60"}`}>{time}</p>
      </div>
    </div>
  );
}

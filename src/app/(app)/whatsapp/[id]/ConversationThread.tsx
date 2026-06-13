"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, CheckCheck } from "lucide-react";
import ChatBubble from "@/components/ui/ChatBubble";
import ChatInput from "@/components/ui/ChatInput";
import { useState, useTransition } from "react";

interface Message {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  content: string;
  createdAt: Date;
}

interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
}

interface Conversation {
  id: string;
  waContactId: string;
  status: string;
  unreadCount: number;
  customer: Customer | null;
  messages: Message[];
}

export default function ConversationThread({
  conversation: initial,
  name,
  phone,
}: {
  conversation: Conversation;
  name: string;
  phone: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initial.messages);
  const [sending, setSending] = useState(false);
  const [, startTransition] = useTransition();

  const handleSend = async (content: string) => {
    setSending(true);
    try {
      const res = await fetch(`/api/whatsapp/conversations/${initial.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send");
      }

      const msg = await res.json();
      setMessages((prev) => [...prev, { ...msg, createdAt: new Date(msg.createdAt) }]);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleCreateOrder = () => {
    const params = new URLSearchParams();
    if (initial.customer) {
      params.set("customerId", initial.customer.id);
      params.set("customerName", initial.customer.name || "");
      params.set("source", "WHATSAPP");
    }
    router.push(`/orders/new?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-surface-1">
        <button onClick={() => router.push("/whatsapp")} className="text-text-muted hover:text-text-main transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-main">{name}</p>
          <p className="text-xs text-text-muted">{phone}</p>
        </div>
        <div className="flex items-center gap-2">
          {initial.customer && (
            <button
              onClick={handleCreateOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-medium transition-colors"
            >
              <ShoppingCart size={14} />
              Order
            </button>
          )}
          {initial.unreadCount > 0 && (
            <form action={() => {
              startTransition(async () => {
                const { markConversationRead } = await import("@/lib/actions/whatsapp");
                await markConversationRead(initial.id);
                router.refresh();
              });
            }}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-muted text-xs font-medium transition-colors"
              >
                <CheckCheck size={14} />
                Mark Read
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-text-muted text-sm mt-8">No messages yet. Send a message to start the conversation.</p>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} content={msg.content} direction={msg.direction} timestamp={msg.createdAt} />
        ))}
      </div>

      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, CheckCheck, Wand2, X } from "lucide-react";
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

interface ExtractedItem {
  productName: string;
  quantity: number;
  unitPrice?: number;
}

interface ExtractionResult {
  items: ExtractedItem[];
  totalAmount: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  missingInfo: string[];
  customerName: string | null;
  phone: string | null;
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
  const [extracting, setExtracting] = useState(false);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
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

  const handleExtractOrder = async () => {
    setExtracting(true);
    try {
      const { extractOrderFromConversation } = await import("@/lib/actions/whatsapp");
      const result = await extractOrderFromConversation(initial.id);
      setExtraction(result);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  const handleConfirmExtraction = async () => {
    if (!extraction) return;
    try {
      const { createOrderFromExtraction } = await import("@/lib/actions/whatsapp");
      await createOrderFromExtraction(initial.id, {
        items: extraction.items,
        totalAmount: extraction.totalAmount,
        customerId: initial.customer?.id,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create order");
    }
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
              onClick={handleExtractOrder}
              disabled={extracting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Wand2 size={14} />
              {extracting ? "Extracting..." : "Extract"}
            </button>
          )}
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

      {extraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface-1 border border-white/10 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-main">Extracted Order</h3>
              <button onClick={() => setExtraction(null)} className="text-text-muted hover:text-text-main">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  extraction.confidence === "HIGH" ? "bg-success/10 text-success"
                  : extraction.confidence === "MEDIUM" ? "bg-warning/10 text-warning"
                  : "bg-error/10 text-error"
                }`}>
                  {extraction.confidence} confidence
                </span>
              </div>

              {extraction.missingInfo.length > 0 && (
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                  <p className="text-xs text-warning font-medium mb-1">Missing information:</p>
                  <ul className="text-xs text-text-muted space-y-0.5">
                    {extraction.missingInfo.map((info, i) => (
                      <li key={i}>• {info}</li>
                    ))}
                  </ul>
                </div>
              )}

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-text-muted">
                    <th className="text-left pb-2 font-medium">Item</th>
                    <th className="text-right pb-2 font-medium">Qty</th>
                    <th className="text-right pb-2 font-medium">Price</th>
                    <th className="text-right pb-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {extraction.items.map((item, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 text-text-main">{item.productName}</td>
                      <td className="py-2 text-right text-text-muted">{item.quantity}</td>
                      <td className="py-2 text-right text-text-muted">
                        {item.unitPrice ? `₹${item.unitPrice.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-2 text-right text-text-main font-medium">
                        ₹{((item.unitPrice || 0) * item.quantity).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10">
                    <td colSpan={3} className="pt-2 text-right text-sm text-text-muted font-medium">Total</td>
                    <td className="pt-2 text-right text-sm text-text-main font-bold">
                      ₹{extraction.totalAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {extraction.customerName && (
                <p className="text-xs text-text-muted">Customer: {extraction.customerName}</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleConfirmExtraction}
                  className="flex-1 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-colors"
                >
                  Create Order
                </button>
                <button
                  onClick={() => setExtraction(null)}
                  className="px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-muted text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

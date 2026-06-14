"use client";

import { useState } from "react";
import { Wand2, Copy, Check } from "lucide-react";

export default function LeadFollowUp({ leadId }: { leadId: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { generateFollowUp } = await import("@/lib/actions/leads");
      const text = await generateFollowUp(leadId);
      setDraft(text);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-medium transition-colors disabled:opacity-50"
      >
        <Wand2 size={14} />
        {loading ? "Generating..." : "Draft Follow-up"}
      </button>

      {draft && (
        <div className="relative">
          <textarea
            readOnly
            value={draft}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm resize-none"
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-text-muted hover:text-text-main transition-colors"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}

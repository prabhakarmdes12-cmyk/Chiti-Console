"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const allPrefs = [
  { key: "emailNotifications", label: "Email Notifications", desc: "Receive order updates via email" },
  { key: "whatsappAlerts", label: "WhatsApp Alerts", desc: "Get notified for new leads" },
  { key: "darkMode", label: "Dark Mode", desc: "System default (dark)" },
  { key: "soundEffects", label: "Sound Effects", desc: "Play sounds for notifications" },
];

interface SettingsFormProps {
  name: string;
  email: string;
  role: string;
  initials: string;
  initialPrefs: Record<string, boolean>;
}

export default function SettingsForm({ name, email, role, initials, initialPrefs }: SettingsFormProps) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState<string | null>(null);

  const toggle = async (key: string) => {
    const newVal = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: newVal }));
    setSaving(key);

    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newVal }),
      });
      if (!res.ok) {
        setPrefs((prev) => ({ ...prev, [key]: !newVal }));
      }
      router.refresh();
    } catch {
      setPrefs((prev) => ({ ...prev, [key]: !newVal }));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-main">Settings</h1>
        <p className="text-text-muted text-sm mt-1">Manage your account and preferences.</p>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-medium text-text-main border-b border-white/10 pb-3">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-primary/20 flex items-center justify-center">
            <span className="text-lg text-brand-primary font-bold">{initials}</span>
          </div>
          <div>
            <p className="text-text-main font-medium">{name}</p>
            <p className="text-sm text-text-muted">{email}</p>
            <p className="text-xs text-text-muted mt-0.5">{role}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-text-main border-b border-white/10 pb-3">Preferences</h2>
        {allPrefs.map((pref) => (
          <div key={pref.key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-text-main">{pref.label}</p>
              <p className="text-xs text-text-muted">{pref.desc}</p>
            </div>
            <button
              onClick={() => toggle(pref.key)}
              disabled={saving === pref.key}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                prefs[pref.key] ? "bg-brand-primary" : "bg-surface-3"
              } disabled:opacity-50`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                prefs[pref.key] ? "left-5" : "left-0.5"
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-text-main border-b border-white/10 pb-3">Account</h2>
        <button className="w-full px-4 py-2.5 rounded-lg border border-error/30 text-error text-sm hover:bg-error/5 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}

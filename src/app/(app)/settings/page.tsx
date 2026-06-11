export default function SettingsPage() {
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
            <span className="text-lg text-brand-primary font-bold">PK</span>
          </div>
          <div>
            <p className="text-text-main font-medium">Prabhakar Kumar</p>
            <p className="text-sm text-text-muted">prabhakar@chiti.tech</p>
            <p className="text-xs text-text-muted mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-text-main border-b border-white/10 pb-3">Preferences</h2>
        {[
          { label: "Email Notifications", desc: "Receive order updates via email", enabled: true },
          { label: "WhatsApp Alerts", desc: "Get notified for new leads", enabled: true },
          { label: "Dark Mode", desc: "System default (dark)", enabled: true },
          { label: "Sound Effects", desc: "Play sounds for notifications", enabled: false },
        ].map((pref) => (
          <div key={pref.label} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-text-main">{pref.label}</p>
              <p className="text-xs text-text-muted">{pref.desc}</p>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors ${
              pref.enabled ? "bg-brand-primary" : "bg-surface-3"
            } relative`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                pref.enabled ? "left-5" : "left-0.5"
              }`} />
            </div>
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

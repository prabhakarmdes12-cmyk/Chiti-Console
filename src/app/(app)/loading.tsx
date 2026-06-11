export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-64 rounded bg-surface-2" />
        <div className="h-4 w-48 rounded bg-surface-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-surface-1 border border-white/10" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-surface-1 border border-white/10" />
    </div>
  );
}

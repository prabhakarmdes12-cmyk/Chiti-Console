export default function OrderDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-48 rounded bg-surface-2" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface-1 border border-white/10 rounded-xl p-5">
            <div className="h-4 w-24 rounded bg-surface-2 mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 border-b border-white/5 last:border-0 flex items-center justify-between">
                <div className="h-3 w-32 rounded bg-surface-2" />
                <div className="h-3 w-16 rounded bg-surface-2" />
              </div>
            ))}
          </div>
          <div className="bg-surface-1 border border-white/10 rounded-xl p-5">
            <div className="h-4 w-20 rounded bg-surface-2 mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-surface-2" />
                <div className="h-3 w-40 rounded bg-surface-2" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-3">
              <div className="h-4 w-20 rounded bg-surface-2" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-3 rounded bg-surface-2" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

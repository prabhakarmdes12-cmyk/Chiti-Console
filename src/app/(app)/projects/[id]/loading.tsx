export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="h-4 w-24 rounded bg-surface-2" />
          <div className="flex items-center justify-center py-6">
            <div className="w-24 h-24 rounded-full bg-surface-2" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3 rounded bg-surface-2" />
            ))}
          </div>
        </div>
        <div className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="h-4 w-24 rounded bg-surface-2" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-16 rounded bg-surface-2" />
                <div className="h-6 w-20 rounded bg-surface-2" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="h-4 w-24 rounded bg-surface-2" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-surface-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

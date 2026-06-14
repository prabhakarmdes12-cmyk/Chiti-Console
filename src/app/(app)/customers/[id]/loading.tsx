export default function CustomerDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-48 rounded bg-surface-2" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
  );
}

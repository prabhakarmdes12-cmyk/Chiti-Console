export default function RootLoading() {
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-brand animate-pulse" />
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    </div>
  );
}

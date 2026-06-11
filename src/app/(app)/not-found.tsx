import Link from "next/link";

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center">
        <span className="text-3xl font-display font-bold text-text-muted">?</span>
      </div>
      <h2 className="text-xl font-display font-semibold text-text-main">
        Page not found
      </h2>
      <p className="text-sm text-text-muted max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all duration-150"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

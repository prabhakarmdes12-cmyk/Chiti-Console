"use client";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-8">
      <div className="bg-surface-1 border border-white/10 rounded-xl p-8 max-w-sm w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto">
          <span className="text-warning text-2xl">!</span>
        </div>
        <h2 className="text-lg font-display font-semibold text-text-main">
          Sign in failed
        </h2>
        <p className="text-sm text-text-muted">
          {error.message.includes("Configuration")
            ? "Authentication is not configured correctly. Please contact support."
            : "Something went wrong. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all duration-150"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
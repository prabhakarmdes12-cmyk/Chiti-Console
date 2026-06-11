"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
        <span className="text-warning text-2xl">!</span>
      </div>
      <h2 className="text-lg font-display font-semibold text-text-main">
        Something went wrong
      </h2>
      <p className="text-sm text-text-muted max-w-md text-center">
        {error.message.includes("ECONNREFUSED") || error.message.includes("Connection terminated")
          ? "Database connection lost. The server may be restarting — please wait a moment and try again."
          : "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all duration-150"
      >
        Try again
      </button>
    </div>
  );
}
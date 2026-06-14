"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-dark text-text-main font-body antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-error/20 flex items-center justify-center">
            <span className="text-error text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-display font-semibold text-text-main">
            Fatal error
          </h1>
          <p className="text-sm text-text-muted max-w-md text-center">
            {error.message.includes("ECONNREFUSED") || error.message.includes("Connection terminated")
              ? "Database connection lost. Please wait and refresh."
              : "A critical error occurred. Please try again."}
          </p>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all duration-150"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

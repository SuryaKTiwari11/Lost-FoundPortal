"use client";

// Sentry import removed
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console instead of Sentry
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-400 mb-6">
              We apologize for the inconvenience.
            </p>
            <button
              className="px-4 py-2 bg-[#FFD166] text-[#121212] rounded-md hover:bg-[#FFE066] transition-colors"
              onClick={() => {
                // Check if reset is a function before calling it
                if (typeof reset === "function") {
                  try {
                    reset();
                  } catch (err) {
                    console.error("Error resetting:", err);
                    // Fallback to window reload if reset fails
                    window.location.reload();
                  }
                } else {
                  // Fallback to window reload if reset is not a function
                  window.location.reload();
                }
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

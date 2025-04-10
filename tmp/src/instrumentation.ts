export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      // Performance Monitoring
      tracesSampleRate: 0.5, // Capture 50% of transactions
      // Recommended sampling rates for production
      profilesSampleRate: 0.1, // Adjust this value in production

      // Set environment based on NODE_ENV
      environment: process.env.NODE_ENV,

      enabled: process.env.NODE_ENV === "production",

      // Configure integration
      integrations: [],
    });
  }
}

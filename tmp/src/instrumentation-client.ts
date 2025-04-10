"use client";

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Enable tracing functionality
  tracesSampleRate: 0.5,
  profilesSampleRate: 0.1,

  // Set environment based on NODE_ENV
  environment: process.env.NODE_ENV,

  // Disable Sentry in development mode
  enabled: process.env.NODE_ENV === "production",

  // We recommend adjusting this value in production
  replaysSessionSampleRate: 0.1,

  // Replay errors to help debug issues
  replaysOnErrorSampleRate: 1.0,
});

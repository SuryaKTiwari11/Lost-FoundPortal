/** @type {import('next').NextConfig} */
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "images.unsplash.com"],
  },
  // Add this to reduce the number of fast refreshes
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay before rebuilding
    };
    return config;
  },
  // Add Turbopack configuration
  experimental: {
    turbo: {
      rules: {
        // Configure specific options for Turbopack
        // These settings help ensure Sentry is compatible
      },
    },
  },
};

// For all available options, see:
// https://github.com/getsentry/sentry-webpack-plugin#options
const sentryConfig = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload source maps to Sentry
  // Suppresses source map uploading logs during build
  silent: true,
  org: "your-org",
  project: "lost-found-portal",
};

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, sentryConfig);

import dotenv from "dotenv";

// Load environment variables from the appropriate .env file
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "./.env.production" });
} else {
  dotenv.config(); // Load from .env.local for development
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "images.unsplash.com",
      "res.cloudinary.com",
    ],
  },

  // Disable powered by header for security
  poweredByHeader: false,

  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    NEXT_PUBLIC_ENV: process.env.NODE_ENV,
  },

  // Vercel-specific optimizations
  output: "standalone",

  // Disable file tracing to avoid permission issues
  experimental: {
    // Only include the minimal features needed
    optimizeCss: false, // Disable optimizeCss to avoid critters issue
    scrollRestoration: true,
  },
};

export default nextConfig;

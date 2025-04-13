import dotenv from "dotenv";

// Load environment variables from the appropriate .env file
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "./.env.production" });
} else {
  dotenv.config(); // Load from .env.local for development
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "images.unsplash.com",
      "res.cloudinary.com",
    ],
    // Improved image optimization for production
    minimumCacheTTL: 60, // Cache optimized images for at least 60 seconds
  },
  // Optimize webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Only apply development optimizations in dev mode
    if (dev) {
      // Reduce the frequency of file system polling
      config.watchOptions = {
        poll: false, // Disable polling and use native filesystem events
        aggregateTimeout: 500, // Increase delay before rebuilding
        ignored: ["**/node_modules", "**/.git"], // Ignore watching these directories
      };

      // Optimize module resolution
      config.resolve.symlinks = false; // Skip symlink resolution

      // Disable unnecessary processing in development
      if (!isServer) {
        // Disable some expensive plugins in development
        config.optimization.splitChunks = {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
          },
        };
      }
    }
    // Production optimizations
    else {
      // Enable aggressive code minification in production
      config.optimization.minimize = true;
    }

    return config;
  },
  // Add output file tracing for better production performance
  outputFileTracing: true,
  // Enhanced production settings
  productionBrowserSourceMaps: false, // Disable source maps in production for better performance
  swcMinify: true, // Use SWC minifier for better performance
  poweredByHeader: false, // Remove X-Powered-By header for security
  // Public environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    NEXT_PUBLIC_ENV: process.env.NODE_ENV,
  },
  // Experimental features for performance
  experimental: {
    optimizeCss: true, // Optimize CSS
    scrollRestoration: true, // Better scroll management
  },
};

export default nextConfig;

import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "images.unsplash.com", "res.cloudinary.com"],
  },
  // Optimize webpack configuration for faster development
  webpack: (config, { dev, isServer }) => {
    // Only apply these optimizations in development mode
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

    return config;
  },
  // Add output file tracing for better production performance
  outputFileTracing: true,
  env: {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, // Example public variable
  },
};

export default nextConfig;

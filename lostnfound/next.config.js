/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...other config...

  // Add this to reduce the number of fast refreshes
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay before rebuilding
    };
    return config;
  },
};

module.exports = nextConfig;

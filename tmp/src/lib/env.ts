/**
 * Environment variables utility
 * Loads and validates environment variables for the application
 */

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  url: string;
}

// Load and validate Cloudinary config
export const getCloudinaryConfig = (): CloudinaryConfig => {
  // Check if .env variables are loaded
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const url = process.env.CLOUDINARY_URL;

  // Validate required config
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(
      "Warning: Cloudinary configuration is incomplete. Image uploads may not work correctly."
    );
  }

  return {
    cloudName: cloudName || "",
    apiKey: apiKey || "",
    apiSecret: apiSecret || "",
    url: url || "",
  };
};

// Function to validate if Cloudinary config is complete
export const isCloudinaryConfigured = (): boolean => {
  const config = getCloudinaryConfig();
  return !!(config.cloudName && config.apiKey && config.apiSecret);
};

// You can add similar functions for other environment variables/services here

// Environment variable loader to ensure proper loading across all contexts
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Global variable to track if environment has been loaded
let envLoaded = false;

/**
 * Ensures environment variables are properly loaded
 * This is especially important for API routes and edge functions
 */
export function loadEnvConfig() {
  // Only load once to avoid duplicate loading
  if (envLoaded) {
    return process.env;
  }

  try {
    // For production, environment variables should be set in the hosting platform
    if (process.env.NODE_ENV === "production") {
      console.log("Using production environment variables");
      envLoaded = true;
      return process.env;
    }

    // For development, load from .env files
    const envFiles = [".env.local", ".env.development", ".env"];

    let loaded = false;
    for (const file of envFiles) {
      const envPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log(`📌 Environment loaded from ${file}`);
        loaded = true;
        break;
      }
    }

    if (!loaded) {
      console.warn(
        "⚠️ No .env file found. Using system environment variables."
      );
    }

    // Validate critical environment variables
    validateMongoDBConnection();

    // Mark as loaded
    envLoaded = true;

    return process.env;
  } catch (error) {
    console.error("Error loading environment variables:", error);
    return process.env;
  }
}

/**
 * Validates MongoDB connection string
 */
function validateMongoDBConnection() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not set in environment variables");
    return null;
  }

  // Clean up whitespace that might cause connection issues
  process.env.MONGODB_URI = uri.replace(/\s+/g, "");

  return process.env.MONGODB_URI;
}

// Load environment variables immediately
loadEnvConfig();

export default loadEnvConfig;

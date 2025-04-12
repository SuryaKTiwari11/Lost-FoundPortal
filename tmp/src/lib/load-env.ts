// Environment variables loader
// This file should be imported at the beginning of server components
import { config } from "dotenv";
import path from "path";

// Load env variables from .env file
const result = config({
  path: path.resolve(process.cwd(), ".env"),
});

if (result.error) {
  console.warn("Warning: Error loading .env file:", result.error);
}

// Validate critical environment variables
const requiredVars = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `Warning: Missing required environment variables: ${missingVars.join(", ")}`
  );
}

// Log environment status (without sensitive values)
console.log("Environment variables loaded:", {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? "[CONFIGURED]" : "[MISSING]",
  CLOUDINARY_CONFIG: process.env.CLOUDINARY_CLOUD_NAME
    ? "[CONFIGURED]"
    : "[MISSING]",
  ADMIN_CONFIG: process.env.ADMIN_EMAIL ? "[CONFIGURED]" : "[MISSING]",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
});

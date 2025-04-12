// Script to verify environment variables and Cloudinary configuration
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "..", ".env") });

console.log("=== ENVIRONMENT VERIFICATION ===");

// Check essential environment variables
const essentialVars = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = essentialVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "❌ Missing essential environment variables:",
    missingVars.join(", ")
  );
} else {
  console.log("✅ All essential environment variables are present");
}

// Log current environment configuration (safely)
console.log("\n=== ENVIRONMENT CONFIGURATION ===");
console.log(
  `Admin Email: ${process.env.ADMIN_EMAIL ? "✅ Configured" : "❌ Missing"}`
);
console.log(
  `MongoDB URI: ${process.env.MONGODB_URI ? "✅ Configured" : "❌ Missing"}`
);
console.log(
  `NextAuth URL: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}`
);
console.log(
  `Cloudinary Name: ${process.env.CLOUDINARY_CLOUD_NAME || "❌ Missing"}`
);

// Test Cloudinary configuration
console.log("\n=== TESTING CLOUDINARY CONNECTION ===");

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Try to ping cloudinary
try {
  const result = await cloudinary.api.ping();
  console.log("✅ Cloudinary connection successful!");
  console.log("API Response:", result);
} catch (error) {
  console.error("❌ Cloudinary connection failed!");
  console.error("Error details:", error.message);
  console.log("\nTroubleshooting tips:");
  console.log("1. Check your Cloudinary credentials in the .env file");
  console.log("2. Verify your internet connection");
  console.log("3. Ensure your Cloudinary account is active");
}

// Test admin credentials validity
console.log("\n=== TESTING ADMIN CREDENTIALS ===");
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  console.log("✅ Admin credentials are configured:");
  console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
  console.log(`   Password: ${"*".repeat(process.env.ADMIN_PASSWORD.length)}`);
} else {
  console.error("❌ Admin credentials are missing or incomplete");
}

console.log("\n=== ENVIRONMENT VERIFICATION COMPLETE ===");

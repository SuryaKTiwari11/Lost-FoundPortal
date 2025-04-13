/**
 * Production Deployment Checklist Script
 *
 * This script verifies that your application is ready for production deployment
 * by checking environment variables, database connections, and other critical settings.
 *
 * Usage: node scripts/verify-production-ready.js
 */

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { execSync } = require("child_process");

console.log("🔍 Starting Lost & Found Portal Production Readiness Check...");

// Load production environment variables
const envPath = path.resolve(process.cwd(), ".env.production");
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.error(
    "❌ .env.production file not found! Create this file with your production settings."
  );
  process.exit(1);
}

// Load environment variables
const envConfig = dotenv.config({ path: envPath });
console.log("✅ .env.production file found and loaded");

// Check required environment variables
const requiredEnvVars = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "MONGODB_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

console.log("✅ All required environment variables are set");

// Verify MongoDB URI and connection
async function checkDatabaseConnection() {
  const mongoUri = process.env.MONGODB_URI;

  // Check if MongoDB URI is for production (not localhost)
  if (mongoUri.includes("localhost") || mongoUri.includes("127.0.0.1")) {
    console.warn(
      "⚠️ Warning: Your MONGODB_URI appears to be a local connection. Use a production database for deployment."
    );
  } else {
    console.log("✅ Production MongoDB URI detected");
  }

  // Try connecting to the database
  try {
    console.log("Connecting to MongoDB...");
    const connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log("✅ Successfully connected to MongoDB");

    // Check for some collections to validate it's a proper DB
    const collections = Object.keys(connection.connection.collections);
    console.log(`Found collections: ${collections.join(", ")}`);

    // Close the connection
    await mongoose.disconnect();
    console.log("Connection closed");

    return true;
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB: ${error.message}`);
    return false;
  }
}

// Check for common security issues
function checkSecurityIssues() {
  let issues = [];

  // Check if NEXTAUTH_SECRET is a default value
  const authSecret = process.env.NEXTAUTH_SECRET;
  if (authSecret === "yoursupersecretkey123456789") {
    issues.push(
      "NEXTAUTH_SECRET is set to a default value. Generate a strong random key for production."
    );
  }

  // Check if admin password is strong enough
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (
    adminPassword &&
    (adminPassword.length < 12 ||
      !(
        /[A-Z]/.test(adminPassword) &&
        /[0-9]/.test(adminPassword) &&
        /[^A-Za-z0-9]/.test(adminPassword)
      ))
  ) {
    issues.push(
      "ADMIN_PASSWORD does not meet security requirements. Use at least 12 characters with uppercase, numbers and special characters."
    );
  }

  // Check NEXTAUTH_URL is not localhost
  const authUrl = process.env.NEXTAUTH_URL;
  if (authUrl && authUrl.includes("localhost")) {
    issues.push(
      "NEXTAUTH_URL contains localhost. Set it to your production domain."
    );
  }

  return issues;
}

// Check for build errors
async function checkBuild() {
  try {
    console.log("Running production build check...");
    // Run with --no-lint to avoid linting errors stopping the check
    execSync("npx next build --no-lint", { stdio: "inherit" });
    console.log("✅ Production build successful");
    return true;
  } catch (error) {
    console.error("❌ Production build failed");
    return false;
  }
}

// Check node_modules and dependencies
function checkDependencies() {
  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    console.error(
      "❌ node_modules not found. Run npm install before deploying."
    );
    return false;
  }

  // Check for unnecessary dev dependencies in production
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = require(packageJsonPath);

  console.log("✅ node_modules directory found");
  return true;
}

// Main function
async function runChecks() {
  console.log("\n=== Environment Variables Check ===");
  // Already checked above

  console.log("\n=== Security Check ===");
  const securityIssues = checkSecurityIssues();
  if (securityIssues.length > 0) {
    console.warn("⚠️ Security issues found:");
    securityIssues.forEach((issue) => console.warn(`  - ${issue}`));
  } else {
    console.log("✅ No common security issues detected");
  }

  console.log("\n=== Database Check ===");
  const dbConnected = await checkDatabaseConnection();

  console.log("\n=== Dependencies Check ===");
  const depsOk = checkDependencies();

  console.log("\n=== Production Build Check ===");
  const buildOk = await checkBuild();

  console.log("\n=== Summary ===");
  if (dbConnected && depsOk && buildOk && securityIssues.length === 0) {
    console.log(
      "✅ Your Lost & Found Portal is ready for production deployment!"
    );
  } else {
    console.log(
      "⚠️ Address the issues above before proceeding with production deployment."
    );
    if (securityIssues.length > 0) {
      console.log(`- ${securityIssues.length} security issues to fix`);
    }
    if (!dbConnected) {
      console.log("- Database connection issues");
    }
    if (!depsOk) {
      console.log("- Dependency issues");
    }
    if (!buildOk) {
      console.log("- Build issues");
    }
  }
}

runChecks().catch(console.error);

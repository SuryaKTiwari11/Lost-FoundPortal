import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import fs from "fs";

// Get the directory name for the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("Loaded .env file from:", envPath);
} else {
  console.log(".env file not found, using default values");
  dotenv.config();
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

console.log("Using admin email:", ADMIN_EMAIL);
// Don't log the actual password for security
console.log(
  "Admin password is",
  ADMIN_PASSWORD ? "configured" : "using default"
);

// Connect to MongoDB
async function connectDB() {
  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/lostnfound";
    console.log(`Connecting to MongoDB at: ${uri}`);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// Define User schema for this script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
});

// Reset admin password
async function resetAdminPassword() {
  try {
    await connectDB();

    // Use the User model
    const User = mongoose.model("User", userSchema);

    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log("Generated hashed password for admin");

    // Try to find admin user
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (adminUser) {
      console.log("Admin user found! Updating password...");

      // Update password and ensure admin role
      adminUser.password = hashedPassword;
      adminUser.role = "admin";
      adminUser.isVerified = true;
      adminUser.updatedAt = new Date();

      await adminUser.save();
      console.log("Admin password updated successfully!");
      console.log("You can now login with:");
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
    } else {
      console.log("Admin user not found! Creating new admin user...");

      const newAdmin = new User({
        name: "Admin User",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newAdmin.save();
      console.log("New admin user created successfully!");
      console.log("You can now login with:");
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
    }

    console.log("Database updated successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the function
resetAdminPassword().catch(console.error);

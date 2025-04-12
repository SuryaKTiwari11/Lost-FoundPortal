import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Error: ADMIN_EMAIL or ADMIN_PASSWORD is not set in the .env file."
  );
  process.exit(1);
}

// Define User schema for this script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
});

// Function to connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log("Attempting to connect to MongoDB...");
    const connectionString =
      process.env.MONGODB_URI || "mongodb://localhost:27017/lostnfound";
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB successfully!");
    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return false;
  }
}

// Function to create or update admin user
async function fixAdminUser() {
  try {
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error("Cannot proceed without database connection");
      process.exit(1);
    }

    // Create User model
    const User = mongoose.model("User", userSchema);

    console.log(`Looking for admin user with email: ${ADMIN_EMAIL}`);

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log("Password hashed successfully");

    // Find admin user
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log("Admin user found - updating credentials");

      // Update admin user
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "admin";
      existingAdmin.isVerified = true;
      existingAdmin.name = existingAdmin.name || "Admin User";

      await existingAdmin.save();
      console.log("Admin user updated successfully!");
    } else {
      console.log("Admin user not found - creating new admin user");

      // Create new admin user
      const newAdmin = new User({
        name: "Admin User",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      });

      await newAdmin.save();
      console.log("New admin user created successfully!");
    }

    console.log("\n=== ADMIN LOGIN INFORMATION ===");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log("===============================\n");

    console.log("Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");

    return true;
  } catch (error) {
    console.error("Error fixing admin user:", error);
    return false;
  }
}

// Execute the function
fixAdminUser()
  .then((success) => {
    if (success) {
      console.log("Admin user setup completed successfully!");
      process.exit(0);
    } else {
      console.error("Failed to set up admin user");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });

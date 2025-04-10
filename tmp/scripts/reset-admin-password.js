// Script to reset the admin password in the database
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function resetAdminPassword() {
  try {
    // Ensure we have the MongoDB URI
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error("MongoDB URI not found in environment variables");
      console.log(
        "Using default local MongoDB URI: mongodb://localhost:27017/lost-found-portal"
      );
    }

    const uri = MONGODB_URI || "mongodb://localhost:27017/lost-found-portal";
    console.log("Connecting to MongoDB with URI:", uri);

    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");

    // Define a basic user schema - enough for our password reset
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
    });

    // Get the User model
    const User = mongoose.models.User || mongoose.model("User", userSchema);

    // Plaintext password to set
    const newPassword = "password123";

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log("Generated new password hash:", hashedPassword);

    // Find admin user and update password
    const result = await User.findOneAndUpdate(
      { email: "admin@lostfound.com" },
      {
        $set: {
          password: hashedPassword,
          // Ensure admin role and verification
          role: "admin",
          isVerified: true,
        },
      },
      { new: true }
    );

    if (result) {
      console.log("Admin password reset successful!");
      console.log("Admin user details:");
      console.log("- Email:", result.email);
      console.log("- Name:", result.name);
      console.log("- Role:", result.role);

      // Verify the password can be compared correctly
      const passwordMatch = await bcrypt.compare(newPassword, result.password);
      console.log(
        "Password verification test:",
        passwordMatch ? "PASSED" : "FAILED"
      );
    } else {
      console.log("Admin user not found! Creating new admin user...");

      const newAdmin = new User({
        name: "Admin User",
        email: "admin@lostfound.com",
        password: hashedPassword,
        phoneNumber: "9876543210",
        institution: "Thapar Institute",
        role: "admin",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newAdmin.save();
      console.log("New admin user created successfully!");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the password reset function
resetAdminPassword();

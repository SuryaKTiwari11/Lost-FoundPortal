const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(userSchema);
const userSchema = {
  firstName: {
    type: String,
    required: [true, "First name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
  },
  rollNumber: {
    type: String,
    required: [true, "Student ID is required"],
    unique: true,
    match: [/^[a-zA-Z0-9]+$/, "Roll number must be alphanumeric"],
  },
  universityEmail: {
    type: String,
    required: [true, "University email is required"],
    unique: true,
    match: [/@thapar\.edu$/, "Email must be a valid @college.edu address"],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false, // Don't return password in query results
  },
  profilePicture: {
    type: String,
    default: "", // URL to default profile image could go here
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

// Export the schema (assuming you're using Mongoose)

// Pre-save middleware to hash password could be added here

module.exports = mongoose.model("User", UserSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  email: string; // Google email (thapar.edu)
  name: string; // Full name from Google
  image?: string; // Profile picture from Google
  role: string; // User role (user, admin)
  rollNumber?: string; // Student/Faculty ID
  contactPhone?: string; // Contact phone number
  alternateEmail?: string; // Alternative email address
  department?: string; // Department/School
  yearOfStudy?: string; // For students: 1st year, 2nd year, etc.
  hostelDetails?: string; // For hostel residents
  bio?: string; // Short bio/introduction
  lastLogin: Date; // Last login timestamp
  createdAt: Date; // Account creation timestamp
  updatedAt: Date; // Profile update timestamp
}

const UserSchema: Schema<User> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/@thapar\.edu$/, "Email must be a valid @thapar.edu address"],
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    rollNumber: {
      type: String,
      trim: true,
      match: [
        /^[0-9A-Z]+$/,
        "Roll number should only contain alphanumeric characters",
      ],
    },
    contactPhone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, "Please provide a valid phone number"],
    },
    alternateEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    department: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: String,
      enum: [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year",
        "Faculty",
        "Staff",
        "Other",
      ],
    },
    hostelDetails: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically updates the updatedAt field
  }
);

export default mongoose.models.User || mongoose.model<User>("User", UserSchema);

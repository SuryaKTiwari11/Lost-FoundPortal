import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  email: string; // Google email (thapar.edu)
  name: string; // Full name from Google
  image?: string; // Profile picture from Google
  role: string; // User role (user, admin)
  lastLogin: Date; // Last login timestamp
  createdAt: Date; // Account creation timestamp
}

const UserSchema: Schema<User> = new Schema({
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
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model<User>("User", UserSchema);

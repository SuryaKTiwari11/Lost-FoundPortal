import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  firstName: string;
  lastName: string;
  rollNumber: string;
  universityEmail: string;
  password: string;
  profilePicture?: string;
  verified: boolean;
  isAcceptingMessages: boolean;
  createdAt: Date;
}

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
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyCode: {
    type: String,
    select: false, // Don't return verification code in query results
  },
  verifyCodeExpiry: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

const UserSchema: Schema<User> = new Schema(userSchema);

// Export the model
export default mongoose.models.User || mongoose.model<User>("User", UserSchema);
//first time create or use existing model
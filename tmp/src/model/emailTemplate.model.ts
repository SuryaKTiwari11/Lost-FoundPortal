import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the Email Template document
export interface EmailTemplate extends Document {
  name: string;
  subject: string;
  body: string;
  type: "notification" | "match" | "claim" | "verification" | "other";
  createdBy: mongoose.Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const emailTemplateSchema = new Schema<EmailTemplate>(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      maxlength: [100, "Template name cannot exceed 100 characters"],
      unique: true,
    },
    subject: {
      type: String,
      required: [true, "Email subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Email body is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Template type is required"],
      enum: {
        values: ["notification", "match", "claim", "verification", "other"],
        message: "Invalid template type",
      },
      default: "notification",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create or use existing model
export default mongoose.models.EmailTemplate ||
  mongoose.model<EmailTemplate>("EmailTemplate", emailTemplateSchema);

import mongoose, { Schema, Document } from "mongoose";
import { User } from "./user.model";
import { LostItem } from "./lostItem.model";

// Define the interface for the Found Report document
export interface FoundReport extends Document {
  lostItem: mongoose.Types.ObjectId | LostItem;
  foundBy: mongoose.Types.ObjectId | User;
  foundLocation: string;
  foundDate: Date;
  currentHoldingLocation: string;
  additionalNotes?: string;
  contactPhone?: string;
  status: "pending" | "verified" | "rejected";
  adminNotes?: string;
  verifiedBy?: mongoose.Types.ObjectId | User;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const foundReportSchema = new Schema<FoundReport>(
  {
    // Related Lost Item
    lostItem: {
      type: Schema.Types.ObjectId,
      ref: "LostItem",
      required: [true, "Lost item reference is required"],
    },

    // Reporter Info
    foundBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User who found the item is required"],
    },

    // Found Details
    foundLocation: {
      type: String,
      required: [true, "Location where item was found is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    foundDate: {
      type: Date,
      required: [true, "Date when item was found is required"],
      default: Date.now,
    },
    currentHoldingLocation: {
      type: String,
      required: [true, "Current holding location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    contactPhone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, "Please provide a valid phone number"],
    },

    // Status & Admin Info
    status: {
      type: String,
      enum: {
        values: ["pending", "verified", "rejected"],
        message: "Invalid status value",
      },
      default: "pending",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Admin notes cannot exceed 500 characters"],
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create or use existing model
export default mongoose.models.FoundReport ||
  mongoose.model<FoundReport>("FoundReport", foundReportSchema);

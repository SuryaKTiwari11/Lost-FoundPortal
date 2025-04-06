import mongoose, { Schema, Document } from "mongoose";
import { User } from "./user.model";

// Define the interface for the Found Item document
export interface FoundItem extends Document {
  itemName: string;
  description: string;
  category: string;
  foundLocation: string;
  foundDate: Date;
  currentHoldingLocation?: string;
  imageURL?: string;
  reportedBy: mongoose.Types.ObjectId | User;
  contactEmail: string;
  contactPhone?: string;
  status: "found" | "claimed" | "verified" | "rejected";
  isVerified: boolean;
  claimedBy?: mongoose.Types.ObjectId | User;
  claimRequestIds: mongoose.Types.ObjectId[] | User[];
  matchedWithLostItem?: mongoose.Types.ObjectId;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Categories for found items
export const ITEM_CATEGORIES = [
  "Electronics",
  "Books",
  "Accessories",
  "Clothing",
  "ID Cards",
  "Keys",
  "Documents",
  "Others",
];

// Define the schema
const foundItemSchema = new Schema<FoundItem>(
  {
    // Basic Details
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ITEM_CATEGORIES,
        message: "Invalid category selected",
      },
    },

    // Location & Time
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
      trim: true,
      maxlength: [200, "Current holding location cannot exceed 200 characters"],
    },

    // Media
    imageURL: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          // Basic URL validation
          return !v || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v);
        },
        message: "Invalid image URL format",
      },
    },

    // Reporter Info
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User who reported the item is required"],
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    contactPhone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, "Please provide a valid phone number"],
    },

    // Status & Metadata
    status: {
      type: String,
      enum: {
        values: ["found", "claimed", "verified", "rejected"],
        message: "Invalid status value",
      },
      default: "found",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    claimRequestIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    matchedWithLostItem: {
      type: Schema.Types.ObjectId,
      ref: "LostItem",
    },
    claimedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create or use existing model
export default mongoose.models.FoundItem ||
  mongoose.model<FoundItem>("FoundItem", foundItemSchema);

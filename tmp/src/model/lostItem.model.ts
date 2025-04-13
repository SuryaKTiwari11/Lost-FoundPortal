import mongoose, { Schema, Document } from "mongoose";
import { User } from "./user.model";

// Define the interface for the Lost Item document
export interface LostItem extends Document {
  itemName: string;
  description: string;
  category: string;
  lostLocation: string; // Changed from lastLocation for consistency
  lostDate: Date; // Changed from dateLost for consistency
  imageURL?: string;
  images?: string[]; // Added to match API usage
  reportedBy: mongoose.Types.ObjectId | User;
  contactEmail: string;
  contactPhone?: string;
  ownerName?: string; // Added to match API usage
  reward?: string; // Added to match API usage
  status: "lost" | "found" | "claimed" | "foundReported" | "pending_claim";
  foundReports: mongoose.Types.ObjectId[];
  matchedWithFoundItem?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Categories for lost items (same as found items for consistency)
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
const lostItemSchema = new Schema<LostItem>(
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
    lostLocation: {
      // Changed from lastLocation
      type: String,
      required: [true, "Lost location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    lostDate: {
      // Changed from dateLost
      type: Date,
      required: [true, "Date when item was lost is required"],
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
    images: {
      type: [String],
      default: [],
    },

    // Owner and Reporter Info
    ownerName: {
      type: String,
      trim: true,
    },
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
    reward: {
      type: String,
      trim: true,
    },

    // Status & Related Reports
    status: {
      type: String,
      enum: {
        values: ["lost", "found", "claimed", "foundReported", "pending_claim"],
        message: "Invalid status value",
      },
      default: "lost",
    },
    foundReports: [
      {
        type: Schema.Types.ObjectId,
        ref: "FoundReport",
      },
    ],
    matchedWithFoundItem: {
      type: Schema.Types.ObjectId,
      ref: "FoundItem",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create or use existing model
export default mongoose.models.LostItem ||
  mongoose.model<LostItem>("LostItem", lostItemSchema);

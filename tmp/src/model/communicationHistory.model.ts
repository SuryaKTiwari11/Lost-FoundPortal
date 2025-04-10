import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the Communication History document
export interface CommunicationHistory extends Document {
  userId: mongoose.Types.ObjectId;
  itemId?: mongoose.Types.ObjectId;
  type: "email" | "notification" | "system" | "other";
  subject: string;
  body: string;
  status: "sent" | "failed" | "pending";
  metadata?: {
    emailTemplate?: string;
    ipAddress?: string;
    userAgent?: string;
    deliveryStatus?: string;
    openedAt?: Date;
    clickedAt?: Date;
  };
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const communicationHistorySchema = new Schema<CommunicationHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    itemId: {
      type: Schema.Types.ObjectId,
      refPath: "itemType",
    },
    itemType: {
      type: String,
      enum: ["FoundItem", "LostItem"],
      default: "FoundItem",
    },
    type: {
      type: String,
      required: [true, "Communication type is required"],
      enum: {
        values: ["email", "notification", "system", "other"],
        message: "Invalid communication type",
      },
    },
    subject: {
      type: String,
      required: [true, "Communication subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Communication body is required"],
      trim: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["sent", "failed", "pending"],
        message: "Invalid status",
      },
      default: "pending",
    },
    metadata: {
      emailTemplate: String,
      ipAddress: String,
      userAgent: String,
      deliveryStatus: String,
      openedAt: Date,
      clickedAt: Date,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create or use existing model
export default mongoose.models.CommunicationHistory ||
  mongoose.model<CommunicationHistory>(
    "CommunicationHistory",
    communicationHistorySchema
  );

import mongoose, { Document, Schema } from "mongoose";

export interface ClaimRequest extends Document {
  item: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  proofOfOwnership: string;
  contactPhone?: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
}

const ClaimRequestSchema = new Schema<ClaimRequest>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: "FoundItem",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    proofOfOwnership: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ClaimRequest ||
  mongoose.model<ClaimRequest>("ClaimRequest", ClaimRequestSchema);

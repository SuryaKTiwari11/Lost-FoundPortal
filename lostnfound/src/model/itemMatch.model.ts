import mongoose, { Document, Schema } from "mongoose";

export interface ItemMatch extends Document {
  lostItem: mongoose.Types.ObjectId;
  foundItem: mongoose.Types.ObjectId;
  matchedBy: mongoose.Types.ObjectId;
  matchType: "automatic" | "manual";
  matchDate: Date;
  status: "pending" | "confirmed" | "rejected";
  confirmedBy?: mongoose.Types.ObjectId;
  confirmedDate?: Date;
}

const ItemMatchSchema = new Schema<ItemMatch>(
  {
    lostItem: {
      type: Schema.Types.ObjectId,
      ref: "LostItem",
      required: true,
    },
    foundItem: {
      type: Schema.Types.ObjectId,
      ref: "FoundItem",
      required: true,
    },
    matchedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchType: {
      type: String,
      enum: ["automatic", "manual"],
      default: "manual",
    },
    matchDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
    confirmedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    confirmedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ItemMatch ||
  mongoose.model<ItemMatch>("ItemMatch", ItemMatchSchema);

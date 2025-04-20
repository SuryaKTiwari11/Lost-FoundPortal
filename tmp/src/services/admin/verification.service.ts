import { ApiResponse } from "@/types/ApiResponse";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";

export interface VerificationStepData {
  itemId: string;
  stepType: "photo" | "description" | "ownershipProof";
  verified: boolean;
  notes?: string;
  adminId: string;
}

/**
 * Service for managing verification steps for found items
 */
export class VerificationService {
  /**
   * Process a verification step for a found item
   */
  async verifyItemStep(data: VerificationStepData): Promise<ApiResponse> {
    try {
      await dbConnect();

      const { itemId, stepType, verified, notes, adminId } = data;

      // Find the item
      const item = await FoundItem.findById(itemId);
      if (!item) {
        return {
          success: false,
          error: "Item not found",
        };
      }

      // Initialize verification steps object if it doesn't exist
      if (!item.verificationSteps) {
        item.verificationSteps = {};
      }

      // Initialize verification history array if it doesn't exist
      if (!item.verificationHistory) {
        item.verificationHistory = [];
      }

      const now = new Date();

      // Update the specific verification step
      switch (stepType) {
        case "photo":
          item.verificationSteps.photoVerified = verified;
          item.verificationSteps.photoVerifiedAt = now;
          item.verificationSteps.photoVerifiedBy = adminId;
          item.verificationSteps.photoVerificationNotes = notes || "";
          break;
        case "description":
          item.verificationSteps.descriptionVerified = verified;
          item.verificationSteps.descriptionVerifiedAt = now;
          item.verificationSteps.descriptionVerifiedBy = adminId;
          item.verificationSteps.descriptionVerificationNotes = notes || "";
          break;
        case "ownershipProof":
          item.verificationSteps.ownershipProofVerified = verified;
          item.verificationSteps.ownershipProofVerifiedAt = now;
          item.verificationSteps.ownershipProofVerifiedBy = adminId;
          item.verificationSteps.ownershipProofVerificationNotes = notes || "";
          break;
        default:
          return {
            success: false,
            error: "Invalid verification step type",
          };
      }

      // Add to verification history
      item.verificationHistory.push({
        timestamp: now,
        action: `${stepType}Verification-${verified ? "approved" : "rejected"}`,
        performedBy: adminId,
        notes: notes || "",
      });

      // If all verification steps are completed and approved, mark the item as verified
      const allVerified =
        item.verificationSteps.photoVerified !== false &&
        item.verificationSteps.descriptionVerified !== false &&
        item.verificationSteps.ownershipProofVerified !== false;

      // Check if at least one step has been explicitly verified
      const hasVerifiedSteps =
        item.verificationSteps.photoVerified === true ||
        item.verificationSteps.descriptionVerified === true ||
        item.verificationSteps.ownershipProofVerified === true;

      // Update the overall verification status only if we have verified steps
      if (hasVerifiedSteps) {
        if (allVerified) {
          item.isVerified = true;
          item.status = "verified";
        } else {
          item.isVerified = false;
        }
      }

      await item.save();

      return {
        success: true,
        message: `Verification step '${stepType}' ${
          verified ? "approved" : "rejected"
        }`,
        data: {
          verificationSteps: item.verificationSteps,
          isVerified: item.isVerified,
        },
      };
    } catch (error: any) {
      console.error("Error in verification:", error);
      return {
        success: false,
        error: error.message || "Failed to update verification status",
      };
    }
  }

  /**
   * Get verification details for an item
   */
  async getVerificationDetails(itemId: string): Promise<ApiResponse> {
    try {
      await dbConnect();

      const item = await FoundItem.findById(itemId)
        .populate("verificationSteps.photoVerifiedBy", "name email")
        .populate("verificationSteps.descriptionVerifiedBy", "name email")
        .populate("verificationSteps.ownershipProofVerifiedBy", "name email")
        .populate("verificationHistory.performedBy", "name email");

      if (!item) {
        return {
          success: false,
          error: "Item not found",
        };
      }

      return {
        success: true,
        data: {
          verificationSteps: item.verificationSteps || {},
          verificationHistory: item.verificationHistory || [],
          isVerified: item.isVerified,
        },
      };
    } catch (error: any) {
      console.error("Error retrieving verification data:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve verification details",
      };
    }
  }
}

// Export a singleton instance
export const verificationService = new VerificationService();

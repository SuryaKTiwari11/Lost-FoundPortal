import { ApiResponse } from "@/types";
import { ClaimRequest, ClaimStatus } from "@/types/claims";
import dbConnect from "@/lib/dbConnect";
import ClaimRequestModel from "@/model/claimRequest.model";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import User from "@/model/user.model";
import { sendEmail, emailTemplates } from "@/lib/email";

/**
 * Server-side service for claim operations
 */
export const claimsService = {
  /**
   * Get all claims
   */
  async getAllClaims(): Promise<ApiResponse> {
    try {
      await dbConnect();
      const claims = await ClaimRequestModel.find()
        .sort({ createdAt: -1 })
        .populate("foundItem")
        .populate("lostItem")
        .populate("claimant", "name email");

      return {
        success: true,
        data: claims,
      };
    } catch (error) {
      console.error("Error fetching all claims:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch claims",
      };
    }
  },

  /**
   * Get claims for a specific item
   */
  async getClaimsForItem(
    itemId: string,
    itemType: "lost" | "found"
  ): Promise<ApiResponse> {
    try {
      await dbConnect();

      const query =
        itemType === "lost" ? { lostItem: itemId } : { foundItem: itemId };

      const claims = await ClaimRequestModel.find(query)
        .sort({ createdAt: -1 })
        .populate("foundItem")
        .populate("lostItem")
        .populate("claimant", "name email");

      return {
        success: true,
        data: claims,
      };
    } catch (error) {
      console.error(`Error fetching claims for ${itemType} item:`, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : `Failed to fetch claims for ${itemType} item`,
      };
    }
  },

  /**
   * Get a specific claim by ID
   */
  async getClaimById(claimId: string): Promise<ApiResponse> {
    try {
      await dbConnect();
      const claim = await ClaimRequestModel.findById(claimId)
        .populate("foundItem")
        .populate("lostItem")
        .populate("claimant", "name email");

      if (!claim) {
        return {
          success: false,
          error: "Claim not found",
        };
      }

      return {
        success: true,
        data: claim,
      };
    } catch (error) {
      console.error("Error fetching claim:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch claim",
      };
    }
  },

  /**
   * Process a claim (approve or reject)
   */
  async processClaim(
    claimId: string,
    approved: boolean,
    adminNotes: string,
    processedBy: string
  ): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Find the claim
      const claim = await ClaimRequestModel.findById(claimId)
        .populate("foundItem")
        .populate("lostItem")
        .populate("claimant");

      if (!claim) {
        return {
          success: false,
          error: "Claim not found",
        };
      }

      // Check if claim is already processed
      if (claim.status !== "pending") {
        return {
          success: false,
          error: `Claim is already ${claim.status}`,
        };
      }

      // Update claim status
      claim.status = approved ? "approved" : "rejected";
      claim.adminNotes = adminNotes;
      claim.processedBy = processedBy;
      claim.processedAt = new Date();

      await claim.save();

      // If approved, update the found item status
      if (approved && claim.foundItem) {
        const foundItem = await FoundItem.findById(claim.foundItem._id);
        if (foundItem) {
          foundItem.status = "claimed";
          foundItem.claimedBy = claim.claimant._id;
          foundItem.claimedAt = new Date();
          await foundItem.save();
        }

        // If there's a matched lost item, update its status too
        if (claim.lostItem) {
          const lostItem = await LostItem.findById(claim.lostItem._id);
          if (lostItem) {
            lostItem.status = "found";
            lostItem.resolvedAt = new Date();
            await lostItem.save();
          }
        }
      } else if (!approved && claim.foundItem) {
        // If rejected, reset the found item status if no other pending claims
        const foundItem = await FoundItem.findById(claim.foundItem._id);
        const otherPendingClaims = await ClaimRequestModel.findOne({
          foundItem: claim.foundItem._id,
          status: "pending",
          _id: { $ne: claimId },
        });

        if (foundItem && !otherPendingClaims) {
          foundItem.status = "verified";
          await foundItem.save();
        }
      }

      // Send email notification to claimant
      if (claim.claimant?.email) {
        try {
          const itemName = claim.foundItem?.itemName || "item";
          const emailData = {
            userName: claim.claimant.name || "User",
            itemName,
            claimStatus: approved ? "approved" : "rejected",
            adminNotes,
            portalUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
          };

          const emailTemplate = approved
            ? emailTemplates.claimApproved(emailData)
            : emailTemplates.claimRejected(emailData);

          await sendEmail({
            to: claim.claimant.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });

          console.log(
            `Claim ${approved ? "approval" : "rejection"} email sent to ${claim.claimant.email}`
          );
        } catch (emailError) {
          console.error("Error sending claim notification email:", emailError);
          // Don't fail the operation if email fails
        }
      }

      return {
        success: true,
        message: `Claim ${approved ? "approved" : "rejected"} successfully`,
        data: claim,
      };
    } catch (error) {
      console.error("Error processing claim:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process claim",
      };
    }
  },

  /**
   * Cancel a claim
   */
  async cancelClaim(claimId: string, reason: string): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Find the claim
      const claim = await ClaimRequestModel.findById(claimId);
      if (!claim) {
        return {
          success: false,
          error: "Claim not found",
        };
      }

      // Check if claim can be canceled
      if (claim.status !== "pending") {
        return {
          success: false,
          error: `Claim with status '${claim.status}' cannot be canceled`,
        };
      }

      // Update claim
      claim.status = "canceled";
      claim.cancellationReason = reason || "Canceled by user";
      claim.updatedAt = new Date();

      await claim.save();

      // Reset found item status if this was the only pending claim
      const foundItem = await FoundItem.findById(claim.foundItem);
      if (foundItem) {
        const otherPendingClaims = await ClaimRequestModel.findOne({
          foundItem: claim.foundItem,
          status: "pending",
          _id: { $ne: claimId },
        });

        if (!otherPendingClaims) {
          foundItem.status = "verified";
          await foundItem.save();
        }
      }

      return {
        success: true,
        message: "Claim canceled successfully",
      };
    } catch (error) {
      console.error("Error canceling claim:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to cancel claim",
      };
    }
  },
};

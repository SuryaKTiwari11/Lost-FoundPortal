import dbConnect from "@/lib/dbConnect";
import ClaimRequest from "@/model/claimRequest.model";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import CommunicationHistory from "@/model/communicationHistory.model";
import User from "@/model/user.model";
import { sendEmail, emailTemplates } from "@/lib/email";
import type { ApiResponse } from "@/types";

/**
 * Claims Service
 * Handles business logic for claim requests
 */
export const claimsService = {
  /**
   * Process a claim request (approve or reject)
   */
  async processClaim(
    claimId: string,
    approved: boolean,
    adminNotes?: string,
    adminId?: string
  ): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Find the claim request
      const claimRequest = await ClaimRequest.findById(claimId);

      if (!claimRequest) {
        return {
          success: false,
          error: "Claim request not found",
        };
      }

      // Check if claim is already processed
      if (claimRequest.status !== "pending") {
        return {
          success: false,
          error: `Claim request has already been ${claimRequest.status}`,
        };
      }

      // Update claim status
      claimRequest.status = approved ? "approved" : "rejected";
      claimRequest.processedBy = adminId;
      claimRequest.processedAt = new Date();

      if (adminNotes) {
        claimRequest.adminNotes = adminNotes;
      }

      await claimRequest.save();

      // If approved, update the found item status
      if (approved) {
        const foundItem = await FoundItem.findById(claimRequest.foundItemId);

        if (foundItem) {
          foundItem.status = "claimed";
          foundItem.claimedBy = claimRequest.claimedBy;
          foundItem.claimedAt = new Date();
          await foundItem.save();
        }
      }

      // Send email notification to the claimer
      const claimer = await User.findById(claimRequest.claimedBy);
      if (claimer && claimer.email) {
        const foundItem = await FoundItem.findById(claimRequest.foundItemId);
        const itemName = foundItem ? foundItem.name : "the item";

        try {
          await sendEmail({
            to: claimer.email,
            subject: approved
              ? `Your claim for ${itemName} has been approved`
              : `Update on your claim for ${itemName}`,
            text: approved
              ? `Your claim for ${itemName} has been approved. Please contact the admin for further instructions.`
              : `We're sorry, but your claim for ${itemName} could not be verified. ${adminNotes || ""}`,
          });
        } catch (emailError) {
          console.error("Failed to send claim notification email:", emailError);
          // Continue processing even if email fails
        }
      }

      return {
        success: true,
        data: {
          message: `Claim request ${approved ? "approved" : "rejected"} successfully`,
          claimRequest,
        },
      };
    } catch (error: any) {
      console.error("Error processing claim request:", error);
      return {
        success: false,
        error: error.message || "Failed to process claim request",
      };
    }
  },

  /**
   * Get claim requests with optional status filter
   */
  async getClaimRequests(status?: string): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Build query
      const query: any = {};
      if (status) {
        query.status = status;
      }

      // Find claim requests
      const claims = await ClaimRequest.find(query)
        .sort({ createdAt: -1 })
        .populate("foundItemId", "name category location date status image")
        .populate("claimedBy", "name email")
        .populate("processedBy", "name email")
        .lean();

      return {
        success: true,
        data: claims,
      };
    } catch (error: any) {
      console.error("Error fetching claim requests:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch claim requests",
      };
    }
  },

  /**
   * Get all claim requests
   */
  async getAllClaims(): Promise<ApiResponse> {
    try {
      await dbConnect();
      const claims = await ClaimRequest.find()
        .sort({ createdAt: -1 })
        .populate("userId", "name email")
        .populate("itemId", "name category status");

      return {
        success: true,
        data: claims,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch claims",
      };
    }
  },

  /**
   * Get claim details by ID
   */
  async getClaimById(claimId: string): Promise<ApiResponse> {
    await dbConnect();

    try {
      const claim = await ClaimRequest.findById(claimId)
        .populate({
          path: "foundItem",
          select: "itemName description location category images status",
        })
        .populate({
          path: "claimedBy",
          select: "name email",
        })
        .populate({
          path: "processedBy",
          select: "name email",
        });

      if (!claim) {
        return {
          success: false,
          error: "Claim request not found",
        };
      }

      return {
        success: true,
        data: claim,
      };
    } catch (error) {
      console.error("Error in claimsService.getClaimById:", error);
      throw error;
    }
  },
};

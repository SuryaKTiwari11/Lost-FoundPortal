import { ApiResponse } from "@/types/ApiResponse";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import ClaimRequest from "@/model/claimRequest.model";
import ItemMatch from "@/model/itemMatch.model";
import User from "@/model/user.model";
import { sendEmail } from "@/lib/email";

export interface ClaimRequestsQueryParams {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  limit?: number;
}

export interface VerificationData {
  itemId: string;
  stepType: "photo" | "description" | "ownershipProof";
  verified: boolean;
  notes?: string;
}

export const adminService = {
  async getClaimRequests(status: string = "pending"): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Build query with status filter
      const query: any = {};
      if (status) {
        query.status = status;
      }

      // Get claim requests with their associated item and user data
      const claims = await ClaimRequest.find(query)
        .populate({
          path: "item",
          populate: {
            path: "reportedBy",
            select: "name email",
          },
        })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        data: {
          claims,
        },
      };
    } catch (error: any) {
      console.error("Error fetching claim requests:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch claim requests",
      };
    }
  },

  async processClaimRequest(
    claimId: string,
    approved: boolean,
    notes: string
  ): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Find the claim request
      const claim = await ClaimRequest.findById(claimId);
      if (!claim) {
        return {
          success: false,
          error: "Claim request not found",
        };
      }

      // Update claim status
      claim.status = approved ? "approved" : "rejected";
      claim.processingNotes = notes || "";
      claim.processedAt = new Date();
      await claim.save();

      // If approved, update the item status and assign to the claiming user
      if (approved) {
        const foundItem = await FoundItem.findById(claim.item);
        if (foundItem) {
          foundItem.status = "claimed";
          foundItem.claimedBy = claim.user;
          foundItem.claimedAt = new Date();
          await foundItem.save();
        }
      }

      // Send email notification
      const user = await User.findById(claim.user);
      const item = await FoundItem.findById(claim.item);

      if (user && user.email && item) {
        const emailSubject = approved
          ? "Your Claim Request Has Been Approved"
          : "Update on Your Claim Request";

        const portalURL = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const itemDetailsUrl = `${portalURL}/found-items/${item._id}`;

        const emailHtml = approved
          ? `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Your Claim Has Been Approved!</h2>
              <p>Good news! Your claim for the item "${item.itemName}" has been approved.</p>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <h3 style="margin-top: 0;">Item Details:</h3>
                <p><strong>Item:</strong> ${item.itemName}</p>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Found Location:</strong> ${item.foundLocation}</p>
                <p><strong>Date Found:</strong> ${new Date(item.foundDate).toLocaleDateString()}</p>
              </div>
              
              <p>To collect this item, please visit our Lost & Found office with appropriate identification.</p>
              
              <a href="${itemDetailsUrl}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Item Details</a>
              
              <p style="margin-top: 20px;">Office Hours:</p>
              <ul>
                <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
                <li>Saturday: 10:00 AM - 2:00 PM</li>
              </ul>
              <p>Please bring your ID card for verification when collecting the item.</p>
              <p>If you have any questions, please contact the office directly.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
                <p>This is an automated message from the Lost & Found Portal.</p>
              </div>
            </div>
          `
          : `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Update on Your Claim Request</h2>
              <p>Thank you for submitting a claim for the item "${item.itemName}". After careful review, we were unable to verify your ownership of this item.</p>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <h3 style="margin-top: 0;">Item Details:</h3>
                <p><strong>Item:</strong> ${item.itemName}</p>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Found Location:</strong> ${item.foundLocation}</p>
              </div>
              
              <p>Notes from the review: ${notes || "No additional information provided."}</p>
              
              <p>If you believe this decision is incorrect or if you have additional information to support your claim, please visit our office in person with proof of ownership.</p>
              
              <a href="${itemDetailsUrl}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px;">View Item Details</a>
              
              <p style="margin-top: 20px;">Office Hours:</p>
              <ul>
                <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
                <li>Saturday: 10:00 AM - 2:00 PM</li>
              </ul>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
                <p>This is an automated message from the Lost & Found Portal.</p>
              </div>
            </div>
          `;

        try {
          await sendEmail({
            to: user.email,
            subject: emailSubject,
            html: emailHtml,
          });
        } catch (error) {
          console.error("Error sending claim notification email:", error);
          // Continue even if email fails
        }
      }

      return {
        success: true,
        message: approved
          ? "Claim approved successfully"
          : "Claim rejected successfully",
      };
    } catch (error: any) {
      console.error("Error processing claim:", error);
      return {
        success: false,
        error: error.message || "Failed to process claim request",
      };
    }
  },

  async createItemMatch(
    lostItemId: string,
    foundItemId: string
  ): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Find the items
      const lostItem =
        await LostItem.findById(lostItemId).populate("reportedBy");
      const foundItem = await FoundItem.findById(foundItemId);

      if (!lostItem || !foundItem) {
        return {
          success: false,
          error: "One or both items not found",
        };
      }

      // Create a new match
      const itemMatch = new ItemMatch({
        lostItem: lostItemId,
        foundItem: foundItemId,
        matchedAt: new Date(),
        status: "pending",
      });

      await itemMatch.save();

      // Update status of both items
      lostItem.status = "matched";
      foundItem.status = "matched";

      await lostItem.save();
      await foundItem.save();

      // Send email notification to the user who reported the lost item
      let userEmail = "";
      let userName = "User";

      if (lostItem.reportedBy) {
        if (
          typeof lostItem.reportedBy === "object" &&
          lostItem.reportedBy !== null
        ) {
          userEmail = lostItem.reportedBy.email || "";
          userName = lostItem.reportedBy.name || "User";
        }
      }

      // Fallback to contact email on the item if reportedBy didn't provide an email
      if (!userEmail && lostItem.contactEmail) {
        userEmail = lostItem.contactEmail;
      }

      if (userEmail) {
        const portalURL = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const itemDetailsUrl = `${portalURL}/found-items/${foundItem._id}`;

        try {
          await sendEmail({
            to: userEmail,
            subject: "Good News! Your Lost Item May Have Been Found",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Good News! Your Lost Item May Have Been Found</h2>
                <p>We're pleased to inform you that an item matching the description of your lost "${lostItem.itemName}" has been found and is currently at our Lost & Found office.</p>
                
                <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                  <h3 style="margin-top: 0;">Item Details:</h3>
                  <p><strong>Item:</strong> ${foundItem.itemName}</p>
                  <p><strong>Category:</strong> ${foundItem.category}</p>
                  <p><strong>Found Location:</strong> ${foundItem.foundLocation}</p>
                  <p><strong>Date Found:</strong> ${new Date(foundItem.foundDate).toLocaleDateString()}</p>
                </div>
                
                <p>To claim this item, please visit our Lost & Found office with appropriate identification and proof of ownership.</p>
                
                <a href="${itemDetailsUrl}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Found Item</a>
                
                <p style="margin-top: 20px;">Office Hours:</p>
                <ul>
                  <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
                  <li>Saturday: 10:00 AM - 2:00 PM</li>
                </ul>
              </div>
            `,
          });
        } catch (error) {
          console.error("Error sending match notification email:", error);
          // Continue even if email fails
        }
      }

      return {
        success: true,
        message: "Items matched successfully",
        data: {
          matchId: itemMatch._id,
        },
      };
    } catch (error: any) {
      console.error("Error creating item match:", error);
      return {
        success: false,
        error: error.message || "Failed to create item match",
      };
    }
  },

  async verifyItem(data: VerificationData): Promise<ApiResponse> {
    try {
      await dbConnect();

      const { itemId, stepType, verified, notes } = data;

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
          item.verificationSteps.photoVerificationNotes = notes || "";
          break;
        case "description":
          item.verificationSteps.descriptionVerified = verified;
          item.verificationSteps.descriptionVerifiedAt = now;
          item.verificationSteps.descriptionVerificationNotes = notes || "";
          break;
        case "ownershipProof":
          item.verificationSteps.ownershipProofVerified = verified;
          item.verificationSteps.ownershipProofVerifiedAt = now;
          item.verificationSteps.ownershipProofVerificationNotes = notes || "";
          break;
      }

      // Add to verification history
      item.verificationHistory.push({
        timestamp: now,
        action: `${stepType}Verification-${verified ? "approved" : "rejected"}`,
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
  },

  async getVerificationStatus(itemId: string): Promise<ApiResponse> {
    try {
      await dbConnect();

      const item = await FoundItem.findById(itemId);
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
        error: error.message || "Failed to get verification status",
      };
    }
  },

  async batchVerifyItems(
    ids: string[],
    isVerified: boolean
  ): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Validate IDs
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return {
          success: false,
          error: "No valid item IDs provided",
        };
      }

      // Update all specified found items
      const updateResult = await FoundItem.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            isVerified: isVerified,
            status: isVerified ? "verified" : "pending",
            updatedAt: new Date(),
          },
        }
      );

      return {
        success: true,
        message: `Batch ${
          isVerified ? "verification" : "unverification"
        } completed`,
        data: {
          modifiedCount: updateResult.modifiedCount,
          totalCount: ids.length,
        },
      };
    } catch (error: any) {
      console.error("Error in batch verification:", error);
      return {
        success: false,
        error: error.message || "Failed to batch verify items",
      };
    }
  },
};

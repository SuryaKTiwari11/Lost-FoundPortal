import dbConnect from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";
import FoundItem from "@/model/foundItem.model";
import ItemMatch from "@/model/itemMatch.model";
import FoundReport from "@/model/foundReport.model";
import User from "@/model/user.model";
import { sendEmail, emailTemplates } from "@/lib/email";
import type { ApiResponse, LostItemFormData, FoundReportData } from "@/types";

/**
 * Lost Items Service
 * Handles business logic for lost items operations
 */
export const lostItemsService = {
  /**
   * Get lost items with optional filtering
   */
  async getLostItems(
    params: Record<string, string> = {}
  ): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Prepare query filters
      const {
        category,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
        limit = "10",
        page = "1",
        search,
        userId,
      } = params;

      const filters: Record<string, any> = {};

      // Add filters if provided
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (userId) filters.reportedBy = userId;

      // Add search query if provided
      if (search) {
        filters.$or = [
          { itemName: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ];
      }

      // Set up pagination
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      // Set up sorting
      const sort: Record<string, 1 | -1> = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Query database
      const lostItems = await LostItem.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .populate("reportedBy", "name email")
        .lean();

      // Get total count for pagination
      const total = await LostItem.countDocuments(filters);

      return {
        success: true,
        data: {
          items: lostItems,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            pages: Math.ceil(total / limitNumber),
          },
        },
      };
    } catch (error) {
      console.error("Error in lostItemsService.getLostItems:", error);
      throw error;
    }
  },

  /**
   * Get a single lost item by ID
   */
  async getLostItemById(id: string): Promise<ApiResponse> {
    await dbConnect();

    try {
      const lostItem = await LostItem.findById(id)
        .populate("reportedBy", "name email")
        .lean();

      if (!lostItem) {
        return {
          success: false,
          error: "Lost item not found",
        };
      }

      // Get potential matches
      const matches = await ItemMatch.find({ lostItem: id })
        .populate({
          path: "foundItem",
          select: "itemName location foundDate images category status",
        })
        .lean();

      // Get any found reports
      const foundReports = await FoundReport.find({ lostItem: id })
        .populate("reportedBy", "name email")
        .lean();

      return {
        success: true,
        data: {
          ...lostItem,
          potentialMatches: matches,
          foundReports: foundReports,
        },
      };
    } catch (error) {
      console.error("Error in lostItemsService.getLostItemById:", error);
      throw error;
    }
  },

  /**
   * Report a new lost item
   */
  async reportLostItem(itemData: LostItemFormData): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Create the lost item
      const lostItem = new LostItem({
        ...itemData,
        status: "active",
        createdAt: new Date(),
      });

      await lostItem.save();

      // Check for potential matches with found items
      const potentialMatches =
        await this.findPotentialFoundItemMatches(lostItem);

      if (potentialMatches.length > 0) {
        // Create item matches
        for (const foundItem of potentialMatches) {
          const match = new ItemMatch({
            lostItem: lostItem._id,
            foundItem: foundItem._id,
            matchScore: this.calculateMatchScore(lostItem, foundItem),
            status: "pending",
            createdAt: new Date(),
          });

          await match.save();
        }

        // Notify user about potential matches
        try {
          const user = await User.findById(lostItem.reportedBy);

          if (user?.email) {
            const emailData = {
              userName: user.name || user.email,
              itemName: lostItem.itemName,
              matchCount: potentialMatches.length,
              nextSteps:
                "Please log in to view potential matches for your lost item.",
            };

            const emailTemplate = emailTemplates.potentialMatches(emailData);

            await sendEmail({
              to: user.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            });
          }
        } catch (emailError) {
          console.error(
            "Failed to send matches notification email:",
            emailError
          );
          // Don't fail the item creation if email sending fails
        }
      }

      return {
        success: true,
        message: "Lost item reported successfully",
        data: {
          ...lostItem.toObject(),
          potentialMatches: potentialMatches.length,
        },
      };
    } catch (error) {
      console.error("Error in lostItemsService.reportLostItem:", error);
      throw error;
    }
  },

  /**
   * Update a lost item
   */
  async updateLostItem(
    id: string,
    itemData: Partial<LostItemFormData>,
    userId: string
  ): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Find the lost item
      const lostItem = await LostItem.findById(id);

      if (!lostItem) {
        return {
          success: false,
          error: "Lost item not found",
        };
      }

      // Check if the user is authorized to update this item
      if (lostItem.reportedBy.toString() !== userId) {
        return {
          success: false,
          error: "Not authorized to update this item",
        };
      }

      // Update the item
      Object.assign(lostItem, itemData);
      lostItem.updatedAt = new Date();

      await lostItem.save();

      return {
        success: true,
        message: "Lost item updated successfully",
        data: lostItem,
      };
    } catch (error) {
      console.error("Error in lostItemsService.updateLostItem:", error);
      throw error;
    }
  },

  /**
   * Delete a lost item
   */
  async deleteLostItem(id: string, userId: string): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Find the lost item
      const lostItem = await LostItem.findById(id);

      if (!lostItem) {
        return {
          success: false,
          error: "Lost item not found",
        };
      }

      // Check if the user is authorized to delete this item
      if (lostItem.reportedBy.toString() !== userId) {
        return {
          success: false,
          error: "Not authorized to delete this item",
        };
      }

      // Delete the item
      await LostItem.findByIdAndDelete(id);

      // Delete any associated matches
      await ItemMatch.deleteMany({ lostItem: id });

      // Delete any associated found reports
      await FoundReport.deleteMany({ lostItem: id });

      return {
        success: true,
        message: "Lost item deleted successfully",
      };
    } catch (error) {
      console.error("Error in lostItemsService.deleteLostItem:", error);
      throw error;
    }
  },

  /**
   * Report that a lost item has been found
   */
  async reportItemFound(reportData: FoundReportData): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Find the lost item
      const lostItem = await LostItem.findById(reportData.lostItem);

      if (!lostItem) {
        return {
          success: false,
          error: "Lost item not found",
        };
      }

      // Create a found report
      const foundReport = new FoundReport({
        ...reportData,
        status: "pending",
        createdAt: new Date(),
      });

      await foundReport.save();

      // Notify the owner of the lost item
      try {
        const owner = await User.findById(lostItem.reportedBy);

        if (owner?.email) {
          const reporter = await User.findById(reportData.reportedBy);

          const emailData = {
            userName: owner.name || owner.email,
            itemName: lostItem.itemName,
            reporterName: reporter?.name || "Someone",
            location: reportData.foundLocation || "not specified",
            nextSteps:
              "Please log in to view the details and contact the finder.",
          };

          const emailTemplate = emailTemplates.itemFoundReport(emailData);

          await sendEmail({
            to: owner.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
        }
      } catch (emailError) {
        console.error(
          "Failed to send found report notification email:",
          emailError
        );
        // Don't fail the report creation if email sending fails
      }

      return {
        success: true,
        message: "Found report submitted successfully",
        data: foundReport,
      };
    } catch (error) {
      console.error("Error in lostItemsService.reportItemFound:", error);
      throw error;
    }
  },

  /**
   * Confirm a lost item as found and resolved
   */
  async confirmItemFound(
    lostItemId: string,
    resolution: "recovered" | "claimed",
    userId: string,
    foundItemId?: string
  ): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Find the lost item
      const lostItem = await LostItem.findById(lostItemId);

      if (!lostItem) {
        return {
          success: false,
          error: "Lost item not found",
        };
      }

      // Check if the user is authorized
      if (lostItem.reportedBy.toString() !== userId) {
        return {
          success: false,
          error: "Not authorized to update this item",
        };
      }

      // Update the lost item
      lostItem.status = "found";
      lostItem.resolution = resolution;
      lostItem.resolutionDate = new Date();

      if (foundItemId) {
        lostItem.matchedWithFoundItem = foundItemId;

        // Also update the found item if there's a match
        const foundItem = await FoundItem.findById(foundItemId);

        if (foundItem) {
          foundItem.matchedWithLostItem = lostItemId;
          foundItem.status = "matched";
          await foundItem.save();
        }
      }

      await lostItem.save();

      return {
        success: true,
        message: `Lost item marked as ${resolution}`,
        data: lostItem,
      };
    } catch (error) {
      console.error("Error in lostItemsService.confirmItemFound:", error);
      throw error;
    }
  },

  /**
   * Helper method to find potential found item matches
   */
  async findPotentialFoundItemMatches(lostItem: any): Promise<any[]> {
    // Find found items with matching category and active status
    const potentialMatches = await FoundItem.find({
      category: lostItem.category,
      status: { $in: ["pending", "approved"] },
    }).lean();

    // Filter based on other criteria if needed
    return potentialMatches;
  },

  /**
   * Helper method to calculate match score between lost and found items
   */
  calculateMatchScore(lostItem: any, foundItem: any): number {
    let score = 0;

    // Basic category match
    if (lostItem.category === foundItem.category) {
      score += 30;
    }

    // Name similarity
    const lostName = lostItem.itemName.toLowerCase();
    const foundName = foundItem.itemName.toLowerCase();

    if (lostName === foundName) {
      score += 30;
    } else if (lostName.includes(foundName) || foundName.includes(lostName)) {
      score += 15;
    }

    // Description similarity
    if (lostItem.description && foundItem.description) {
      const lostDesc = lostItem.description.toLowerCase();
      const foundDesc = foundItem.description.toLowerCase();

      if (lostDesc.includes(foundDesc) || foundDesc.includes(lostDesc)) {
        score += 10;
      }
    }

    // Location similarity
    if (lostItem.location && foundItem.location) {
      const lostLoc = lostItem.location.toLowerCase();
      const foundLoc = foundItem.location.toLowerCase();

      if (lostLoc === foundLoc) {
        score += 20;
      } else if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
        score += 10;
      }
    }

    // Date proximity
    if (lostItem.lostDate && foundItem.foundDate) {
      const lostDate = new Date(lostItem.lostDate);
      const foundDate = new Date(foundItem.foundDate);
      const diffDays =
        Math.abs(lostDate.getTime() - foundDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diffDays < 2) {
        score += 10;
      } else if (diffDays < 7) {
        score += 5;
      }
    }

    return Math.min(score, 100); // Cap at 100
  },
};

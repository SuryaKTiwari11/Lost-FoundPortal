import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import ItemMatch from "@/model/itemMatch.model";
import { sendEmail, emailTemplates } from "@/lib/email";
import User from "@/model/user.model";
import type { ApiResponse, FoundItemFormData } from "@/types";

/**
 * Found Items Service
 * Handles business logic for found items operations
 */
export const foundItemsService = {
  /**
   * Get found items with optional filtering
   */
  async getFoundItems(
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
      } = params;

      const filters: Record<string, any> = {};

      // Add filters if provided
      if (category) filters.category = category;
      if (status) filters.status = status;

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
      const foundItems = await FoundItem.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .populate("reportedBy", "name email")
        .lean();

      // Get total count for pagination
      const total = await FoundItem.countDocuments(filters);

      return {
        success: true,
        data: {
          items: foundItems,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            pages: Math.ceil(total / limitNumber),
          },
        },
      };
    } catch (error) {
      console.error("Error in foundItemsService.getFoundItems:", error);
      throw error;
    }
  },

  /**
   * Get a single found item by ID
   */
  async getFoundItemById(id: string): Promise<ApiResponse> {
    await dbConnect();

    try {
      const foundItem = await FoundItem.findById(id)
        .populate("reportedBy", "name email")
        .populate("claimedBy", "name email")
        .lean();

      if (!foundItem) {
        return {
          success: false,
          error: "Found item not found",
        };
      }

      return {
        success: true,
        data: foundItem,
      };
    } catch (error) {
      console.error("Error in foundItemsService.getFoundItemById:", error);
      throw error;
    }
  },

  /**
   * Report a new found item
   */
  async reportFoundItem(itemData: FoundItemFormData): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Create the found item
      const foundItem = new FoundItem({
        ...itemData,
        status: "pending",
        createdAt: new Date(),
      });

      await foundItem.save();

      // Check for potential matches with lost items
      const potentialMatches =
        await this.findPotentialLostItemMatches(foundItem);

      if (potentialMatches.length > 0) {
        // Create item matches
        for (const lostItem of potentialMatches) {
          const match = new ItemMatch({
            foundItem: foundItem._id,
            lostItem: lostItem._id,
            matchScore: this.calculateMatchScore(foundItem, lostItem),
            status: "pending",
            createdAt: new Date(),
          });

          await match.save();

          // Notify the user who reported the lost item
          try {
            const lostItemUser = await User.findById(lostItem.reportedBy);

            if (lostItemUser?.email) {
              const emailData = {
                userName: lostItemUser.name || lostItemUser.email,
                itemName: lostItem.itemName,
                foundItemDetails: `${foundItem.itemName} found at ${foundItem.location}`,
                nextSteps:
                  "Please log in to view the potential match and contact the administrator.",
              };

              const emailTemplate = emailTemplates.potentialMatch(emailData);

              await sendEmail({
                to: lostItemUser.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
              });
            }
          } catch (emailError) {
            console.error(
              "Failed to send match notification email:",
              emailError
            );
            // Don't fail the item creation if email sending fails
          }
        }
      }

      return {
        success: true,
        message: "Found item reported successfully",
        data: foundItem,
      };
    } catch (error) {
      console.error("Error in foundItemsService.reportFoundItem:", error);
      throw error;
    }
  },

  /**
   * Update a found item
   */
  async updateFoundItem(
    id: string,
    itemData: Partial<FoundItemFormData>
  ): Promise<ApiResponse> {
    await dbConnect();

    try {
      const foundItem = await FoundItem.findById(id);

      if (!foundItem) {
        return {
          success: false,
          error: "Found item not found",
        };
      }

      // Update the item
      Object.assign(foundItem, itemData);
      foundItem.updatedAt = new Date();

      await foundItem.save();

      return {
        success: true,
        message: "Found item updated successfully",
        data: foundItem,
      };
    } catch (error) {
      console.error("Error in foundItemsService.updateFoundItem:", error);
      throw error;
    }
  },

  /**
   * Delete a found item
   */
  async deleteFoundItem(id: string): Promise<ApiResponse> {
    await dbConnect();

    try {
      const foundItem = await FoundItem.findByIdAndDelete(id);

      if (!foundItem) {
        return {
          success: false,
          error: "Found item not found",
        };
      }

      // Delete any associated matches
      await ItemMatch.deleteMany({ foundItem: id });

      return {
        success: true,
        message: "Found item deleted successfully",
      };
    } catch (error) {
      console.error("Error in foundItemsService.deleteFoundItem:", error);
      throw error;
    }
  },

  /**
   * Helper method to find potential lost item matches
   */
  async findPotentialLostItemMatches(foundItem: any): Promise<any[]> {
    // Find lost items with matching category and status "active"
    const potentialMatches = await LostItem.find({
      category: foundItem.category,
      status: "active",
    }).lean();

    // Filter based on other criteria if needed
    return potentialMatches;
  },

  /**
   * Helper method to calculate match score between found and lost items
   */
  calculateMatchScore(foundItem: any, lostItem: any): number {
    let score = 0;

    // Basic category match
    if (foundItem.category === lostItem.category) {
      score += 30;
    }

    // Name similarity
    const foundName = foundItem.itemName.toLowerCase();
    const lostName = lostItem.itemName.toLowerCase();

    if (foundName === lostName) {
      score += 30;
    } else if (foundName.includes(lostName) || lostName.includes(foundName)) {
      score += 15;
    }

    // Description similarity
    if (foundItem.description && lostItem.description) {
      const foundDesc = foundItem.description.toLowerCase();
      const lostDesc = lostItem.description.toLowerCase();

      if (foundDesc.includes(lostDesc) || lostDesc.includes(foundDesc)) {
        score += 10;
      }
    }

    // Location similarity
    if (foundItem.location && lostItem.location) {
      const foundLoc = foundItem.location.toLowerCase();
      const lostLoc = lostItem.location.toLowerCase();

      if (foundLoc === lostLoc) {
        score += 20;
      } else if (foundLoc.includes(lostLoc) || lostLoc.includes(foundLoc)) {
        score += 10;
      }
    }

    // Date proximity
    if (foundItem.foundDate && lostItem.lostDate) {
      const foundDate = new Date(foundItem.foundDate);
      const lostDate = new Date(lostItem.lostDate);
      const diffDays =
        Math.abs(foundDate.getTime() - lostDate.getTime()) /
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

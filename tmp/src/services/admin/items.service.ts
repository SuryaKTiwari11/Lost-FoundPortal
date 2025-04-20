import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import type { ApiResponse } from "@/types";

interface GetItemsParams {
  status?: string | null;
  category?: string | null;
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
  type?: string | null;
  query?: string;
}

export const adminItemsService = {
  /**
   * Get items with filtering and pagination for admin dashboard
   */
  async getItems(params: GetItemsParams): Promise<ApiResponse> {
    try {
      await dbConnect();

      const { status, category, sortBy, sortOrder, page, limit, type, query } =
        params;

      // Build query filters
      const filter: any = {};

      if (status) {
        filter.status = status;
      }

      if (category) {
        filter.category = category;
      }

      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } },
        ];
      }

      // Create sort configuration
      const sort: any = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Query models based on type
      let items: any[] = [];
      let totalCount = 0;

      if (!type || type === "all") {
        // Query both lost and found items
        const foundItems = await FoundItem.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("reportedBy", "name email")
          .lean();

        const lostItems = await LostItem.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("reportedBy", "name email")
          .lean();

        // Add item type field to each document
        foundItems.forEach((item) => {
          item.itemType = "found";
        });

        lostItems.forEach((item) => {
          item.itemType = "lost";
        });

        // Combine and sort results
        items = [...foundItems, ...lostItems].sort((a, b) => {
          if (sortOrder === "asc") {
            return a[sortBy] > b[sortBy] ? 1 : -1;
          } else {
            return a[sortBy] < b[sortBy] ? 1 : -1;
          }
        });

        // Apply pagination to the combined results
        items = items.slice(0, limit);

        // Get total counts
        const totalFoundCount = await FoundItem.countDocuments(filter);
        const totalLostCount = await LostItem.countDocuments(filter);
        totalCount = totalFoundCount + totalLostCount;
      } else if (type === "found") {
        // Query only found items
        items = await FoundItem.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("reportedBy", "name email")
          .lean();

        items.forEach((item) => {
          item.itemType = "found";
        });

        totalCount = await FoundItem.countDocuments(filter);
      } else if (type === "lost") {
        // Query only lost items
        items = await LostItem.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("reportedBy", "name email")
          .lean();

        items.forEach((item) => {
          item.itemType = "lost";
        });

        totalCount = await LostItem.countDocuments(filter);
      }

      return {
        success: true,
        data: {
          items,
          pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit),
          },
        },
      };
    } catch (error: any) {
      console.error("Error in adminItemsService.getItems:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch items",
      };
    }
  },

  /**
   * Update the status of an item
   */
  async updateItemStatus(
    itemId: string,
    status: string,
    adminId: string
  ): Promise<ApiResponse> {
    await dbConnect();

    try {
      let item = null;

      // Try to find and update as lost item first
      item = await LostItem.findById(itemId);

      if (item) {
        item.status = status;
        item.lastUpdatedBy = adminId;
        await item.save();
        return {
          success: true,
          message: `Lost item status updated to ${status}`,
          data: item,
        };
      }

      // If not found, try as found item
      item = await FoundItem.findById(itemId);

      if (item) {
        item.status = status;
        item.lastUpdatedBy = adminId;
        await item.save();
        return {
          success: true,
          message: `Found item status updated to ${status}`,
          data: item,
        };
      }

      // If item not found in either collection
      return {
        success: false,
        error: "Item not found",
      };
    } catch (error) {
      console.error("Error in adminItemsService.updateItemStatus:", error);
      throw error;
    }
  },

  /**
   * Delete an item
   */
  async deleteItem(itemId: string): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Try to delete as lost item first
      const lostResult = await LostItem.findByIdAndDelete(itemId);

      if (lostResult) {
        return {
          success: true,
          message: "Lost item deleted successfully",
        };
      }

      // If not found, try as found item
      const foundResult = await FoundItem.findByIdAndDelete(itemId);

      if (foundResult) {
        return {
          success: true,
          message: "Found item deleted successfully",
        };
      }

      // If item not found in either collection
      return {
        success: false,
        error: "Item not found",
      };
    } catch (error) {
      console.error("Error in adminItemsService.deleteItem:", error);
      throw error;
    }
  },
};

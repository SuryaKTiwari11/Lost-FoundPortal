import { ApiResponse } from "@/types/ApiResponse";
import dbConnect from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";
import FoundItem from "@/model/foundItem.model";

export interface ItemsSearchParams {
  query?: string;
  category?: string;
  date?: string;
  location?: string;
  type?: "all" | "lost" | "found";
  page?: number;
  limit?: number;
}

export const itemsService = {
  /**
   * Search both lost and found items with filtering
   */
  async searchItems(params: ItemsSearchParams = {}): Promise<ApiResponse> {
    try {
      await dbConnect();

      const query = params.query || "";
      const category = params.category || "";
      const date = params.date || "";
      const location = params.location || "";
      const itemType = params.type || "all"; // 'all', 'lost', or 'found'
      const page = params.page || 1;
      const limit = params.limit || 50;
      const skip = (page - 1) * limit;

      // Build query objects for both lost and found items
      const baseQuery: any = {};

      // Add search filter
      if (query) {
        baseQuery.$or = [
          { itemName: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ];
      }

      // Add category filter
      if (category) {
        baseQuery.category = category;
      }

      // Prepare lost items query
      const lostItemsQuery = { ...baseQuery };

      // Add date filter for lost items
      if (date) {
        const searchDate = new Date(date);
        lostItemsQuery.lostDate = {
          $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
          $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
        };
      }

      // Add location filter for lost items
      if (location) {
        lostItemsQuery.lostLocation = { $regex: location, $options: "i" };
      }

      // Prepare found items query
      const foundItemsQuery = { ...baseQuery };
      foundItemsQuery.isVerified = true; // Only show verified found items

      // Add date filter for found items
      if (date) {
        const searchDate = new Date(date);
        foundItemsQuery.foundDate = {
          $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
          $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
        };
      }

      // Add location filter for found items
      if (location) {
        foundItemsQuery.foundLocation = { $regex: location, $options: "i" };
      }

      // Get either lost items, found items, or both based on type parameter
      let lostItems: any[] = [];
      let foundItems: any[] = [];
      let totalLostItems = 0;
      let totalFoundItems = 0;

      if (itemType === "all" || itemType === "lost") {
        totalLostItems = await LostItem.countDocuments(lostItemsQuery);
        lostItems = await LostItem.find(lostItemsQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("reportedBy", "name email")
          .lean();
      }

      if (itemType === "all" || itemType === "found") {
        totalFoundItems = await FoundItem.countDocuments(foundItemsQuery);
        foundItems = await FoundItem.find(foundItemsQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("reportedBy", "name email")
          .lean();
      }

      const totalItems = totalLostItems + totalFoundItems;

      return {
        success: true,
        data: {
          lostItems,
          foundItems,
          total: totalItems,
          pagination: {
            total: totalItems,
            page,
            limit,
            pages: Math.ceil(totalItems / limit),
          },
        },
      };
    } catch (error: any) {
      console.error("Error searching items:", error);
      return {
        success: false,
        error: error.message || "Failed to search items",
      };
    }
  },
};

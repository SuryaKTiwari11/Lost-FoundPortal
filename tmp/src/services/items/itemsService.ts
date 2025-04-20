import { ApiResponse } from "@/types";

/**
 * Service for general item operations
 */
export const itemsService = {
  /**
   * Get recent items (both lost and found)
   */
  async getRecentItems(limit: number = 10): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/items/recent?limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching recent items:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recent items",
      };
    }
  },

  /**
   * Search for items by query
   */
  async searchItems(
    query: string,
    category?: string,
    type?: "lost" | "found"
  ): Promise<ApiResponse> {
    try {
      let url = `/api/items/search?q=${encodeURIComponent(query)}`;

      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      if (type) {
        url += `&type=${encodeURIComponent(type)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error searching items:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to search items",
      };
    }
  },

  /**
   * Get possible matches for an item
   */
  async getPossibleMatches(
    itemId: string,
    itemType: "lost" | "found"
  ): Promise<ApiResponse> {
    try {
      let url = `/api/matches?`;

      if (itemType === "lost") {
        url += `lostItemId=${itemId}`;
      } else {
        url += `foundItemId=${itemId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching possible matches:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch possible matches",
      };
    }
  },

  /**
   * Get item by ID
   */
  async getItemById(
    itemId: string,
    itemType: "lost" | "found"
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/${itemType}-items/${itemId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${itemType} item:`, error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : `Failed to fetch ${itemType} item`,
      };
    }
  },
};

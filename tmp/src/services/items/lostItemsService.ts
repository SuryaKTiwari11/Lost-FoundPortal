import { ApiResponse } from "@/types";

/**
 * Service for lost item operations
 */
export const lostItemsService = {
  /**
   * Create a new lost item report
   */
  async createLostItem(formData: any): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/lost-items/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      return await response.json();
    } catch (error) {
      console.error("Error creating lost item:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create lost item",
      };
    }
  },

  /**
   * Get all lost items (with pagination)
   */
  async getAllLostItems(
    page: number = 1,
    limit: number = 10,
    category?: string
  ): Promise<ApiResponse> {
    try {
      let url = `/api/lost-items?page=${page}&limit=${limit}`;

      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching lost items:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch lost items",
      };
    }
  },

  /**
   * Get a lost item by ID
   */
  async getLostItemById(itemId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/lost-items/${itemId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching lost item:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch lost item",
      };
    }
  },

  /**
   * Get lost items reported by the current user
   */
  async getUserLostItems(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/lost-items/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching user lost items:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user lost items",
      };
    }
  },

  /**
   * Update a lost item
   */
  async updateLostItem(itemId: string, data: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/lost-items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error("Error updating lost item:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update lost item",
      };
    }
  },
};

import { ApiResponse } from "@/types";

/**
 * Service for found item operations
 */
export const foundItemsService = {
  /**
   * Create a new found item report
   */
  async createFoundItem(formData: any): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/found-items/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      return await response.json();
    } catch (error) {
      console.error("Error creating found item:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create found item",
      };
    }
  },

  /**
   * Get all found items (with pagination)
   */
  async getAllFoundItems(
    page: number = 1,
    limit: number = 10,
    category?: string
  ): Promise<ApiResponse> {
    try {
      let url = `/api/found-items?page=${page}&limit=${limit}`;

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
      console.error("Error fetching found items:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch found items",
      };
    }
  },

  /**
   * Get a found item by ID
   */
  async getFoundItemById(itemId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/found-items/${itemId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching found item:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch found item",
      };
    }
  },

  /**
   * Get found items reported by the current user
   */
  async getUserFoundItems(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/found-items/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching user found items:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user found items",
      };
    }
  },

  /**
   * Update a found item
   */
  async updateFoundItem(itemId: string, data: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/found-items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error("Error updating found item:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update found item",
      };
    }
  },
};

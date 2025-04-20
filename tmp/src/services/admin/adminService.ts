import { ApiResponse } from "@/types";

/**
 * Service for admin-related operations
 */
export const adminService = {
  /**
   * Get all pending items for approval
   */
  async getPendingItems(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/admin/pending-items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching pending items:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch pending items",
      };
    }
  },

  /**
   * Get all users for admin management
   */
  async getUsers(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch users",
      };
    }
  },

  /**
   * Update an item's status (verified, pending, etc.)
   */
  async updateItemStatus(
    itemId: string,
    status: string,
    itemType: "lost" | "found"
  ): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/admin/items/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          status,
          itemType,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error updating item status:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update item status",
      };
    }
  },

  /**
   * Process a claim request (approve or reject)
   */
  async processClaim(
    claimId: string,
    approved: boolean,
    adminNotes: string
  ): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/admin/claims/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId,
          approved,
          adminNotes,
        }),
      });

      return await response.json();
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
   * Create a match between a lost and found item
   */
  async createMatch(
    lostItemId: string,
    foundItemId: string
  ): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/admin/matches/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lostItemId,
          foundItemId,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error creating match:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create match",
      };
    }
  },

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/admin/dashboard/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats",
      };
    }
  },
};

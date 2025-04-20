import { ApiResponse } from "@/types";

/**
 * Service for user-related operations
 */
export const userService = {
  /**
   * Update user profile
   */
  async updateProfile(profileData: any): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      return await response.json();
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  },

  /**
   * Get user's items (both lost and found)
   */
  async getUserItems(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/users/items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching user items:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch user items",
      };
    }
  },

  /**
   * Get user's claim requests
   */
  async getUserClaims(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/claims", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching user claims:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user claims",
      };
    }
  },

  /**
   * Get user's notifications
   */
  async getUserNotifications(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
      };
    }
  },
};

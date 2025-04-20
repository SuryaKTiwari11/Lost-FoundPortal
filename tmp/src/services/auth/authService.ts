import { ApiResponse } from "@/types";

/**
 * Service for authentication-related operations
 */
export const authService = {
  /**
   * Get the current user's session data
   */
  async getSession(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching session:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch session",
      };
    }
  },

  /**
   * Get user profile data
   */
  async getUserProfile(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user profile",
      };
    }
  },
};

import { ApiResponse } from "@/types";
import { fetchAPI } from "../core/apiUtils";

/**
 * Service for user-related API operations
 */
export const userAPI = {
  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<ApiResponse> {
    return fetchAPI("/api/users/profile");
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData: any): Promise<ApiResponse> {
    return fetchAPI("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Get user's items (both lost and found)
   */
  async getUserItems(): Promise<ApiResponse> {
    return fetchAPI("/api/users/items");
  },

  /**
   * Get user's lost items
   */
  async getUserLostItems(): Promise<ApiResponse> {
    return fetchAPI("/api/lost-items/user");
  },

  /**
   * Get user's found items
   */
  async getUserFoundItems(): Promise<ApiResponse> {
    return fetchAPI("/api/found-items/user");
  },

  /**
   * Get user's claim requests
   */
  async getUserClaims(): Promise<ApiResponse> {
    return fetchAPI("/api/claims");
  },

  /**
   * Submit a new claim
   */
  async submitClaim(claimData: any): Promise<ApiResponse> {
    return fetchAPI("/api/claims", {
      method: "POST",
      body: JSON.stringify(claimData),
    });
  },

  /**
   * Get details of a specific claim
   */
  async getClaimById(claimId: string): Promise<ApiResponse> {
    return fetchAPI(`/api/claims/${claimId}`);
  },

  /**
   * Cancel a claim
   */
  async cancelClaim(claimId: string, reason: string): Promise<ApiResponse> {
    return fetchAPI(`/api/claims/${claimId}`, {
      method: "PUT",
      body: JSON.stringify({
        action: "cancel",
        reason,
      }),
    });
  },

  /**
   * Get user's notifications
   */
  async getUserNotifications(): Promise<ApiResponse> {
    return fetchAPI("/api/notifications");
  },

  /**
   * Send a notification to another user
   */
  async sendNotification(notificationData: any): Promise<ApiResponse> {
    return fetchAPI("/api/notifications/send", {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
  },

  /**
   * Get potential matches for user's items
   */
  async getItemMatches(): Promise<ApiResponse> {
    return fetchAPI("/api/matches/user");
  },
};

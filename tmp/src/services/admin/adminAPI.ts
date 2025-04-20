import { ApiResponse } from "@/types";
import { fetchAPI } from "../core/apiUtils";

/**
 * Service for admin-related API operations
 */
export const adminAPI = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse> {
    return fetchAPI("/api/admin/dashboard/stats");
  },

  /**
   * Get all pending items requiring admin verification
   */
  async getPendingItems(): Promise<ApiResponse> {
    return fetchAPI("/api/admin/pending-items");
  },

  /**
   * Get all lost items (admin view)
   */
  async getLostItems(): Promise<ApiResponse> {
    return fetchAPI("/api/admin/lost-items");
  },

  /**
   * Get all found items (admin view)
   */
  async getFoundItems(): Promise<ApiResponse> {
    return fetchAPI("/api/admin/found-items");
  },

  /**
   * Update an item's status
   */
  async updateItemStatus(
    itemId: string,
    status: string,
    itemType: "lost" | "found"
  ): Promise<ApiResponse> {
    return fetchAPI("/api/admin/items/update-status", {
      method: "PUT",
      body: JSON.stringify({
        itemId,
        status,
        itemType,
      }),
    });
  },

  /**
   * Get all claims
   */
  async getAllClaims(): Promise<ApiResponse> {
    return fetchAPI("/api/admin/claims");
  },

  /**
   * Get claims for a specific item
   */
  async getClaimsForItem(
    itemId: string,
    itemType: "lost" | "found"
  ): Promise<ApiResponse> {
    return fetchAPI(`/api/admin/claims?itemId=${itemId}&itemType=${itemType}`);
  },

  /**
   * Process a claim (approve or reject)
   */
  async processClaim(
    claimId: string,
    approved: boolean,
    adminNotes: string
  ): Promise<ApiResponse> {
    return fetchAPI("/api/admin/claims/process", {
      method: "POST",
      body: JSON.stringify({
        claimId,
        approved,
        adminNotes,
      }),
    });
  },

  /**
   * Create a match between a lost and found item
   */
  async createMatch(
    lostItemId: string,
    foundItemId: string
  ): Promise<ApiResponse> {
    return fetchAPI("/api/admin/matches/create", {
      method: "POST",
      body: JSON.stringify({
        lostItemId,
        foundItemId,
      }),
    });
  },

  /**
   * Get all email templates
   */
  async getEmailTemplates(): Promise<ApiResponse> {
    return fetchAPI("/api/admin/email-templates");
  },

  /**
   * Create a new email template
   */
  async createEmailTemplate(templateData: any): Promise<ApiResponse> {
    return fetchAPI("/api/admin/email-templates", {
      method: "POST",
      body: JSON.stringify(templateData),
    });
  },

  /**
   * Update an email template
   */
  async updateEmailTemplate(
    templateId: string,
    templateData: any
  ): Promise<ApiResponse> {
    return fetchAPI(`/api/admin/email-templates/${templateId}`, {
      method: "PUT",
      body: JSON.stringify(templateData),
    });
  },

  /**
   * Delete an email template
   */
  async deleteEmailTemplate(templateId: string): Promise<ApiResponse> {
    return fetchAPI(`/api/admin/email-templates/${templateId}`, {
      method: "DELETE",
    });
  },

  /**
   * Get all users
   */
  async getUsers(): Promise<ApiResponse> {
    return fetchAPI("/api/admin/users");
  },

  /**
   * Update a user's role
   */
  async updateUserRole(
    userId: string,
    newRole: "user" | "admin"
  ): Promise<ApiResponse> {
    return fetchAPI("/api/admin/users/update-role", {
      method: "PUT",
      body: JSON.stringify({
        userId,
        role: newRole,
      }),
    });
  },
};

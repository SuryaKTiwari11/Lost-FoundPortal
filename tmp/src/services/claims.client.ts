import { ApiResponse } from "@/types";

/**
 * Client service for claim operations
 */
export const claimsClient = {
  /**
   * Submit a new claim for a found item
   */
  async submitClaim(claimData: any): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(claimData),
      });

      return await response.json();
    } catch (error) {
      console.error("Error submitting claim:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to submit claim",
      };
    }
  },

  /**
   * Get details of a specific claim
   */
  async getClaimById(claimId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching claim:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch claim",
      };
    }
  },

  /**
   * Cancel a claim
   */
  async cancelClaim(claimId: string, reason: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "cancel",
          reason,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error canceling claim:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to cancel claim",
      };
    }
  },

  /**
   * Get all claims for an item (admin only)
   */
  async getClaimsForItem(
    itemId: string,
    itemType: "lost" | "found"
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `/api/admin/claims?itemId=${itemId}&itemType=${itemType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Error fetching claims for item:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch claims for item",
      };
    }
  },
};

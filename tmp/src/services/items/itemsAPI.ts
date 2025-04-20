import type {
  ApiResponse,
  FoundItemFormData,
  LostItemFormData,
  ClaimItemData,
  FoundReportData,
} from "@/types";
import { fetchAPI, buildQueryString } from "../core/apiUtils";

/**
 * Service for items-related API operations
 */
export const itemsAPI = {
  /**
   * Get all found items with optional pagination and filtering
   */
  async getFoundItems(
    page = 1,
    limit = 10,
    category?: string
  ): Promise<ApiResponse> {
    let url = `/api/found-items?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    return fetchAPI(url);
  },

  /**
   * Get all lost items with optional pagination and filtering
   */
  async getLostItems(
    page = 1,
    limit = 10,
    category?: string
  ): Promise<ApiResponse> {
    let url = `/api/lost-items?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    return fetchAPI(url);
  },

  /**
   * Get a specific found item by ID
   */
  async getFoundItemById(id: string): Promise<ApiResponse> {
    return fetchAPI(`/api/found-items/${id}`);
  },

  /**
   * Get a specific lost item by ID
   */
  async getLostItemById(id: string): Promise<ApiResponse> {
    return fetchAPI(`/api/lost-items/${id}`);
  },

  /**
   * Create a new found item report
   */
  async createFoundItem(data: any): Promise<ApiResponse> {
    return fetchAPI("/api/found-items/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Create a new lost item report
   */
  async createLostItem(data: any): Promise<ApiResponse> {
    return fetchAPI("/api/lost-items/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get possible matches for a lost item
   */
  async getPossibleMatches(lostItemId: string): Promise<ApiResponse> {
    return fetchAPI(`/api/matches?lostItemId=${lostItemId}`);
  },

  /**
   * Get user's items (both lost and found)
   */
  async getUserItems(): Promise<ApiResponse> {
    return fetchAPI("/api/users/items");
  },

  /**
   * Get recent items (for homepage)
   */
  async getRecentItems(limit = 6): Promise<ApiResponse> {
    return fetchAPI(`/api/items/recent?limit=${limit}`);
  },
};

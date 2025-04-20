import { ApiResponse } from "@/types";
import { fetchAPI } from "../core/apiUtils";

/**
 * Service for search-related API operations
 */
export const searchAPI = {
  /**
   * Search across all items (both lost and found)
   */
  async searchItems(
    query: string,
    options: {
      category?: string;
      type?: "lost" | "found";
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ApiResponse> {
    const { category, type, page = 1, limit = 10 } = options;

    let url = `/api/items/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;

    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }

    return fetchAPI(url);
  },

  /**
   * Search for possible matches for a lost item
   */
  async searchMatches(lostItemId: string): Promise<ApiResponse> {
    return fetchAPI(`/api/matches?lostItemId=${lostItemId}`);
  },

  /**
   * Search for possible matches for a found item
   */
  async searchMatchesForFound(foundItemId: string): Promise<ApiResponse> {
    return fetchAPI(`/api/matches?foundItemId=${foundItemId}`);
  },

  /**
   * Get items by location
   */
  async searchByLocation(
    location: string,
    type?: "lost" | "found"
  ): Promise<ApiResponse> {
    let url = `/api/items/location?location=${encodeURIComponent(location)}`;

    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }

    return fetchAPI(url);
  },

  /**
   * Get items by category
   */
  async searchByCategory(
    category: string,
    type?: "lost" | "found"
  ): Promise<ApiResponse> {
    let url = `/api/items/category/${encodeURIComponent(category)}`;

    if (type) {
      url += `?type=${encodeURIComponent(type)}`;
    }

    return fetchAPI(url);
  },

  /**
   * Get items by date range
   */
  async searchByDateRange(
    startDate: string,
    endDate: string,
    type?: "lost" | "found"
  ): Promise<ApiResponse> {
    let url = `/api/items/date-range?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`;

    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }

    return fetchAPI(url);
  },
};

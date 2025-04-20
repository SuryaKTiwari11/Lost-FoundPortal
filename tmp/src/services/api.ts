import { ApiResponse } from "@/types";

/**
 * Central export file for all API services
 */

// Core utilities
export { fetchAPI } from "./core/apiUtils";

/**
 * Generic API service for making HTTP requests
 */
export const api = {
  /**
   * Make a GET request
   */
  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error:
            errorData.error || `Request failed with status ${response.status}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error(`API GET error for ${url}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to make request",
      };
    }
  },

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error:
            errorData.error || `Request failed with status ${response.status}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error(`API POST error for ${url}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to make request",
      };
    }
  },

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error:
            errorData.error || `Request failed with status ${response.status}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error(`API PUT error for ${url}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to make request",
      };
    }
  },

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error:
            errorData.error || `Request failed with status ${response.status}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error(`API DELETE error for ${url}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to make request",
      };
    }
  },
};

// Domain-specific APIs
export { authAPI } from "./auth/authAPI";
export { userAPI } from "./users/userAPI";
export { itemsAPI } from "./items/itemsAPI";
export { searchAPI } from "./search/searchAPI";
export { adminAPI } from "./admin/adminAPI";

import { ApiResponse } from "@/types";
import { fetchAPI } from "./core/apiUtils";

/**
 * Service for handling API calls related to reporting found items
 */

export interface FoundItemFormData {
  itemName: string;
  category: string;
  description: string;
  foundLocation: string;
  foundDate: Date | string;
  currentHoldingLocation?: string;
  contactEmail: string;
  contactPhone?: string;
  imageURL?: string;
}

/**
 * Service for reporting lost and found items
 */
export const reportService = {
  /**
   * Report a lost item
   */
  async reportLostItem(formData: any): Promise<ApiResponse> {
    return fetchAPI("/api/lost-items/create", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  },

  /**
   * Report a found item
   */
  async reportFoundItem(formData: any): Promise<ApiResponse> {
    return fetchAPI("/api/found-items/create", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  },

  /**
   * Upload images for a report
   */
  async uploadImages(files: File[]): Promise<ApiResponse> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`image${index}`, file);
    });

    return fetchAPI("/api/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set content-type with boundary
    });
  },

  /**
   * Update a lost item report
   */
  async updateLostItem(itemId: string, formData: any): Promise<ApiResponse> {
    return fetchAPI(`/api/lost-items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(formData),
    });
  },

  /**
   * Update a found item report
   */
  async updateFoundItem(itemId: string, formData: any): Promise<ApiResponse> {
    return fetchAPI(`/api/found-items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(formData),
    });
  },

  /**
   * Submit additional information for an existing report
   */
  async submitAdditionalInfo(
    itemId: string,
    itemType: "lost" | "found",
    additionalInfo: any
  ): Promise<ApiResponse> {
    return fetchAPI(`/api/${itemType}-items/${itemId}/additional-info`, {
      method: "POST",
      body: JSON.stringify(additionalInfo),
    });
  },
};

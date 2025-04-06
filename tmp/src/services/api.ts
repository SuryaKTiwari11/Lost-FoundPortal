// Centralized API service for all fetch operations
import type { ApiResponse } from "@/types";
import { mockData } from "./mockData";

 // Simple cache to prevent duplicate requests and re-renders
const mockCache = new Map<string, any>();

// Simplified fetch function that always returns mock data
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  mockKey?: keyof typeof mockData
): Promise<ApiResponse<T>> {
  // Create cache key from endpoint and options
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;

  // Return cached response if available
  if (mockCache.has(cacheKey)) {
    return mockCache.get(cacheKey);
  }

  // Get mock data based on the key or fallback to a default
  let response: ApiResponse<any>;

  if (mockKey && mockData[mockKey]) {
    // Only log on first request to avoid console spam
    if (!mockCache.has(cacheKey)) {
      console.log(`Using mock data for ${endpoint}`);
    }
    response = mockData[mockKey] as ApiResponse<T>;
  } else {
    // Fallback for endpoints without dedicated mock data
    console.warn(
      `No mock data available for ${endpoint}, using default response`
    );
    response = {
      success: true,
      data: {},
    } as ApiResponse<T>;
  }

  // Cache the response
  mockCache.set(cacheKey, response);

  // Add slight delay to simulate network request
  await new Promise((resolve) => setTimeout(resolve, 300));

  return response;
}

// Auth API
export const authAPI = {
  signIn: async (provider: string, callbackUrl?: string) => {
    // This is handled by NextAuth directly
    return { success: true };
  },

  signUp: async (userData: any) => {
    return fetchAPI("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  verifyEmail: async (code: string, email: string) => {
    return fetchAPI(
      `/api/auth/verify-email?code=${code}&email=${encodeURIComponent(email)}`
    );
  },
};

// User API
export const userAPI = {
  getProfile: async (email: string) => {
    return fetchAPI(`/api/users/profile?email=${encodeURIComponent(email)}`);
  },

  updateProfile: async (email: string, profileData: any) => {
    return fetchAPI("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify({ email, ...profileData }),
    });
  },
};

// Items API
export const itemsAPI = {
  // Found Items
  getAllItems: async (params: Record<string, string> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/items?${queryString}`, {}, "allItems");
  },

  getFoundItems: async (params: Record<string, string> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/found-items?${queryString}`, {}, "foundItems");
  },

  getFoundItemById: async (id: string) => {
    return fetchAPI(`/api/found-items/${id}`, {}, "foundItemDetail");
  },

  reportFoundItem: async (itemData: any) => {
    return fetchAPI("/api/items/report-found", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  claimFoundItem: async (claimData: any) => {
    return fetchAPI("/api/found-items/claim", {
      method: "POST",
      body: JSON.stringify(claimData),
    });
  },

  // Lost Items
  getLostItems: async (params: Record<string, string> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/lost-items?${queryString}`, {}, "lostItems");
  },

  getLostItemById: async (id: string) => {
    return fetchAPI(`/api/lost-items/${id}`, {}, "lostItemDetail");
  },

  reportLostItem: async (itemData: any) => {
    return fetchAPI("/api/lost-items", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  updateLostItem: async (id: string, itemData: any) => {
    return fetchAPI(`/api/lost-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  },

  deleteLostItem: async (id: string) => {
    return fetchAPI(`/api/lost-items/${id}`, {
      method: "DELETE",
    });
  },

  reportFoundForLostItem: async (reportData: any) => {
    return fetchAPI("/api/lost-items/report-found", {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  },
};

// Admin API
export const adminAPI = {
  // Items management
  getAdminItems: async (status = "pending") => {
    return fetchAPI(`/api/admin/items?status=${status}`, {}, "adminItems");
  },

  updateItemStatus: async (itemId: string, status: string) => {
    return fetchAPI("/api/admin/items/update-status", {
      method: "PUT",
      body: JSON.stringify({ itemId, status }),
    });
  },

  // Claims management
  getClaimRequests: async () => {
    return fetchAPI("/api/admin/claims", {}, "claimRequests");
  },

  processClaimRequest: async (
    claimId: string,
    approved: boolean,
    adminNotes?: string
  ) => {
    return fetchAPI("/api/admin/claims/process", {
      method: "PUT",
      body: JSON.stringify({ claimId, approved, adminNotes }),
    });
  },

  // Lost items for matching
  getLostItemsForMatching: async () => {
    return fetchAPI("/api/admin/lost-items", {}, "matchingLostItems");
  },

  // Create match between items
  createItemMatch: async (lostItemId: string, foundItemId: string) => {
    return fetchAPI("/api/admin/matches/create", {
      method: "POST",
      body: JSON.stringify({ lostItemId, foundItemId }),
    });
  },

  // Send notifications
  sendNotification: async (
    subject: string,
    body: string,
    itemIds?: string[]
  ) => {
    return fetchAPI("/api/admin/send-notification", {
      method: "POST",
      body: JSON.stringify({ subject, body, itemIds }),
    });
  },
};

// Search API
export const searchAPI = {
  searchLostItems: async (params: Record<string, string> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(
      `/api/search-lost-items?${queryString}`,
      {},
      "searchResults"
    );
  },
};

// Centralized API service for all fetch operations
import type {
  ApiResponse,
  User,
  ProfileFormData,
  FoundItemFormData,
  LostItemFormData,
  ClaimItemData,
  FoundReportData,
  EmailTemplate,
} from "@/types";

// Better typed cache
interface CacheItem<T> {
  data: ApiResponse<T>;
  timestamp: number;
}

const apiCache = new Map<string, CacheItem<unknown>>();
const CACHE_DURATION = 10000; // 10 seconds cache

// Proper fetch function that handles API calls
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Create cache key from endpoint and options
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;

  // Return cached response if available and not expired
  const cachedItem = apiCache.get(cacheKey);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
    return cachedItem.data as ApiResponse<T>;
  }

  try {
    // Add default headers for JSON requests if not explicitly provided
    if (
      options.body &&
      !options.headers &&
      !(options.body instanceof FormData)
    ) {
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await fetch(endpoint, options);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      return {
        success: true,
        data: (await response.text()) as unknown as T,
      };
    }

    // Parse JSON response
    const data = await response.json();

    // Store in cache
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse<T>;
  }
}

// Auth API
export const authAPI = {
  signIn: async (_provider: string, _callbackUrl?: string) => {
    // This is handled by NextAuth directly
    return { success: true };
  },

  signUp: async (userData: Partial<User>) => {
    return fetchAPI<User>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  verifyEmail: async (code: string, email: string) => {
    return fetchAPI<{ verified: boolean }>(
      `/api/auth/verify-email?code=${code}&email=${encodeURIComponent(email)}`
    );
  },
};

// User API
export const userAPI = {
  getProfile: async (email: string) => {
    return fetchAPI<User>(
      `/api/users/profile?email=${encodeURIComponent(email)}`
    );
  },

  updateProfile: async (email: string, profileData: ProfileFormData) => {
    return fetchAPI<User>("/api/users/profile", {
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
    return fetchAPI<FoundItemFormData[]>(`/api/items?${queryString}`);
  },

  getFoundItems: async (params: Record<string, string> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI<FoundItemFormData[]>(`/api/found-items?${queryString}`);
  },

  getFoundItemById: async (id: string) => {
    return fetchAPI<FoundItemFormData>(`/api/found-items/${id}`);
  },

  reportFoundItem: async (itemData: FoundItemFormData) => {
    return fetchAPI<FoundItemFormData>("/api/items/report-found", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  claimFoundItem: async (claimData: ClaimItemData) => {
    return fetchAPI<ClaimItemData>("/api/found-items/claim", {
      method: "POST",
      body: JSON.stringify(claimData),
    });
  },

  // Lost Items
  getLostItems: async (params: Record<string, string> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI<LostItemFormData[]>(`/api/lost-items?${queryString}`);
  },

  getLostItemById: async (id: string) => {
    return fetchAPI<LostItemFormData>(`/api/lost-items/${id}`);
  },

  reportLostItem: async (itemData: LostItemFormData) => {
    return fetchAPI<LostItemFormData>("/api/lost-items", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  updateLostItem: async (id: string, itemData: LostItemFormData) => {
    return fetchAPI<LostItemFormData>(`/api/lost-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  },

  deleteLostItem: async (id: string) => {
    return fetchAPI<void>(`/api/lost-items/${id}`, {
      method: "DELETE",
    });
  },

  reportFoundForLostItem: async (reportData: FoundReportData) => {
    return fetchAPI<FoundReportData>("/api/lost-items/report-found", {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  },
};

// Admin API
export const adminAPI = {
  // Items management
  getAdminItems: async (status = "pending") => {
    return fetchAPI<FoundItemFormData[]>(`/api/admin/items?status=${status}`);
  },

  updateItemStatus: async (itemId: string, status: string) => {
    return fetchAPI<void>("/api/admin/items/update-status", {
      method: "PUT",
      body: JSON.stringify({ itemId, status }),
    });
  },

  // Bulk operations
  bulkUpdateItemStatus: async (itemIds: string[], status: string) => {
    return fetchAPI<void>("/api/admin/items/bulk-update-status", {
      method: "PUT",
      body: JSON.stringify({ itemIds, status }),
    });
  },

  // Claims management
  getClaimRequests: async () => {
    return fetchAPI<ClaimItemData[]>("/api/admin/claims");
  },

  processClaimRequest: async (
    claimId: string,
    approved: boolean,
    adminNotes?: string
  ) => {
    return fetchAPI<void>("/api/admin/claims/process", {
      method: "PUT",
      body: JSON.stringify({ claimId, approved, adminNotes }),
    });
  },

  // Advanced verification
  submitVerificationStep: async (
    itemId: string,
    stepType: string,
    verified: boolean,
    notes?: string
  ) => {
    return fetchAPI<void>("/api/admin/verification", {
      method: "POST",
      body: JSON.stringify({ itemId, stepType, verified, notes }),
    });
  },

  // Document verification
  verifyDocument: async (
    documentId: string,
    verified: boolean,
    feedback?: string
  ) => {
    return fetchAPI<void>("/api/admin/verify-document", {
      method: "PUT",
      body: JSON.stringify({ documentId, verified, feedback }),
    });
  },

  // Lost items for matching
  getLostItemsForMatching: async () => {
    return fetchAPI<LostItemFormData[]>("/api/admin/lost-items");
  },

  // All lost items including those that were returned
  getAllLostItems: async () => {
    return fetchAPI<LostItemFormData[]>("/api/admin/all-lost-items");
  },

  // Create match between items
  createItemMatch: async (lostItemId: string, foundItemId: string) => {
    return fetchAPI<void>("/api/admin/matches/create", {
      method: "POST",
      body: JSON.stringify({ lostItemId, foundItemId }),
    });
  },

  // Get all potential matches
  getAllMatches: async () => {
    return fetchAPI<FoundItemFormData[]>("/api/admin/matches");
  },

  // Get AI-suggested matches
  getAIMatches: async (itemId: string, itemType: "lost" | "found") => {
    return fetchAPI<FoundItemFormData[]>(
      `/api/admin/ai-matches?itemId=${itemId}&itemType=${itemType}`
    );
  },

  // Compare items side-by-side
  compareItems: async (itemId1: string, itemId2: string) => {
    return fetchAPI<FoundItemFormData[]>(
      `/api/admin/compare-items?item1=${itemId1}&item2=${itemId2}`
    );
  },

  // Send notifications
  sendNotification: async (
    subject: string,
    body: string,
    itemIds?: string[]
  ) => {
    return fetchAPI<void>("/api/admin/send-notification", {
      method: "POST",
      body: JSON.stringify({ subject, body, itemIds }),
    });
  },

  // Email templates
  getEmailTemplates: async () => {
    return fetchAPI<EmailTemplate[]>("/api/admin/email-templates");
  },

  createEmailTemplate: async (
    name: string,
    subject: string,
    body: string,
    type: string
  ) => {
    return fetchAPI<EmailTemplate>("/api/admin/email-templates", {
      method: "POST",
      body: JSON.stringify({ name, subject, body, type }),
    });
  },

  updateEmailTemplate: async (
    id: string,
    name: string,
    subject: string,
    body: string,
    type: string
  ) => {
    return fetchAPI<EmailTemplate>(`/api/admin/email-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, subject, body, type }),
    });
  },

  deleteEmailTemplate: async (id: string) => {
    return fetchAPI<void>(`/api/admin/email-templates/${id}`, {
      method: "DELETE",
    });
  },

  // Upload image
  uploadImage: async (itemId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", itemId);

    return fetchAPI<void>("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });
  },

  // Upload multiple images
  uploadMultipleImages: async (itemId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    formData.append("itemId", itemId);

    return fetchAPI<void>("/api/admin/upload-multiple-images", {
      method: "POST",
      body: formData,
    });
  },

  // Analytics
  getAnalytics: async (timeframe?: string) => {
    const query = timeframe ? `?timeframe=${timeframe}` : "";
    return fetchAPI<void>(`/api/admin/analytics${query}`);
  },

  // Location analytics
  getLocationHeatmap: async () => {
    return fetchAPI<void>("/api/admin/analytics/locations");
  },

  // Category analytics
  getCategoryBreakdown: async () => {
    return fetchAPI<void>("/api/admin/analytics/categories");
  },

  // Recovery rate analytics
  getRecoveryRates: async (timeframe?: string) => {
    const query = timeframe ? `?timeframe=${timeframe}` : "";
    return fetchAPI<void>(`/api/admin/analytics/recovery${query}`);
  },

  // Verification history
  getVerificationHistory: async (itemId: string) => {
    return fetchAPI<void>(`/api/admin/verification-history/${itemId}`);
  },

  // Communication history
  getCommunicationHistory: async (userId?: string) => {
    const query = userId ? `?userId=${userId}` : "";
    return fetchAPI<void>(`/api/admin/communication-history${query}`);
  },

  // Compare images visually
  compareImages: async (image1Id: string, image2Id: string) => {
    return fetchAPI<void>(
      `/api/admin/compare-images?image1=${image1Id}&image2=${image2Id}`
    );
  },

  // Process items in batch
  processBatch: async (
    itemIds: string[],
    action: string,
    data?: Record<string, unknown>
  ) => {
    return fetchAPI<void>("/api/admin/batch-process", {
      method: "POST",
      body: JSON.stringify({ itemIds, action, data }),
    });
  },
};

// Search API
export const searchAPI = {
  searchLostItems: async (params: Record<string, string> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI<LostItemFormData[]>(
      `/api/search-lost-items?${queryString}`
    );
  },
};

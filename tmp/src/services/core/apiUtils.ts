import type { ApiResponse } from "@/types";

// Better typed cache
interface CacheItem<T> {
  data: ApiResponse<T>;
  timestamp: number;
}

const apiCache = new Map<string, CacheItem<unknown>>();
const CACHE_DURATION = 10000; // 10 seconds cache

// Server-safe timestamp function that doesn't cause hydration issues
const getTimestamp = () => {
  // Use a stable timestamp during SSR to prevent hydration errors
  if (typeof window === "undefined") {
    return 0; // Use a constant value during server-side rendering
  }
  // Only use actual timestamp on the client after hydration
  return Date.now();
};

/**
 * Core API utility for making HTTP requests with standardized error handling
 */
export async function fetchAPI<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Set default headers if not provided
    if (!options.headers) {
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    // Add credentials for auth cookies
    options.credentials = "include";

    const response = await fetch(url, options);

    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If not parseable as JSON, return a generic error response
      return {
        success: false,
        error: `Invalid response format: ${e instanceof Error ? e.message : String(e)}`,
      };
    }

    // Check if the response was successful
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
        status: response.status,
        details: data.details || null,
      };
    }

    // Return the successful response
    return data;
  } catch (error) {
    console.error(`API fetch error for ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Helper function to build query string
export function buildQueryString(params: Record<string, string> = {}): string {
  return new URLSearchParams(params).toString();
}

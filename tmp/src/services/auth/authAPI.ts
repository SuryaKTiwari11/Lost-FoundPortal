import type { ApiResponse, User } from "@/types";
import { fetchAPI } from "../core/apiUtils";

/**
 * Service for authentication-related API operations
 */
export const authAPI = {
  /**
   * Get the current session information
   */
  async getSession(): Promise<ApiResponse> {
    return fetchAPI("/api/auth/session");
  },

  /**
   * Check if the current user has admin role
   */
  async isAdmin(): Promise<boolean> {
    try {
      const response = await this.getSession();
      return response.success && response.data?.user?.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },

  /**
   * Get CSRF token (if using CSRF protection)
   */
  async getCsrfToken(): Promise<ApiResponse> {
    return fetchAPI("/api/auth/csrf");
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<ApiResponse> {
    return fetchAPI("/api/auth/signout", {
      method: "POST",
    });
  },

  /**
   * Sign in a user (handled by NextAuth directly)
   */
  signIn: async (_provider: string, _callbackUrl?: string) => {
    // This is handled by NextAuth directly
    return { success: true };
  },

  /**
   * Register a new user
   */
  signUp: async (userData: Partial<User>) => {
    return fetchAPI<User>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  /**
   * Verify a user's email address
   */
  verifyEmail: async (code: string, email: string) => {
    return fetchAPI<{ verified: boolean }>(
      `/api/auth/verify-email?code=${code}&email=${encodeURIComponent(email)}`
    );
  },
};

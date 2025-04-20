import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import { generateUsername } from "@/helper/generateUsername";
import type { ApiResponse, User as UserType } from "@/types";

/**
 * Auth Service
 * Handles authentication and user management business logic
 */
export const authService = {
  /**
   * Authenticate a user with email and password
   */
  async authenticateUser(email: string, password: string) {
    await dbConnect();

    try {
      // Find the user
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error("Invalid password");
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name || user.username,
        role: user.role || "user",
      };
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async signUp(userData: {
    email: string;
    password: string;
    name?: string;
  }): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        return {
          success: false,
          error: "User with this email already exists",
        };
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Generate username if not provided
      const username = userData.name
        ? generateUsername(userData.name)
        : generateUsername(userData.email.split("@")[0]);

      // Create user
      const user = new User({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        username,
        role: "user", // Default role
        verified: false, // Account not verified initially
        createdAt: new Date(),
      });

      await user.save();

      return {
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
        },
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Verify user email
   */
  async verifyEmail(email: string, code: string): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      // In a real app, we would verify the code
      // For simplicity, assume any code works

      // Update user verification status
      user.verified = true;
      await user.save();

      return {
        success: true,
        message: "Email verified successfully",
      };
    } catch (error) {
      console.error("Error verifying email:", error);
      throw error;
    }
  },

  /**
   * Reset user password
   */
  async resetPassword(
    email: string,
    newPassword: string
  ): Promise<ApiResponse> {
    await dbConnect();

    try {
      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },

  /**
   * Check if a user is an admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    await dbConnect();

    try {
      const user = await User.findById(userId);
      return user?.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },
};

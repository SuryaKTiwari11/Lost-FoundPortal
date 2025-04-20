import { connectToDatabase } from "@/lib/dbConnect";
import User from "@/model/user.model";
import "@/lib/load-env";

export interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
}

/**
 * Service for managing user profiles
 */
export class UserService {
  /**
   * Get a user profile by email
   */
  async getUserByEmail(email: string) {
    try {
      await connectToDatabase();

      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      console.error(`Error fetching user with email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Update a user profile
   */
  async updateUserProfile(email: string, profileData: ProfileData) {
    try {
      await connectToDatabase();

      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      // Update user profile
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { $set: profileData },
        { new: true }
      );

      return {
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      };
    } catch (error: any) {
      console.error(`Error updating user profile for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Delete a user account
   */
  async deleteUserAccount(email: string) {
    try {
      await connectToDatabase();

      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      // Delete the user
      await User.findOneAndDelete({ email });

      return {
        success: true,
        message: "User account deleted successfully",
      };
    } catch (error: any) {
      console.error(`Error deleting user account for ${email}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const userService = new UserService();

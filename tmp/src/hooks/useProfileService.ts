import { useState, useCallback } from "react";
import { Session } from "next-auth";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";

export function useProfileService(session: Session | null) {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/users/profile?email=${encodeURIComponent(session.user.email)}`
      );
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setProfileData(data.data);
      } else {
        toast.error(data.error || "Failed to load profile data");
      }
    } catch (error) {
      toast.error("An error occurred while fetching profile data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const updateProfile = async (formData: any, onSuccess?: () => void) => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          ...formData,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        toast.success("Profile updated successfully");
        setProfileData({ ...profileData, ...formData });
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profileData,
    isLoading,
    fetchUserProfile,
    updateProfile,
  };
}

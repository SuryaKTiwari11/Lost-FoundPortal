"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useProfileService } from "@/hooks/useProfileService";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileView from "@/components/profile/ProfileView";
import AccessDeniedMessage from "@/components/shared/AccessDeniedMessage";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const { profileData, isLoading, fetchUserProfile, updateProfile } =
    useProfileService(session);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchUserProfile();
    }
  }, [status, session, fetchUserProfile]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <AccessDeniedMessage message="You need to be logged in to view this page." />
    );
  }

  return (
    <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#FFD166]">
          Profile
        </h1>

        <div className="bg-[#1E1E1E] rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden">
          <ProfileHeader
            session={session}
            profileData={profileData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />

          <div className="p-6 md:p-8">
            {isEditing ? (
              <ProfileForm
                profileData={profileData}
                onSubmit={(formData) =>
                  updateProfile(formData, () => setIsEditing(false))
                }
                isLoading={isLoading}
              />
            ) : (
              <ProfileView profileData={profileData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormData } from "@/schemas/profileSchema";
import { ApiResponse } from "@/types/ApiResponse";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchUserProfile();
    }
  }, [status, session]);

  async function fetchUserProfile() {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch(
        `/api/users/profile?email=${session?.user?.email}`
      );
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setProfileData(data.data);
        reset(data.data); // Pre-fill the form with existing data
      } else {
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      toast.error("An error occurred while fetching profile data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          ...data,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        toast.success("Profile updated successfully");
        setProfileData({ ...profileData, ...data });
        setIsEditing(false);
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

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD166]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-[#FFD166]">Access Denied</h1>
          <p className="mt-4">You need to be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#FFD166]">
          Profile
        </h1>

        <div className="bg-[#1E1E1E] rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden">
          {/* Profile Header */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-b border-gray-800">
            <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-700">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile picture"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-800 text-3xl font-bold">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
              <p className="text-gray-400">{session?.user?.email}</p>
              {profileData?.rollNumber && (
                <p className="text-gray-300 mt-1">
                  Roll No: {profileData.rollNumber}
                </p>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 px-4 py-2 bg-[#FFD166] text-black rounded-md font-medium hover:bg-opacity-90 transition"
              >
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 md:p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <input
                      {...register("name")}
                      className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                    />
                    {errors.name && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Roll Number
                    </label>
                    <input
                      {...register("rollNumber")}
                      className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                    />
                    {errors.rollNumber && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.rollNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      {...register("contactPhone")}
                      className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                    />
                    {errors.contactPhone && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.contactPhone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Alternate Email
                    </label>
                    <input
                      {...register("alternateEmail")}
                      className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                    />
                    {errors.alternateEmail && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.alternateEmail.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Department
                    </label>
                    <input
                      {...register("department")}
                      className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                    />
                    {errors.department && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.department.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Year of Study
                    </label>
                    <select
                      {...register("yearOfStudy")}
                      className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Staff">Staff</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.yearOfStudy && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.yearOfStudy.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hostel Details
                    </label>
                    <input
                      {...register("hostelDetails")}
                      className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                      placeholder="e.g., H5-123, J-Hostel"
                    />
                    {errors.hostelDetails && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.hostelDetails.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    {...register("bio")}
                    rows={4}
                    className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                  ></textarea>
                  {errors.bio && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.bio.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#FFD166] text-black rounded-md font-medium hover:bg-opacity-90 transition"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-[#FFD166] border-b border-gray-800 pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                  <div>
                    <h4 className="text-sm text-gray-400">Department</h4>
                    <p>{profileData?.department || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Year of Study</h4>
                    <p>{profileData?.yearOfStudy || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Phone Number</h4>
                    <p>{profileData?.contactPhone || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Alternate Email</h4>
                    <p>{profileData?.alternateEmail || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Hostel Details</h4>
                    <p>{profileData?.hostelDetails || "Not specified"}</p>
                  </div>
                </div>

                {profileData?.bio && (
                  <>
                    <h3 className="text-xl font-semibold text-[#FFD166] border-b border-gray-800 pb-2 mt-8">
                      Bio
                    </h3>
                    <p className="whitespace-pre-line">{profileData.bio}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

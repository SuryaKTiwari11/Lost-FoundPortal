"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { foundItemSchema, FoundItemFormData } from "@/schemas/foundItemSchema";
import { ITEM_CATEGORIES } from "@/model/foundItem.model";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ReportFoundItemForm() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<FoundItemFormData>({
    resolver: zodResolver(foundItemSchema),
    defaultValues: {
      foundDate: new Date(),
    },
  });

  // Fetch user profile to pre-fill contact information
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchUserProfile();
    }
  }, [status, session]);

  async function fetchUserProfile() {
    try {
      const response = await fetch(
        `/api/users/profile?email=${session?.user?.email}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setUserProfile(data.data);

        // Pre-fill contact information
        if (data.data.contactEmail || session?.user?.email) {
          setValue(
            "contactEmail",
            data.data.contactEmail || session?.user?.email || ""
          );
        }

        if (data.data.contactPhone) {
          setValue("contactPhone", data.data.contactPhone);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }

  const onSubmit = async (data: FoundItemFormData) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to report a found item");
      return;
    }

    try {
      setIsSubmitting(true);

      // Add user information to the form data
      const formData = {
        ...data,
        reportedBy: session.user.id,
        // Include additional profile data if needed
        userName: session.user.name,
        userEmail: session.user.email,
      };

      // Debug the form data being sent
      console.log("Submitting form data:", formData);

      const response = await fetch("/api/items/report-found", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("API response:", result);

      if (result.success) {
        toast.success("Item reported successfully!");
        reset(); // Clear the form

        // Redirect after a short delay to allow the toast to be seen
        setTimeout(() => {
          router.push("/items/reported");
        }, 2000);
      } else {
        toast.error(result.error || "Failed to report item");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while reporting the item");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="text-center p-6 bg-[#1E1E1E] rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Login Required</h3>
        <p className="mb-4">You must be logged in to report a found item.</p>
        <button
          onClick={() => router.push("/sign")}
          className="px-4 py-2 bg-[#FFD166] text-black rounded-md hover:bg-opacity-90 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Basic Information */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Item Name *
            </label>
            <input
              {...register("itemName")}
              className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
              placeholder="e.g., Blue Backpack"
            />
            {errors.itemName && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.itemName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              {...register("category")}
              className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
            >
              <option value="">Select category</option>
              {ITEM_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
              placeholder="Provide details about the item, including any identifying features"
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Location & Time */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Found Location *
            </label>
            <input
              {...register("foundLocation")}
              className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
              placeholder="e.g., Library, 2nd Floor"
            />
            {errors.foundLocation && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.foundLocation.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Date Found *
            </label>
            <input
              type="date"
              {...register("foundDate", {
                setValueAs: (value) => (value ? new Date(value) : null),
              })}
              className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
            />
            {errors.foundDate && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.foundDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Current Holding Location
            </label>
            <input
              {...register("currentHoldingLocation")}
              className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
              placeholder="e.g., Lost & Found Office"
            />
            {errors.currentHoldingLocation && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.currentHoldingLocation.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              {...register("imageURL")}
              className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageURL && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.imageURL.message}
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Email *
            </label>
            <input
              {...register("contactEmail")}
              className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
              placeholder="your.email@example.com"
            />
            {errors.contactEmail && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Phone
            </label>
            <input
              {...register("contactPhone")}
              className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
              placeholder="+91 98765 43210"
            />
            {errors.contactPhone && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.contactPhone.message}
              </p>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-400 mt-4">
          <p>Fields marked with * are required</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#FFD166] text-black rounded-md font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Report Found Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

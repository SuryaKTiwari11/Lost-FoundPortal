"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { foundItemSchema, FoundItemFormData } from "@/schemas/foundItemSchema";
import { ITEM_CATEGORIES } from "@/constants/categories";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, X, Loader2, Check } from "lucide-react";

export default function ReportFoundItemForm() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FoundItemFormData>({
    resolver: zodResolver(foundItemSchema),
    defaultValues: {
      foundDate: new Date(),
    },
  });

  const watchImageURL = watch("imageURL");

  // Fetch user profile to pre-fill contact information
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchUserProfile();
    }
  }, [status, session]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Please choose an image under 5MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Selected file is not an image.");
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(objectUrl);

    // Clear imageURL field if using upload
    setValue("imageURL", "");
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Image upload response:", data);
      return data.url; // Return the URL of the uploaded image
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const onSubmit = async (data: FoundItemFormData) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to report a found item");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(10);

      // Upload image if selected
      let imageURL = data.imageURL;
      if (selectedImage) {
        setUploadProgress(30);
        try {
          imageURL = await uploadImage(selectedImage);
          setUploadProgress(70);
        } catch (error) {
          toast.error("Image upload failed. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      // Add user information and image to the form data
      const formData = {
        ...data,
        status: "pending", // Set initial status to pending
        isVerified: false, // Not verified until admin approves
        images: imageURL ? [imageURL] : [], // Store image URL in an array
        reportedBy: session.user.id,
        // Include additional profile data
        userName: session.user.name,
        userEmail: session.user.email,
      };

      // Debug the form data being sent
      console.log("Submitting form data:", formData);
      setUploadProgress(80);

      const response = await fetch("/api/found-items/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("API response:", result);
      setUploadProgress(100);

      if (result.success) {
        toast.success("Item reported successfully!");
        reset(); // Clear the form
        removeSelectedImage(); // Clear any selected image

        // Redirect after a short delay to allow the toast to be seen
        setTimeout(() => {
          router.push("/dashboard");
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

          {/* Image Upload or URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Item Image</label>

            <div className="flex flex-col gap-4">
              {/* Upload option */}
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#333] text-white rounded-md flex items-center gap-2 hover:bg-[#444] transition"
                  >
                    <ImagePlus className="w-4 h-4" /> Upload Image
                  </button>
                  <span className="text-sm text-gray-400">or</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Image preview */}
                {previewUrl && (
                  <div className="mt-4 relative w-full max-w-md">
                    <div className="relative h-40 rounded-md overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Selected image preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="mt-1 text-sm text-gray-400">
                      {selectedImage?.name} (
                      {(selectedImage?.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>

              {/* External URL option */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-2">
                  {!selectedImage
                    ? "Or enter an image URL:"
                    : "Image URL (ignored when uploading an image):"}
                </label>
                <input
                  {...register("imageURL")}
                  className={`w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none ${selectedImage ? "opacity-50" : ""}`}
                  placeholder="https://example.com/image.jpg"
                  disabled={!!selectedImage}
                />
                {errors.imageURL && !selectedImage && (
                  <p className="mt-1 text-red-500 text-sm">
                    {errors.imageURL.message}
                  </p>
                )}
              </div>
            </div>
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
            className="px-6 py-3 bg-[#FFD166] text-black rounded-md font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting... {uploadProgress > 0 && `(${uploadProgress}%)`}
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Report Found Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

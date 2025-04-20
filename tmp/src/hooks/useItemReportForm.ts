import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { itemsAPI } from "@/services/api";
import { userAPI } from "@/services/api";
import { ITEM_CATEGORIES } from "@/constants/categories";

// Shared schema for both lost and found items
const itemReportBaseSchema = z.object({
  name: z.string().min(3, "Item name must be at least 3 characters"),
  category: z.enum(ITEM_CATEGORIES as [string, ...string[]]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  location: z.string().min(3, "Location must be at least 3 characters"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .optional(),
});

// Lost items have a few additional fields
const lostItemSchema = itemReportBaseSchema.extend({
  reward: z.string().optional(),
  additionalInfo: z.string().optional(),
});

// Found items might have an image
const foundItemSchema = itemReportBaseSchema.extend({
  image: z.any().optional(),
});

export type ItemReportFormType = "lost" | "found";

export function useItemReportForm(type: ItemReportFormType) {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Total number of steps in the form
  const totalSteps = type === "lost" ? 3 : 4;

  // Calculate form progress percentage
  const formProgress = (formStep / totalSteps) * 100;

  // Select the appropriate schema based on form type
  const formSchema = type === "lost" ? lostItemSchema : foundItemSchema;

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      name: "",
      description: "",
      date: "",
      time: "",
      location: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      // Lost item specific fields
      reward: "",
      additionalInfo: "",
      // Found item specific
      image: undefined,
    },
  });

  // Fetch user profile when component mounts
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchUserProfile();
    }
  }, [status, session]);

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Fetch user profile and pre-fill contact information
  const fetchUserProfile = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await userAPI.getProfile(session.user.email);
      if (response.success && response.data) {
        setValue("contactName", response.data.name || "");
        setValue("contactEmail", response.data.email || "");
        setValue("contactPhone", response.data.phone || "");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Handle image selection (for found items)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);

    // Create preview
    const imgUrl = URL.createObjectURL(file);
    setPreviewUrl(imgUrl);
  };

  // Remove selected image
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

  // Form submission handler
  const onSubmit = async (data: any) => {
    if (status !== "authenticated") {
      toast.error("You must be logged in to report an item");
      router.push("/sign");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Different submission handling based on form type
      if (type === "lost") {
        await handleLostItemSubmission(data);
      } else {
        await handleFoundItemSubmission(data);
      }
    } catch (error) {
      console.error(`Error reporting ${type} item:`, error);
      toast.error(`Failed to report ${type} item. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle lost item submission
  const handleLostItemSubmission = async (data: any) => {
    const response = await itemsAPI.reportLostItem(data);

    if (response.success) {
      toast.success("Lost item reported successfully!");
      router.push("/dashboard");
    } else {
      toast.error(response.error || "Failed to report lost item");
    }
  };

  // Handle found item submission
  const handleFoundItemSubmission = async (data: any) => {
    // If there's an image, upload it first
    if (selectedImage) {
      const formData = new FormData();
      formData.append("image", selectedImage);

      try {
        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 300);

        // Upload image
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(interval);
        setUploadProgress(100);

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          data.image = uploadResult.data.url;
        } else {
          throw new Error(uploadResult.error || "Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image. Please try again.");
        setUploadProgress(0);
        return;
      }
    }

    // Submit the form data with the image URL
    const response = await itemsAPI.reportFoundItem(data);

    if (response.success) {
      toast.success("Found item reported successfully!");
      router.push("/dashboard");
    } else {
      toast.error(response.error || "Failed to report found item");
    }
  };

  // Navigation between form steps
  const nextStep = () => {
    if (formStep < totalSteps) {
      setFormStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (formStep > 1) {
      setFormStep((prev) => prev - 1);
    }
  };

  return {
    session,
    status,
    isSubmitting,
    selectedImage,
    previewUrl,
    uploadProgress,
    formStep,
    totalSteps,
    fileInputRef,
    register,
    handleSubmit,
    errors,
    watch,
    control,
    fetchUserProfile,
    handleImageSelect,
    removeSelectedImage,
    onSubmit,
    nextStep,
    prevStep,
    formProgress,
    router,
    type,
  };
}

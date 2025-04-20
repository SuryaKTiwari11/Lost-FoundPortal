import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { foundItemSchema, FoundItemFormData } from "@/schemas/foundItemSchema";
import { uploadImage, submitFoundItemReport } from "@/services/reportService";

export function useReportFoundForm() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formStep, setFormStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    control,
  } = useForm<FoundItemFormData>({
    resolver: zodResolver(foundItemSchema),
    defaultValues: {
      foundDate: new Date(),
    },
    mode: "onChange",
  });

  // Pre-fill form with user's information if available
  const fetchUserProfile = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(
        `/api/users/profile?email=${session.user.email}`
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
  };

  // Handle file selection for image upload
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

  // Clear selected image
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

  // Submit form data to the server
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

      setUploadProgress(80);

      // Submit form data
      const result = await submitFoundItemReport(
        data,
        session.user.id,
        session.user.name || "",
        session.user.email || "",
        imageURL
      );

      setUploadProgress(100);

      if (result.success) {
        toast.success(result.message || "Item reported successfully!");
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

  // Progress to the next step in the form
  const nextStep = async () => {
    let canProceed = false;

    if (formStep === 1) {
      const result = await trigger(["itemName", "category", "description"]);
      canProceed = result;
    } else if (formStep === 2) {
      const result = await trigger(["foundLocation", "foundDate"]);
      canProceed = result;
    }

    if (canProceed) {
      setFormStep(formStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Go back to the previous step in the form
  const prevStep = () => {
    setFormStep(formStep - 1);
    window.scrollTo(0, 0);
  };

  const formProgress = (formStep / totalSteps) * 100;

  return {
    session,
    status,
    isSubmitting,
    userProfile,
    selectedImage,
    previewUrl,
    uploadProgress,
    formStep,
    totalSteps,
    fileInputRef,
    register,
    handleSubmit,
    errors,
    isValid,
    setValue,
    watch,
    control,
    fetchUserProfile,
    handleImageSelect,
    removeSelectedImage,
    onSubmit,
    nextStep,
    prevStep,
    formProgress,
  };
}

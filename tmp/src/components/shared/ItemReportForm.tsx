"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Spinner from "@/components/ui/Spinner";
import {
  CalendarIcon,
  MapPin,
  ShoppingBag,
  Phone,
  Mail,
  Image as ImageIcon,
  FileText,
  Tag,
  Home,
  User,
  X,
  Upload,
  Check,
} from "lucide-react";
import { ITEM_CATEGORIES } from "@/constants/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type ItemReportType = "lost" | "found";

// Default field sets for each report type
const defaultLostFormData = {
  itemName: "",
  description: "",
  category: "",
  lastSeenLocation: "", // Lost specific
  lastSeenDate: new Date(), // Lost specific
  ownerName: "", // Lost specific
  imageURL: "",
  contactEmail: "",
  contactPhone: "",
  reward: "", // Lost specific
  status: "pending", // Add default status for admin verification
};

const defaultFoundFormData = {
  itemName: "",
  description: "",
  category: "",
  foundLocation: "", // Found specific
  foundDate: new Date(), // Found specific
  currentHoldingLocation: "", // Found specific
  imageURL: "",
  contactEmail: "",
  contactPhone: "",
  status: "pending", // Add default status for admin verification
};

type ItemReportFormProps = {
  type: ItemReportType;
};

export default function ItemReportForm({ type }: ItemReportFormProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    type === "lost" ? defaultLostFormData : defaultFoundFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Get field names based on type
  const locationField = type === "lost" ? "lastSeenLocation" : "foundLocation";
  const dateField = type === "lost" ? "lastSeenDate" : "foundDate";

  // Pre-fill contact info from session
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setFormData((prev) => ({
        ...prev,
        contactEmail: session.user.email || "",
      }));
    }
  }, [status, session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        [dateField]: date,
      }));

      // Clear errors
      if (errors[dateField]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[dateField];
          return newErrors;
        });
      }
    }
  };

  // Handle image upload
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
    setFormData((prev) => ({
      ...prev,
      imageURL: "",
    }));
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

  // Upload image to Cloudinary
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Starting upload to Cloudinary...");

      // Create a better progress tracking system with XHR
      return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 70);
            setUploadProgress(30 + progress); // Start at 30%, max at 100%
          }
        };

        // Handle completion
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("Upload successful:", response);
              if (response.success) {
                resolve(response.url);
              } else {
                reject(new Error(response.error || "Upload failed"));
              }
            } catch (error) {
              reject(new Error("Invalid response from server"));
            }
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };

        // Handle errors
        xhr.onerror = () => {
          console.error("XHR upload error");
          reject(new Error("Network error during upload"));
        };

        // Open and send the request
        xhr.open("POST", "/api/upload", true);
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Validate location based on type
    if (type === "lost" && !formData.lastSeenLocation?.trim()) {
      newErrors.lastSeenLocation = "Last seen location is required";
    } else if (type === "found" && !formData.foundLocation?.trim()) {
      newErrors.foundLocation = "Found location is required";
    }

    // For lost items, validate owner name if present
    if (
      type === "lost" &&
      "ownerName" in formData &&
      !formData.ownerName?.trim()
    ) {
      newErrors.ownerName = "Owner name is required";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Email is invalid";
    }

    if (
      formData.contactPhone &&
      !/^[0-9+\-\s()]{10,15}$/.test(formData.contactPhone)
    ) {
      newErrors.contactPhone = "Phone number is invalid";
    }

    if (
      formData.imageURL &&
      !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(formData.imageURL)
    ) {
      newErrors.imageURL = "Image URL is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to submit a report");
      router.push("/sign");
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      // Upload image if selected
      let imageURL = formData.imageURL;
      if (selectedImage) {
        setUploadProgress(30);
        try {
          imageURL = await uploadImage(selectedImage);
          setUploadProgress(60);
        } catch (error) {
          toast.error("Image upload failed. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Prepare data for submission with correct field names mapping
      let submissionData;

      if (type === "lost") {
        // Type assertion to tell TypeScript this is the lost form variant
        const lostFormData = formData as typeof defaultLostFormData;
        
        // Map form fields to match LostItem model requirements
        submissionData = {
          itemName: lostFormData.itemName,
          description: lostFormData.description,
          category: lostFormData.category,
          lastLocation: lostFormData.lastSeenLocation, // Map to expected field name
          dateLost: lostFormData.lastSeenDate, // Map to expected field name
          imageURL: imageURL || "",
          contactEmail: lostFormData.contactEmail || session.user.email,
          contactPhone: lostFormData.contactPhone || "",
          status: "lost", // Use valid enum value from model
          reportedBy: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
        };
      } else {
        // Type assertion for found item form data
        const foundFormData = formData as typeof defaultFoundFormData;
        
        // Found item submission
        submissionData = {
          ...foundFormData,
          status: "pending", // For found items
          images: imageURL ? [imageURL] : [],
          imageURL: imageURL || "",
          reportedBy: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
        };
      }

    
      console.log(`Submitting ${type} item data:`, submissionData);
      setUploadProgress(80);

      // Submit to the appropriate API endpoint
      const endpoint =
        type === "lost" ? "/api/lost-items/create" : "/api/found-items/create";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      setUploadProgress(100);

      if (result.success) {
        toast.success(
          `${type === "lost" ? "Lost" : "Found"} item reported successfully!`
        );
        setFormData(
          type === "lost" ? defaultLostFormData : defaultFoundFormData
        );
        removeSelectedImage();

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        toast.error(
          result.error ||
            `Failed to submit ${type} item report: ${result.error}`
        );
        console.error(`${type} item submission error:`, result);
      }
    } catch (error) {
      console.error("Report submission error:", error);
      toast.error(
        "An error occurred while submitting your report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <Card className="w-full max-w-2xl shadow-lg border-neutral-800">
        <CardHeader className="space-y-2 pb-6 pt-6">
          <CardTitle className="text-2xl font-bold text-center">
            Login Required
          </CardTitle>
          <p className="text-gray-400 text-center text-sm">
            You must be logged in to report a{" "}
            {type === "lost" ? "lost" : "found"} item
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Button className="mt-4" onClick={() => router.push("/sign")}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg border-neutral-800">
      <CardHeader className="space-y-2 pb-6 pt-6">
        <CardTitle className="text-2xl font-bold text-center">
          Report a {type === "lost" ? "Lost" : "Found"} Item
        </CardTitle>
        <p className="text-gray-400 text-center text-sm">
          {type === "lost"
            ? "Provide details about your lost item to help others find it"
            : "Provide details about the item you found to help reconnect it with its owner"}
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-2">
          {errors.form && (
            <div className="p-3 rounded-md bg-red-900/30 border border-red-800 text-red-200 text-sm">
              {errors.form}
            </div>
          )}

          {/* Item Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="itemName"
              className="text-sm font-medium text-gray-200"
            >
              Item Name
            </label>
            <div className="relative">
              <ShoppingBag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="itemName"
                name="itemName"
                placeholder="Enter the item name"
                className={`h-10 pl-10 ${errors.itemName ? "border-red-500" : "border-neutral-700"}`}
                value={formData.itemName}
                onChange={handleChange}
              />
            </div>
            {errors.itemName && (
              <p className="text-xs text-red-500 mt-1">{errors.itemName}</p>
            )}
          </div>

          {/* Owner Name - Only for Lost items */}
          {type === "lost" && (
            <div className="space-y-1.5">
              <label
                htmlFor="ownerName"
                className="text-sm font-medium text-gray-200"
              >
                Owner Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="ownerName"
                  name="ownerName"
                  placeholder="Enter your name"
                  className={`h-10 pl-10 ${errors.ownerName ? "border-red-500" : "border-neutral-700"}`}
                  value={formData.ownerName}
                  onChange={handleChange}
                />
              </div>
              {errors.ownerName && (
                <p className="text-xs text-red-500 mt-1">{errors.ownerName}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-200"
            >
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                name="description"
                placeholder={`Provide a detailed description of ${type === "lost" ? "your lost" : "the"} item`}
                className={`pl-10 min-h-[100px] resize-none ${errors.description ? "border-red-500" : "border-neutral-700"}`}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Two-column layout for smaller fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-200"
              >
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange(value, "category")
                  }
                >
                  <SelectTrigger
                    className={`h-10 pl-10 ${errors.category ? "border-red-500" : "border-neutral-700"}`}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Date Field - Either Last Seen Date or Found Date */}
            <div className="space-y-1.5">
              <label
                htmlFor={dateField}
                className="text-sm font-medium text-gray-200"
              >
                {type === "lost" ? "Last Seen Date" : "Date Found"}
              </label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full h-10 justify-start text-left font-normal ${
                        errors[dateField]
                          ? "border-red-500"
                          : "border-neutral-700"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData[dateField] ? (
                        format(formData[dateField] as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData[dateField] as Date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors[dateField] && (
                <p className="text-xs text-red-500 mt-1">{errors[dateField]}</p>
              )}
            </div>
          </div>

          {/* Location Field - Either Last Seen Location or Found Location */}
          <div className="space-y-1.5">
            <label
              htmlFor={locationField}
              className="text-sm font-medium text-gray-200"
            >
              {type === "lost" ? "Last Seen Location" : "Found Location"}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id={locationField}
                name={locationField}
                placeholder={
                  type === "lost"
                    ? "Where was the item last seen?"
                    : "Where did you find this item?"
                }
                className={`h-10 pl-10 ${errors[locationField] ? "border-red-500" : "border-neutral-700"}`}
                value={formData[locationField] as string}
                onChange={handleChange}
              />
            </div>
            {errors[locationField] && (
              <p className="text-xs text-red-500 mt-1">
                {errors[locationField]}
              </p>
            )}
          </div>

          {/* Current Holding Location - Only for Found items */}
          {type === "found" && (
            <div className="space-y-1.5">
              <label
                htmlFor="currentHoldingLocation"
                className="text-sm font-medium text-gray-200"
              >
                Current Holding Location{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="currentHoldingLocation"
                  name="currentHoldingLocation"
                  placeholder="Where is the item currently being kept?"
                  className={`h-10 pl-10 ${errors.currentHoldingLocation ? "border-red-500" : "border-neutral-700"}`}
                  value={(formData.currentHoldingLocation as string) || ""}
                  onChange={handleChange}
                />
              </div>
              {errors.currentHoldingLocation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.currentHoldingLocation}
                </p>
              )}
            </div>
          )}

          {/* Reward - Only for Lost items */}
          {type === "lost" && (
            <div className="space-y-1.5">
              <label
                htmlFor="reward"
                className="text-sm font-medium text-gray-200"
              >
                Reward <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="reward"
                  name="reward"
                  placeholder="Any reward for finding your item?"
                  className={`h-10 pl-10 ${errors.reward ? "border-red-500" : "border-neutral-700"}`}
                  value={(formData.reward as string) || ""}
                  onChange={handleChange}
                />
              </div>
              {errors.reward && (
                <p className="text-xs text-red-500 mt-1">{errors.reward}</p>
              )}
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-200">
              Item Image
            </label>

            <div className="flex flex-col gap-4">
              {/* Upload option */}
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border-neutral-700 text-white rounded-md flex items-center gap-2 hover:bg-neutral-800 transition"
                  >
                    <Upload className="w-4 h-4" /> Upload Image
                  </Button>
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
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={removeSelectedImage}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 p-1 hover:bg-opacity-70 transition"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="imageURL"
                    name="imageURL"
                    placeholder="URL to an image of the item"
                    className={`h-10 pl-10 ${errors.imageURL ? "border-red-500" : "border-neutral-700"} ${selectedImage ? "opacity-50" : ""}`}
                    value={formData.imageURL}
                    onChange={handleChange}
                    disabled={!!selectedImage}
                  />
                </div>
                {errors.imageURL && !selectedImage && (
                  <p className="text-xs text-red-500 mt-1">{errors.imageURL}</p>
                )}
              </div>
            </div>
          </div>

          {/* Two-column layout for contact information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Contact Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="contactEmail"
                className="text-sm font-medium text-gray-200"
              >
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="Your email address"
                  className={`h-10 pl-10 ${errors.contactEmail ? "border-red-500" : "border-neutral-700"}`}
                  value={formData.contactEmail}
                  onChange={handleChange}
                />
              </div>
              {errors.contactEmail && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.contactEmail}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label
                htmlFor="contactPhone"
                className="text-sm font-medium text-gray-200"
              >
                Contact Phone{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="Your phone number"
                  className={`h-10 pl-10 ${errors.contactPhone ? "border-red-500" : "border-neutral-700"}`}
                  value={formData.contactPhone}
                  onChange={handleChange}
                />
              </div>
              {errors.contactPhone && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.contactPhone}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-2">
          <Button
            className="w-full h-11 font-medium"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Submitting... {uploadProgress > 0 && `(${uploadProgress}%)`}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {`Submit ${type === "lost" ? "Lost" : "Found"} Item Report`}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

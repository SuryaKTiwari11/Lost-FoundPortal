"use client";

import { useState } from "react";
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
  Image,
  FileText,
  Tag,
  Home,
  User,
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
};

type ItemReportFormProps = {
  type: ItemReportType;
};

export default function ItemReportForm({ type }: ItemReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    type === "lost" ? defaultLostFormData : defaultFoundFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get field names based on type
  const locationField = type === "lost" ? "lastSeenLocation" : "foundLocation";
  const dateField = type === "lost" ? "lastSeenDate" : "foundDate";

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

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect or show success message
      alert(
        `${type === "lost" ? "Lost" : "Found"} item reported successfully!`
      );

      // Reset form
      setFormData(type === "lost" ? defaultLostFormData : defaultFoundFormData);
    } catch (error) {
      console.error("Report submission error:", error);
      setErrors({
        form: "An error occurred while submitting your report. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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

          {/* Image URL */}
          <div className="space-y-1.5">
            <label
              htmlFor="imageURL"
              className="text-sm font-medium text-gray-200"
            >
              Image URL{" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <Image
                className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                alt=""
              />
              <Input
                id="imageURL"
                name="imageURL"
                placeholder="URL to an image of the item"
                className={`h-10 pl-10 ${errors.imageURL ? "border-red-500" : "border-neutral-700"}`}
                value={formData.imageURL}
                onChange={handleChange}
              />
            </div>
            {errors.imageURL && (
              <p className="text-xs text-red-500 mt-1">{errors.imageURL}</p>
            )}
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
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            {loading
              ? "Submitting Report..."
              : `Submit ${type === "lost" ? "Lost" : "Found"} Item Report`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

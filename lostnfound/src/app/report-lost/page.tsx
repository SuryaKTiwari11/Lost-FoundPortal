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

export default function ReportLostItem() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    category: "",
    lastSeenLocation: "",
    lastSeenDate: new Date(),
    imageURL: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        lastSeenDate: date,
      }));

      // Clear errors
      if (errors.lastSeenDate) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.lastSeenDate;
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

    if (!formData.lastSeenLocation.trim()) {
      newErrors.lastSeenLocation = "Last seen location is required";
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
      alert("Lost item reported successfully!");
      // Reset form
      setFormData({
        itemName: "",
        description: "",
        category: "",
        lastSeenLocation: "",
        lastSeenDate: new Date(),
        imageURL: "",
        contactEmail: "",
        contactPhone: "",
      });
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#121212]">
      <Card className="w-full max-w-2xl shadow-lg border-neutral-800">
        <CardHeader className="space-y-2 pb-6 pt-6">
          <CardTitle className="text-2xl font-bold text-center">
            Report a Lost Item
          </CardTitle>
          <p className="text-gray-400 text-center text-sm">
            Provide details about your lost item to help others find it
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
                  placeholder="Provide a detailed description of the item"
                  className={`pl-10 min-h-[100px] resize-none ${errors.description ? "border-red-500" : "border-neutral-700"}`}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description}
                </p>
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

              {/* Last Seen Date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="lastSeenDate"
                  className="text-sm font-medium text-gray-200"
                >
                  Last Seen Date
                </label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full h-10 justify-start text-left font-normal ${
                          errors.lastSeenDate
                            ? "border-red-500"
                            : "border-neutral-700"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.lastSeenDate ? (
                          format(formData.lastSeenDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.lastSeenDate}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.lastSeenDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.lastSeenDate}
                  </p>
                )}
              </div>
            </div>

            {/* Last Seen Location */}
            <div className="space-y-1.5">
              <label
                htmlFor="lastSeenLocation"
                className="text-sm font-medium text-gray-200"
              >
                Last Seen Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="lastSeenLocation"
                  name="lastSeenLocation"
                  placeholder="Where was the item last seen?"
                  className={`h-10 pl-10 ${errors.lastSeenLocation ? "border-red-500" : "border-neutral-700"}`}
                  value={formData.lastSeenLocation}
                  onChange={handleChange}
                />
              </div>
              {errors.lastSeenLocation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.lastSeenLocation}
                </p>
              )}
            </div>

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
                <Image className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
              {loading ? "Submitting Report..." : "Submit Lost Item Report"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Clock,
  ArrowLeft,
  Check,
  X as XIcon,
} from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { itemsAPI } from "@/services/api";

export default function FoundItemDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  useEffect(() => {
    const fetchFoundItem = async () => {
      setLoading(true);
      try {
        const response = await itemsAPI.getFoundItemById(id as string);

        if (response.success) {
          setItem(response.data);
        } else {
          toast.error(response.error || "Failed to load item details");
        }
      } catch (error) {
        console.error("Error fetching found item:", error);
        toast.error("An error occurred while loading the item");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFoundItem();
    }
  }, [id]);

  const handleClaimItem = async () => {
    if (status !== "authenticated") {
      toast.error("Please sign in to claim this item");
      router.push(`/sign?callbackUrl=/found-items/${id}`);
      return;
    }

    setClaimModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center py-12">
        <Spinner size="lg" className="text-[#FFD166]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#121212] py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Item Not Found
            </h1>
            <p className="text-gray-400 mb-6">
              This item may have been removed or doesn't exist.
            </p>
            <Button onClick={() => router.push("/all-items")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Items
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="bg-[#1A1A1A] border-[#333333] overflow-hidden">
          <CardHeader className="pb-4 border-b border-[#333333]">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <Badge className="mb-2 bg-green-900 text-white">
                  Found Item
                </Badge>
                <CardTitle className="text-2xl font-bold text-white">
                  {item.itemName}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-base">
                {item.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column - Image */}
              <div className="relative h-64 bg-[#2A2A2A] rounded-lg flex items-center justify-center">
                {item.imageURL ? (
                  <Image
                    src={item.imageURL}
                    alt={item.itemName}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center p-4">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-500 mb-2" />
                    <p className="text-gray-400">No image available</p>
                  </div>
                )}
              </div>

              {/* Right column - Item details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">
                    Description
                  </h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        Found Location
                      </p>
                      <p className="text-gray-300">{item.foundLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        Date Found
                      </p>
                      <p className="text-gray-300">
                        {format(new Date(item.foundDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  {item.currentHoldingLocation && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-400">
                          Current Location
                        </p>
                        <p className="text-gray-300">
                          {item.currentHoldingLocation}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        Date Reported
                      </p>
                      <p className="text-gray-300">
                        {format(new Date(item.createdAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        Reported By
                      </p>
                      <p className="text-gray-300">
                        {item.reportedBy?.name || "Anonymous"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#333333] pt-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Is this your item?
              </h3>
              <p className="text-gray-400 mb-6">
                If you believe this is your lost item, you can submit a claim.
                You'll need to provide additional details to verify your
                ownership.
              </p>

              <Button
                className="w-full md:w-auto py-2 px-6"
                onClick={handleClaimItem}
              >
                Claim This Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Claim Modal */}
        {claimModalOpen && (
          <ClaimModal
            item={item}
            onClose={() => setClaimModalOpen(false)}
            onSubmit={async (data) => {
              try {
                const response = await itemsAPI.claimFoundItem(data);
                if (response.success) {
                  toast.success(
                    "Claim submitted successfully! You'll be notified when it's reviewed."
                  );
                  setClaimModalOpen(false);
                } else {
                  toast.error(response.error || "Failed to submit claim");
                }
              } catch (error) {
                console.error("Error submitting claim:", error);
                toast.error("Failed to submit claim. Please try again.");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

interface ClaimModalProps {
  item: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

function ClaimModal({ item, onClose, onSubmit }: ClaimModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    claimDescription: "",
    contactPhone: "",
    additionalNotes: "",
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.claimDescription.trim()) {
      newErrors.claimDescription =
        "Please provide details to verify your ownership";
    }

    if (
      formData.contactPhone &&
      !/^[0-9+\-\s()]{10,15}$/.test(formData.contactPhone)
    ) {
      newErrors.contactPhone = "Please enter a valid phone number";
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
      await onSubmit({
        foundItemId: item._id,
        ...formData,
      });
    } catch (error) {
      console.error("Error in claim submission:", error);
      toast.error("Failed to submit claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1A1A1A] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Claim Item: {item.itemName}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={loading}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Proof of Ownership <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="claimDescription"
                className={`w-full p-3 bg-[#2A2A2A] rounded-md border ${
                  errors.claimDescription
                    ? "border-red-500"
                    : "border-[#333333]"
                }`}
                rows={5}
                placeholder="Describe specific details about the item that only the owner would know. For example: distinguishing marks, contents, defects, etc."
                value={formData.claimDescription}
                onChange={handleChange}
              />
              {errors.claimDescription && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.claimDescription}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contact Phone <span className="text-gray-500">(Optional)</span>
              </label>
              <Input
                name="contactPhone"
                className={`bg-[#2A2A2A] border ${
                  errors.contactPhone ? "border-red-500" : "border-[#333333]"
                }`}
                placeholder="Your phone number for faster communication"
                value={formData.contactPhone}
                onChange={handleChange}
              />
              {errors.contactPhone && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.contactPhone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Additional Notes{" "}
                <span className="text-gray-500">(Optional)</span>
              </label>
              <Textarea
                name="additionalNotes"
                className="bg-[#2A2A2A] border border-[#333333]"
                rows={3}
                placeholder="Any additional information you want to provide"
                value={formData.additionalNotes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-800 text-blue-200 p-4 rounded-md my-6 text-sm">
            <AlertCircle className="inline-block h-4 w-4 mr-2" />
            Your claim will be reviewed by our team. If approved, you will be
            contacted to arrange pickup from the current holding location.
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Claim
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

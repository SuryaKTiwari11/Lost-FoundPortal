"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";
import ReportFoundForm from "@/components/ReportFoundForm";

export default function LostItemDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFoundForm, setShowFoundForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLostItem();
    }
  }, [id]);

  async function fetchLostItem() {
    try {
      setLoading(true);
      const response = await fetch(`/api/lost-items/${id}`);
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setItem(data.data);
      } else {
        toast.error("Failed to load item details");
        // Redirect back to catalog after a short delay
        setTimeout(() => router.push("/lost-items"), 2000);
      }
    } catch (error) {
      console.error("Error fetching item:", error);
      toast.error("An error occurred while loading the item");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD166]"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-[#FFD166]">Item Not Found</h1>
          <p className="mt-4">
            The item you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/lost-items")}
            className="mt-6 px-4 py-2 bg-[#FFD166] text-black rounded-md hover:bg-opacity-90 transition"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push("/lost-items")}
            className="flex items-center text-gray-400 hover:text-[#FFD166] mb-6 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Catalog
          </button>

          {/* Item details card */}
          <div className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <h1 className="text-2xl font-bold text-[#FFD166]">
                {item.itemName}
              </h1>
              <div className="flex items-center text-sm text-gray-400 mt-2">
                <span className="bg-blue-900 text-blue-100 px-2 py-1 rounded-full text-xs mr-3">
                  {item.category}
                </span>
                <span>
                  Reported {format(new Date(item.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="w-full h-64 relative rounded-lg overflow-hidden bg-gray-800">
                  {item.imageURL ? (
                    <Image
                      src={item.imageURL}
                      alt={item.itemName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Description
                    </h3>
                    <p className="mt-1">{item.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Last Seen Location
                    </h3>
                    <p className="mt-1">{item.lastLocation}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Date Lost
                    </h3>
                    <p className="mt-1">
                      {item.dateLost
                        ? (() => {
                            try {
                              const date = new Date(item.dateLost);
                              if (isNaN(date.getTime())) {
                                return "Unknown date";
                              }
                              return format(date, "MMMM d, yyyy");
                            } catch (error) {
                              return "Unknown date";
                            }
                          })()
                        : "Unknown date"}
                    </p>
                  </div>

                  {/* Reporter info */}
                  <div className="border-t border-gray-800 pt-4">
                    <h3 className="text-sm font-medium text-gray-400">
                      Reported By
                    </h3>
                    <div className="mt-2 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-sm overflow-hidden">
                        {item.reportedBy?.image ? (
                          <Image
                            src={item.reportedBy.image}
                            alt=""
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          item.reportedBy?.name?.charAt(0) || "U"
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">
                          {item.reportedBy?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.contactEmail || item.reportedBy?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex flex-wrap justify-end gap-4">
                {status === "authenticated" && (
                  <button
                    onClick={() => setShowFoundForm(true)}
                    className="px-6 py-3 bg-green-700 text-white rounded-md font-medium hover:bg-green-600 transition"
                  >
                    I Found This Item
                  </button>
                )}

                {/* Only show if the current user reported this item */}
                {status === "authenticated" &&
                  session?.user?.id === item.reportedBy?._id && (
                    <button
                      onClick={() => router.push(`/lost-items/${id}/edit`)}
                      className="px-6 py-3 bg-[#333333] text-white rounded-md font-medium hover:bg-[#444444] transition"
                    >
                      Edit Details
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* Found Item Form Modal */}
          {showFoundForm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="bg-[#1E1E1E] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#FFD166]">
                      Report Found Item
                    </h2>
                    <button
                      onClick={() => setShowFoundForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <ReportFoundForm
                    lostItemId={id as string}
                    onSuccess={() => {
                      setShowFoundForm(false);
                      // Refresh the item data to show updated status
                      fetchLostItem();
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

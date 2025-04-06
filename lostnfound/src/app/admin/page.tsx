"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { ApiResponse } from "@/types/ApiResponse";
import { FoundItem } from "@/model/foundItem.model";
import { LostItem } from "@/model/lostItem.model";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Filter,
  Info,
  Mail,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<FoundItem[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [claimRequests, setClaimRequests] = useState<any[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("items");
  const [activeSubTab, setActiveSubTab] = useState<string>("pending");
  const [itemStats, setItemStats] = useState({
    pending: 0,
    verified: 0,
    claimed: 0,
    rejected: 0,
    total: 0,
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/items?status=${activeSubTab}`);
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setItems(data.data.items);
        setItemStats(data.data.stats);
      } else {
        toast.error("Failed to load items");
      }
    } catch (error) {
      toast.error("An error occurred while fetching items");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [activeSubTab]);

  const fetchClaims = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/claims");
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setClaimRequests(data.data.claims);
      } else {
        toast.error("Failed to load claim requests");
      }
    } catch (error) {
      toast.error("An error occurred while fetching claim requests");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPotentialMatches = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all lost items
      const lostResponse = await fetch("/api/admin/lost-items");
      const lostData: ApiResponse = await lostResponse.json();

      if (lostData.success && lostData.data) {
        setLostItems(lostData.data.items);
      }

      // Fetch all found items for matching
      const foundResponse = await fetch("/api/admin/items?status=verified");
      const foundData: ApiResponse = await foundResponse.json();

      if (foundData.success && foundData.data) {
        // Process potential matches
        const matches = generatePotentialMatches(
          lostData.data.items,
          foundData.data.items
        );
        setPotentialMatches(matches);
      }
    } catch (error) {
      toast.error("An error occurred while generating matches");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate potential matches based on category, date proximity, and keywords
  const generatePotentialMatches = (
    lostItems: LostItem[],
    foundItems: FoundItem[]
  ) => {
    const matches: any[] = [];

    lostItems.forEach((lostItem) => {
      foundItems.forEach((foundItem) => {
        // Skip if foundItem is already claimed
        if (foundItem.status === "claimed") return;

        let score = 0;

        // Same category +3 points
        if (lostItem.category === foundItem.category) {
          score += 3;
        }

        // Date proximity (within 3 days +2 points, within 7 days +1 point)
        const lostDate = new Date(lostItem.lostDate);
        const foundDate = new Date(foundItem.foundDate);
        const daysDifference = Math.abs(
          Math.floor(
            (lostDate.getTime() - foundDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        );

        if (daysDifference <= 3) {
          score += 2;
        } else if (daysDifference <= 7) {
          score += 1;
        }

        // Location similarity +2 points
        if (
          lostItem.lostLocation
            .toLowerCase()
            .includes(foundItem.foundLocation.toLowerCase()) ||
          foundItem.foundLocation
            .toLowerCase()
            .includes(lostItem.lostLocation.toLowerCase())
        ) {
          score += 2;
        }

        // Keyword matching in name and description
        const lostKeywords =
          `${lostItem.itemName} ${lostItem.description}`.toLowerCase();
        const foundKeywords =
          `${foundItem.itemName} ${foundItem.description}`.toLowerCase();

        // Check if major words match
        const lostWords = lostKeywords.split(/\s+/).filter((w) => w.length > 3);
        const foundWords = foundKeywords
          .split(/\s+/)
          .filter((w) => w.length > 3);

        let keywordMatches = 0;
        lostWords.forEach((word) => {
          if (foundWords.some((fw) => fw.includes(word) || word.includes(fw))) {
            keywordMatches++;
          }
        });

        score += keywordMatches;

        // Only include if score is 3 or more
        if (score >= 3) {
          matches.push({
            lostItem,
            foundItem,
            score,
            id: `${lostItem._id}-${foundItem._id}`,
          });
        }
      });
    });

    // Sort by score
    return matches.sort((a, b) => b.score - a.score);
  };

  useEffect(() => {
    if (status === "authenticated") {
      // Only admin users should access this page
      if (session?.user?.role !== "admin") {
        router.push("/admin");
        return;
      }

      if (activeTab === "items") {
        fetchItems();
      } else if (activeTab === "claims") {
        fetchClaims();
      } else if (activeTab === "matches") {
        fetchPotentialMatches();
      }
    }
  }, [
    status,
    session,
    activeTab,
    activeSubTab,
    fetchItems,
    fetchClaims,
    fetchPotentialMatches,
  ]);

  async function updateItemStatus(itemId: string, status: string) {
    try {
      const response = await fetch("/api/admin/items/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          status,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        toast.success(`Item marked as ${status}`);
        fetchItems();
      } else {
        toast.error(result.error || "Failed to update item status");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  }

  async function handleClaimDecision(claimId: string, approved: boolean) {
    try {
      const response = await fetch("/api/admin/claims/process", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId,
          approved,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        toast.success(
          approved
            ? "Claim approved and item marked as claimed"
            : "Claim rejected"
        );
        fetchClaims();
      } else {
        toast.error(result.error || "Failed to process claim");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  }

  async function createItemMatch(lostItemId: string, foundItemId: string) {
    try {
      const response = await fetch("/api/admin/matches/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lostItemId,
          foundItemId,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        toast.success(
          "Items matched successfully! Notification sent to the owner."
        );
        fetchPotentialMatches();
      } else {
        toast.error(result.error || "Failed to match items");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  }

  async function sendNotificationEmail() {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Subject and body are required");
      return;
    }

    try {
      setIsSendingEmail(true);
      const response = await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          itemIds: selectedItems.length > 0 ? selectedItems : undefined,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        toast.success("Notification email sent successfully");
        setShowEmailModal(false);
        setEmailSubject("");
        setEmailBody("");
        setSelectedItems([]);
      } else {
        toast.error(result.error || "Failed to send notification");
      }
    } catch (error) {
      toast.error("An error occurred while sending the notification");
      console.error(error);
    } finally {
      setIsSendingEmail(false);
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD166]"></div>
      </div>
    );
  }

  if (
    status === "unauthenticated" ||
    (status === "authenticated" && session?.user?.role !== "admin")
  ) {
    return (
      <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-[#FFD166]">Access Denied</h1>
          <p className="mt-4">You need admin privileges to access this page.</p>
          <Link
            href="/admin"
            className="inline-block mt-6 px-4 py-2 bg-[#FFD166] text-black rounded-md hover:bg-opacity-90 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#FFD166]">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage lost and found items</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1E1E1E] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-400">Pending</h3>
            <p className="text-3xl font-bold mt-2">{itemStats.pending}</p>
          </div>
          <div className="bg-[#1E1E1E] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-400">Verified</h3>
            <p className="text-3xl font-bold mt-2">{itemStats.verified}</p>
          </div>
          <div className="bg-[#1E1E1E] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-400">Claimed</h3>
            <p className="text-3xl font-bold mt-2">{itemStats.claimed}</p>
          </div>
          <div className="bg-[#1E1E1E] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-400">Total Items</h3>
            <p className="text-3xl font-bold mt-2">{itemStats.total}</p>
          </div>
        </div>

        {/* Top level tabs */}
        <Tabs
          defaultValue="items"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="items">Item Management</TabsTrigger>
            <TabsTrigger value="claims">Claim Requests</TabsTrigger>
            <TabsTrigger value="matches">Item Matching</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Item Management Tab Content */}
          <TabsContent value="items">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-md ${activeSubTab === "pending" ? "bg-[#FFD166] text-black" : "bg-[#2A2A2A] text-white"}`}
                  onClick={() => setActiveSubTab("pending")}
                >
                  Pending
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${activeSubTab === "verified" ? "bg-[#FFD166] text-black" : "bg-[#2A2A2A] text-white"}`}
                  onClick={() => setActiveSubTab("verified")}
                >
                  Verified
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${activeSubTab === "claimed" ? "bg-[#FFD166] text-black" : "bg-[#2A2A2A] text-white"}`}
                  onClick={() => setActiveSubTab("claimed")}
                >
                  Claimed
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${activeSubTab === "rejected" ? "bg-[#FFD166] text-black" : "bg-[#2A2A2A] text-white"}`}
                  onClick={() => setActiveSubTab("rejected")}
                >
                  Rejected
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search items..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition flex items-center"
                  onClick={() => setShowEmailModal(true)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Notification
                </button>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2A2A2A]">
                    <tr>
                      <th className="p-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(
                                items.map((item) => item._id as string)
                              );
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                          checked={
                            selectedItems.length === items.length &&
                            items.length > 0
                          }
                          className="mr-2"
                        />
                        Select
                      </th>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Location</th>
                      <th className="p-3 text-left">Date Found</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center">
                          No items found
                        </td>
                      </tr>
                    ) : (
                      items
                        .filter(
                          (item) =>
                            searchQuery === "" ||
                            item.itemName
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            item.description
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            item.category
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((item) => (
                          <tr
                            key={item._id as string}
                            className="border-t border-gray-800"
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(
                                  item._id as string
                                )}
                                onChange={() =>
                                  toggleItemSelection(item._id as string)
                                }
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                {item.imageURL ? (
                                  <div className="h-10 w-10 rounded overflow-hidden bg-gray-700 relative">
                                    <Image
                                      src={item.imageURL}
                                      alt={item.itemName}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 rounded bg-gray-700 flex items-center justify-center text-xs">
                                    No img
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{item.itemName}</p>
                                  <p className="text-sm text-gray-400 truncate max-w-[200px]">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">{item.category}</td>
                            <td className="p-3">{item.foundLocation}</td>
                            <td className="p-3">
                              {new Date(item.foundDate).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs
                              ${item.status === "found" && !item.isVerified ? "bg-blue-900 text-blue-100" : ""}
                              ${item.status === "found" && item.isVerified ? "bg-purple-900 text-purple-100" : ""}
                              ${item.status === "claimed" ? "bg-green-900 text-green-100" : ""}
                              ${item.status === "rejected" ? "bg-red-900 text-red-100" : ""}
                            `}
                              >
                                {item.status === "found" && !item.isVerified
                                  ? "pending"
                                  : item.status === "found" && item.isVerified
                                    ? "verified"
                                    : item.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="space-x-2">
                                {activeSubTab === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        updateItemStatus(
                                          item._id as string,
                                          "verified"
                                        )
                                      }
                                      className="px-2 py-1 bg-purple-700 rounded text-xs hover:bg-purple-800"
                                    >
                                      Verify
                                    </button>
                                    <button
                                      onClick={() =>
                                        updateItemStatus(
                                          item._id as string,
                                          "rejected"
                                        )
                                      }
                                      className="px-2 py-1 bg-red-700 rounded text-xs hover:bg-red-800"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {activeSubTab === "verified" && (
                                  <button
                                    onClick={() =>
                                      updateItemStatus(
                                        item._id as string,
                                        "claimed"
                                      )
                                    }
                                    className="px-2 py-1 bg-green-700 rounded text-xs hover:bg-green-800"
                                  >
                                    Mark Claimed
                                  </button>
                                )}
                                <Link
                                  href={`/item/${item._id}`}
                                  className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                                >
                                  View
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Claim Requests Tab Content */}
          <TabsContent value="claims">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Pending Claim Requests</h2>

              {claimRequests.length === 0 ? (
                <div className="bg-[#1E1E1E] p-6 rounded-lg text-center">
                  <p className="text-gray-400">No pending claim requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {claimRequests.map((claim) => (
                    <div
                      key={claim._id}
                      className="bg-[#1E1E1E] p-4 rounded-lg"
                    >
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                          <h3 className="font-bold text-lg">
                            {claim.item.itemName}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {claim.item.category} • Found on{" "}
                            {new Date(
                              claim.item.foundDate
                            ).toLocaleDateString()}
                          </p>
                          <div className="mt-3">
                            <p className="text-sm">
                              <span className="text-gray-400">Claimant:</span>{" "}
                              {claim.user.name}
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-400">Email:</span>{" "}
                              {claim.user.email}
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-400">Claimed on:</span>{" "}
                              {new Date(claim.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="mt-3 p-3 bg-[#2A2A2A] rounded-md">
                            <p className="text-sm font-medium mb-1">
                              Proof of Ownership:
                            </p>
                            <p className="text-sm">{claim.proofOfOwnership}</p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between">
                          <div className="flex space-x-2 mt-4 md:mt-0">
                            <button
                              onClick={() =>
                                handleClaimDecision(claim._id, true)
                              }
                              className="px-4 py-2 bg-green-700 text-white rounded-md flex items-center"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleClaimDecision(claim._id, false)
                              }
                              className="px-4 py-2 bg-red-700 text-white rounded-md flex items-center"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </div>
                          <Link
                            href={`/item/${claim.item._id}`}
                            className="mt-2 px-2 py-1 text-sm text-center text-gray-300 bg-[#2A2A2A] rounded-md hover:bg-[#333333]"
                          >
                            View Item Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Item Matching Tab Content */}
          <TabsContent value="matches">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Potential Item Matches</h2>
                <Button
                  variant="outline"
                  onClick={fetchPotentialMatches}
                  className="text-sm"
                >
                  Refresh Matches
                </Button>
              </div>

              {potentialMatches.length === 0 ? (
                <div className="bg-[#1E1E1E] p-6 rounded-lg">
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">
                      No potential matches found
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Lost items and found items don't have strong matching
                      characteristics. Try adding more detailed descriptions to
                      items for better matching.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {potentialMatches.map((match) => (
                    <Card
                      key={match.id}
                      className="bg-[#1E1E1E] border-[#333333]"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg text-[#FFD166]">
                            Potential Match (Score: {match.score})
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="bg-blue-900/30 text-blue-200 border-blue-800"
                          >
                            {match.score >= 6
                              ? "Strong Match"
                              : match.score >= 4
                                ? "Good Match"
                                : "Possible Match"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Lost Item */}
                          <div className="bg-[#2A2A2A] p-4 rounded-md">
                            <div className="flex items-center mb-3">
                              <div className="h-10 w-10 rounded bg-red-900/30 flex items-center justify-center mr-3">
                                <AlertCircle className="h-5 w-5 text-red-200" />
                              </div>
                              <div>
                                <h3 className="font-medium">Lost Item</h3>
                                <p className="text-sm text-gray-400">
                                  Reported on{" "}
                                  {new Date(
                                    match.lostItem.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <h4 className="font-bold mb-1">
                              {match.lostItem.itemName}
                            </h4>
                            <p className="text-sm mb-2">
                              {match.lostItem.description}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                              <div>
                                <span className="text-gray-400">Category:</span>{" "}
                                {match.lostItem.category}
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Lost Date:
                                </span>{" "}
                                {new Date(
                                  match.lostItem.lostDate
                                ).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="text-gray-400">Location:</span>{" "}
                                {match.lostItem.lostLocation}
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Reported By:
                                </span>{" "}
                                {match.lostItem.reportedBy?.name || "Anonymous"}
                              </div>
                            </div>
                          </div>

                          {/* Found Item */}
                          <div className="bg-[#2A2A2A] p-4 rounded-md">
                            <div className="flex items-center mb-3">
                              <div className="h-10 w-10 rounded bg-green-900/30 flex items-center justify-center mr-3">
                                <Info className="h-5 w-5 text-green-200" />
                              </div>
                              <div>
                                <h3 className="font-medium">Found Item</h3>
                                <p className="text-sm text-gray-400">
                                  Reported on{" "}
                                  {new Date(
                                    match.foundItem.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <h4 className="font-bold mb-1">
                              {match.foundItem.itemName}
                            </h4>
                            <p className="text-sm mb-2">
                              {match.foundItem.description}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                              <div>
                                <span className="text-gray-400">Category:</span>{" "}
                                {match.foundItem.category}
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Found Date:
                                </span>{" "}
                                {new Date(
                                  match.foundItem.foundDate
                                ).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="text-gray-400">Location:</span>{" "}
                                {match.foundItem.foundLocation}
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Reported By:
                                </span>{" "}
                                {match.foundItem.reportedBy?.name ||
                                  "Anonymous"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-3">
                          <Link
                            href={`/item/${match.foundItem._id}`}
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            View Found Item{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                          <Link
                            href={`/lost-items/${match.lostItem._id}`}
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            View Lost Item{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                          <Button
                            onClick={() =>
                              createItemMatch(
                                match.lostItem._id,
                                match.foundItem._id
                              )
                            }
                            className="bg-[#FFD166] text-black hover:bg-[#FFD166]/90"
                          >
                            Confirm Match & Notify Owner
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab Content */}
          <TabsContent value="notifications">
            <div className="bg-[#1E1E1E] p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Send Notification</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full"
                  placeholder="Notification about lost/found items"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Email Body
                </label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="w-full"
                  placeholder="Write your email message here..."
                ></Textarea>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Include Items</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Select items to include in the notification or leave empty for
                  a general announcement
                </p>

                <div className="bg-[#2A2A2A] max-h-60 overflow-y-auto rounded-md p-2">
                  {items.length === 0 ? (
                    <p className="text-gray-400 text-center p-4">
                      No items available
                    </p>
                  ) : (
                    items
                      .filter(
                        (item) => item.isVerified && item.status === "found"
                      )
                      .map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center py-2 border-b border-[#333333] last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id as string)}
                            onChange={() =>
                              toggleItemSelection(item._id as string)
                            }
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-xs text-gray-400">
                              {item.category} • Found on{" "}
                              {new Date(item.foundDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={sendNotificationEmail}
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-[#FFD166] text-black rounded-md font-medium hover:bg-opacity-90 transition"
                >
                  {isSendingEmail ? "Sending..." : "Send Notification"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1E1E1E] rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#FFD166]">
                Send Mass Notification
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                  placeholder="Notification about lost items"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Email Body
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
                  placeholder="Write your email message here..."
                ></textarea>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400">
                  {selectedItems.length > 0
                    ? `Sending notification about ${selectedItems.length} selected items`
                    : "Sending a general notification (no specific items selected)"}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotificationEmail}
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-[#FFD166] text-black rounded-md font-medium hover:bg-opacity-90 transition"
                >
                  {isSendingEmail ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

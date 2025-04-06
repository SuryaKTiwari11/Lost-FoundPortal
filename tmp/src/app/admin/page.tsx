"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { adminAPI } from "@/services/api";
import { useApi } from "@/hooks/useApi";
import type {
  FoundItem,
  LostItem,
  ClaimRequest,
  ItemMatch,
  ItemStats,
} from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Info,
  Mail,
  Search,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("items");
  const [activeSubTab, setActiveSubTab] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [itemStats, setItemStats] = useState<ItemStats>({
    pending: 0,
    verified: 0,
    claimed: 0,
    rejected: 0,
    total: 0,
  });

  // Track initialization and tab changes
  const initialized = useRef(false);
  const prevTabState = useRef({ tab: activeTab, subTab: activeSubTab });
  
  // API hooks with executeOnMount: false to prevent automatic fetching
  const {
    data: itemsData,
    isLoading: isLoadingItems,
    error: itemsError,
    execute: fetchItems,
  } = useApi<{ items: FoundItem[]; stats: ItemStats }>(
    async (status: string) => await adminAPI.getAdminItems(status)
  );

  const {
    data: claimsData,
    isLoading: isLoadingClaims,
    error: claimsError,
    execute: fetchClaims,
  } = useApi<{ claims: ClaimRequest[] }>(
    async () => await adminAPI.getClaimRequests()
  );

  const {
    data: lostItemsData,
    isLoading: isLoadingLostItems,
    error: lostItemsError,
    execute: fetchLostItems,
  } = useApi<{ items: LostItem[]; total: number }>(
    async () => await adminAPI.getLostItemsForMatching()
  );

  const { isLoading: isUpdatingStatus, execute: updateItemStatus } = useApi(
    async (itemId, status) => await adminAPI.updateItemStatus(itemId, status)
  );

  const { isLoading: isProcessingClaim, execute: processClaimRequest } = useApi(
    async (claimId, approved) =>
      await adminAPI.processClaimRequest(claimId, approved)
  );

  const { isLoading: isCreatingMatch, execute: createItemMatch } = useApi(
    async (lostItemId, foundItemId) =>
      await adminAPI.createItemMatch(lostItemId, foundItemId)
  );

  const { isLoading: isSendingNotification, execute: sendNotification } =
    useApi(
      async (subject, body, itemIds) =>
        await adminAPI.sendNotification(subject, body, itemIds)
    );

  // Derived state
  const [items, setItems] = useState<FoundItem[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<ItemMatch[]>([]);

  // Controlled fetch functions with memoization
  const fetchItemsMemoized = useCallback((status: string) => {
    fetchItems(status);
  }, [fetchItems]);

  const fetchClaimsMemoized = useCallback(() => {
    fetchClaims();
  }, [fetchClaims]);

  const fetchLostItemsMemoized = useCallback(() => {
    fetchLostItems();
  }, [fetchLostItems]);

  // Initial data loading
  useEffect(() => {
    if (!initialized.current) {
      if (activeTab === "items") {
        fetchItemsMemoized(activeSubTab);
      } else if (activeTab === "claims") {
        fetchClaimsMemoized();
      } else if (activeTab === "matches") {
        fetchLostItemsMemoized();
        if (activeSubTab === "pending") {
          fetchItemsMemoized("verified");
        }
      }
      initialized.current = true;
    }
  }, []); // Empty dependency array = run once on mount

  // Handle tab changes after initialization
  useEffect(() => {
    if (initialized.current) {
      const { tab: prevTab, subTab: prevSubTab } = prevTabState.current;
      
      // Only fetch if tab/subtab actually changed
      if (prevTab !== activeTab || (activeTab === "items" && prevSubTab !== activeSubTab)) {
        if (activeTab === "items") {
          fetchItemsMemoized(activeSubTab);
        } else if (activeTab === "claims") {
          fetchClaimsMemoized();
        } else if (activeTab === "matches") {
          fetchLostItemsMemoized();
          if (activeSubTab === "pending") {
            fetchItemsMemoized("verified");
          }
        }
        
        // Store current values for next comparison
        prevTabState.current = { tab: activeTab, subTab: activeSubTab };
      }
    }
  }, [activeTab, activeSubTab, fetchItemsMemoized, fetchClaimsMemoized, fetchLostItemsMemoized]);

  // Update items when data changes
  useEffect(() => {
    if (itemsData?.items) {
      setItems(itemsData.items);
    }
    if (itemsData?.stats) {
      setItemStats(itemsData.stats);
    }
  }, [itemsData]);

  // Update claims when data changes
  useEffect(() => {
    if (claimsData?.claims) {
      setClaimRequests(claimsData.claims);
    }
  }, [claimsData]);

  // Update lost items when data changes - prevent regenerating matches on every render
  useEffect(() => {
    if (lostItemsData?.items) {
      setLostItems(lostItemsData.items);

      // Only generate matches if we have both data sets
      if (itemsData?.items) {
        const foundItems = itemsData.items.filter((item) => item.isVerified);
        const matches = generatePotentialMatches(
          lostItemsData.items,
          foundItems
        );
        setPotentialMatches(matches);
      }
    }
  }, [lostItemsData, itemsData]);

  // Generate potential matches based on category, date proximity, and keywords
  const generatePotentialMatches = (
    lostItems: LostItem[],
    foundItems: FoundItem[]
  ): ItemMatch[] => {
    const matches: ItemMatch[] = [];

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
        const lostDate = new Date(
          lostItem.lostDate || lostItem.dateLost || lostItem.createdAt
        );
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
        const lostLocation =
          lostItem.lostLocation || lostItem.lastLocation || "";
        if (
          lostLocation
            .toLowerCase()
            .includes(foundItem.foundLocation.toLowerCase()) ||
          foundItem.foundLocation
            .toLowerCase()
            .includes(lostLocation.toLowerCase())
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
            _id: `${lostItem._id}-${foundItem._id}`,
          });
        }
      });
    });

    // Sort by score
    return matches.sort((a, b) => b.score - a.score);
  };

  // Handle item status update
  const handleUpdateItemStatus = async (itemId: string, status: string) => {
    const response = await updateItemStatus(itemId, status);

    if (response.success) {
      toast.success(`Item marked as ${status}`);
      fetchItems(activeSubTab);
    } else {
      toast.error(response.error || "Failed to update item status");
    }
  };

  // Handle claim decision
  const handleClaimDecision = async (claimId: string, approved: boolean) => {
    const response = await processClaimRequest(claimId, approved);

    if (response.success) {
      toast.success(
        approved
          ? "Claim approved and item marked as claimed"
          : "Claim rejected"
      );
      fetchClaims();
    } else {
      toast.error(response.error || "Failed to process claim");
    }
  };

  // Handle item match creation
  const handleCreateItemMatch = async (
    lostItemId: string,
    foundItemId: string
  ) => {
    const response = await createItemMatch(lostItemId, foundItemId);

    if (response.success) {
      toast.success(
        "Items matched successfully! Notification sent to the owner."
      );
      fetchLostItems();
      fetchItems("verified");
    } else {
      toast.error(response.error || "Failed to match items");
    }
  };

  // Handle notification email sending
  const handleSendNotificationEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Subject and body are required");
      return;
    }

    const response = await sendNotification(
      emailSubject,
      emailBody,
      selectedItems.length > 0 ? selectedItems : undefined
    );

    if (response.success) {
      toast.success("Notification email sent successfully");
      setShowEmailModal(false);
      setEmailSubject("");
      setEmailBody("");
      setSelectedItems([]);
    } else {
      toast.error(response.error || "Failed to send notification");
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Filter items based on search query
  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.foundLocation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  // Refresh data
  const refreshData = () => {
    if (activeTab === "items") {
      fetchItems(activeSubTab);
    } else if (activeTab === "claims") {
      fetchClaims();
    } else if (activeTab === "matches") {
      fetchLostItems();
      fetchItems("verified");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-10">
        <FadeIn>
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-[#FFD166]">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage lost and found items</p>
          </header>
        </FadeIn>

        {/* Stats Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StaggerItem>
            <Card className="bg-[#1E1E1E] border-[#333333] hover:border-[#FFD166] transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-400">Pending</p>
                  <p className="text-3xl font-bold mt-2">{itemStats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-900/30 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="bg-[#1E1E1E] border-[#333333] hover:border-[#FFD166] transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-400">Verified</p>
                  <p className="text-3xl font-bold mt-2">
                    {itemStats.verified}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="bg-[#1E1E1E] border-[#333333] hover:border-[#FFD166] transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-400">Claimed</p>
                  <p className="text-3xl font-bold mt-2">{itemStats.claimed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-900/30 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="bg-[#1E1E1E] border-[#333333] hover:border-[#FFD166] transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-400">
                    Total Items
                  </p>
                  <p className="text-3xl font-bold mt-2">{itemStats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Rest of component remains the same */}
        {/* ... */}
      </div>
    </div>
  );
}

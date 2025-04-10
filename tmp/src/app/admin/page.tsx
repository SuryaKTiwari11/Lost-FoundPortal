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
  CardFooter,
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
  BarChart3,
  Users,
  Settings,
  Upload,
  Image as ImageIcon,
  Filter,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import admin components
import DashboardAnalytics from "@/components/admin/DashboardAnalytics";
import BatchVerification from "@/components/admin/BatchVerification";
import ItemComparisonView from "@/components/admin/ItemComparisonView";
import VerificationSteps from "@/components/admin/VerificationSteps";
import EnhancedEmailTemplates from "@/components/admin/EnhancedEmailTemplates";
import EmailTemplates from "@/components/admin/EmailTemplates";
import ImageGallery from "@/components/admin/ImageGallery";

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
  const [selectedItemForVerification, setSelectedItemForVerification] =
    useState<string | null>(null);
  const [selectedItemDetails, setSelectedItemDetails] =
    useState<FoundItem | null>(null);
  const [selectedItemForComparison, setSelectedItemForComparison] = useState<
    string | null
  >(null);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);

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
  const fetchItemsMemoized = useCallback(
    (status: string) => {
      fetchItems(status);
    },
    [fetchItems]
  );

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
      if (
        prevTab !== activeTab ||
        (activeTab === "items" && prevSubTab !== activeSubTab)
      ) {
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
  }, [
    activeTab,
    activeSubTab,
    fetchItemsMemoized,
    fetchClaimsMemoized,
    fetchLostItemsMemoized,
  ]);

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

  // Handle item selection for verification
  const handleSelectItemForVerification = (itemId: string) => {
    const selectedItem = items.find((item) => item._id === itemId);
    if (selectedItem) {
      setSelectedItemDetails(selectedItem);
      setSelectedItemForVerification(itemId);
    }
  };

  // Handle item verification update
  const handleVerificationUpdated = async (
    verificationSteps: FoundItem["verificationSteps"],
    isVerified: boolean
  ) => {
    // Update local item with new verification data
    if (selectedItemDetails && selectedItemForVerification) {
      const updatedItem = {
        ...selectedItemDetails,
        verificationSteps,
        isVerified,
      };
      setSelectedItemDetails(updatedItem);

      // Refresh the items list to show updated status
      if (activeTab === "items") {
        fetchItemsMemoized(activeSubTab);
      }
    }
  };

  // Handle batch verification completion
  const handleBatchVerificationCompleted = async () => {
    toast.success("Batch verification completed successfully");
    // Refresh the items list
    if (activeTab === "items") {
      fetchItemsMemoized(activeSubTab);
    }
  };

  // Handle item selection for comparison
  const handleCompareItem = (matchId: string) => {
    setSelectedItemForComparison(matchId);
    setShowComparisonDialog(true);
  };

  // Handle image upload completion
  const handleImageUploadComplete = () => {
    toast.success("Images uploaded successfully");
    fetchItemsMemoized(activeSubTab);
  };

  // Handle email template selection
  const handleSelectEmailTemplate = (template: any) => {
    setEmailSubject(template.subject);
    setEmailBody(template.body);
    setShowEmailModal(true);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              className="hidden sm:flex border-[#333333] text-gray-300 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
            <StaggerItem>
              <Card className="bg-[#1A1A1A] border-[#333333] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Pending Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {itemStats.pending}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Waiting for verification
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="bg-[#1A1A1A] border-[#333333] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Verified Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {itemStats.verified}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ready for claiming
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="bg-[#1A1A1A] border-[#333333] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Claimed Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {itemStats.claimed}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Successfully returned
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="bg-[#1A1A1A] border-[#333333] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Total Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {itemStats.total}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All system items</p>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>

        <div className="rounded-lg bg-[#1A1A1A] p-1 border border-[#333333] shadow-sm mb-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-5 h-11 p-1 w-full rounded bg-[#242424]">
              <TabsTrigger
                value="items"
                className="flex items-center text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
              >
                <Tag className="h-4 w-4 mr-2" /> Items
              </TabsTrigger>
              <TabsTrigger
                value="claims"
                className="flex items-center text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
              >
                <Check className="h-4 w-4 mr-2" /> Claims
              </TabsTrigger>
              <TabsTrigger
                value="matches"
                className="flex items-center text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
              >
                <Info className="h-4 w-4 mr-2" /> Matches
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics
              </TabsTrigger>
              <TabsTrigger
                value="tools"
                className="flex items-center text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" /> Admin Tools
              </TabsTrigger>
            </TabsList>

            <div className="p-4 pt-2">
              {/* Items Tab */}
              <TabsContent value="items" className="space-y-5 mt-0">
                <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
                  <Tabs
                    value={activeSubTab}
                    onValueChange={setActiveSubTab}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-[#242424]">
                      <TabsTrigger
                        value="pending"
                        className="text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
                      >
                        <Clock className="h-4 w-4 mr-2" /> Pending
                      </TabsTrigger>
                      <TabsTrigger
                        value="verified"
                        className="text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Verified
                      </TabsTrigger>
                      <TabsTrigger
                        value="claimed"
                        className="text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
                      >
                        <Check className="h-4 w-4 mr-2" /> Claimed
                      </TabsTrigger>
                      <TabsTrigger
                        value="rejected"
                        className="text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
                      >
                        <X className="h-4 w-4 mr-2" /> Rejected
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex space-x-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search items..."
                        className="pl-8 bg-[#2A2A2A] border-[#333333] text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowEmailModal(true)}
                      disabled={activeSubTab === "pending"}
                      className="border-[#333333] text-gray-300 hover:text-white"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>

                {isLoadingItems ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="bg-[#1A1A1A] rounded-lg border border-[#333333] shadow-sm p-10 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <AlertCircle className="h-10 w-10 text-gray-500" />
                      <h3 className="text-lg font-semibold text-white">
                        No items found
                      </h3>
                      <p className="text-sm text-gray-400 max-w-md mx-auto">
                        {searchQuery
                          ? "Try adjusting your search query"
                          : `There are no ${activeSubTab} items`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-[#333333] overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#242424] hover:bg-[#2A2A2A] border-[#333333]">
                          <TableHead className="w-12 text-gray-400">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-[#333333]"
                              checked={
                                selectedItems.length === filteredItems.length &&
                                filteredItems.length > 0
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems(
                                    filteredItems.map((item) => item._id)
                                  );
                                } else {
                                  setSelectedItems([]);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead className="text-gray-400">
                            Item Name
                          </TableHead>
                          <TableHead className="text-gray-400">
                            Category
                          </TableHead>
                          <TableHead className="text-gray-400">
                            Location
                          </TableHead>
                          <TableHead className="text-gray-400">
                            Date Found
                          </TableHead>
                          <TableHead className="text-gray-400">
                            Status
                          </TableHead>
                          <TableHead className="text-right text-gray-400">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow
                            key={item._id}
                            className="border-[#333333] hover:bg-[#242424]"
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-[#333333]"
                                checked={selectedItems.includes(item._id)}
                                onChange={() => toggleItemSelection(item._id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-white">
                              <div className="flex items-center space-x-2">
                                {item.images && item.images.length > 0 ? (
                                  <div className="h-8 w-8 rounded-md overflow-hidden relative">
                                    <Image
                                      src={item.images[0]}
                                      alt={item.itemName}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-8 w-8 rounded-md bg-[#242424] flex items-center justify-center">
                                    <Tag className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                                <span>{item.itemName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {item.category}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {item.foundLocation}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(item.foundDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "pending"
                                    ? "outline"
                                    : item.status === "verified"
                                      ? "default"
                                      : item.status === "claimed"
                                        ? "success"
                                        : "destructive"
                                }
                                className={
                                  item.status === "verified"
                                    ? "bg-green-600/20 text-green-400 border-green-500/30"
                                    : item.status === "claimed"
                                      ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                                      : item.status === "pending"
                                        ? "bg-[#333333] text-gray-300 border-[#444444]"
                                        : "bg-red-900/30 text-red-400 border-red-700/30"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {activeSubTab === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleSelectItemForVerification(item._id)
                                    }
                                    className="border-green-700/30 text-green-400 hover:text-green-300 hover:bg-green-600/10 hover:border-green-700/50"
                                  >
                                    Verify
                                  </Button>
                                )}
                                {activeSubTab === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateItemStatus(
                                        item._id,
                                        "rejected"
                                      )
                                    }
                                    className="border-red-700/30 text-red-400 hover:text-red-300 hover:bg-red-600/10 hover:border-red-700/50"
                                  >
                                    Reject
                                  </Button>
                                )}
                                {activeSubTab === "verified" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateItemStatus(
                                        item._id,
                                        "pending"
                                      )
                                    }
                                    className="border-[#333333] text-gray-300"
                                  >
                                    Unpublish
                                  </Button>
                                )}
                                <Link href={`/found-items/${item._id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-[#242424] text-gray-300"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-5 mt-0">
                <Card className="bg-[#1A1A1A] border-[#333333] shadow-sm overflow-hidden">
                  <CardHeader className="bg-[#1A1A1A] border-b border-[#333333]">
                    <CardTitle className="text-white">
                      Dashboard Analytics
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      View trends and statistics about lost and found items
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <DashboardAnalytics />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other tabs content... */}

              {/* Admin Tools Tab */}
              <TabsContent value="tools" className="space-y-6 mt-0">
                <Tabs defaultValue="batch-verification" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6 bg-[#242424]">
                    <TabsTrigger
                      value="batch-verification"
                      className="text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
                    >
                      Batch Verification
                    </TabsTrigger>
                    <TabsTrigger
                      value="email-templates"
                      className="text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
                    >
                      Email Templates
                    </TabsTrigger>
                    <TabsTrigger
                      value="image-gallery"
                      className="text-gray-300 data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white"
                    >
                      Image Gallery
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="batch-verification"
                    className="space-y-5 mt-0"
                  >
                    <Card className="bg-[#1A1A1A] border-[#333333] shadow-sm">
                      <CardHeader className="border-b border-[#333333]">
                        <CardTitle className="text-white">
                          Batch Verification Tool
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Efficiently verify multiple items at once using AI
                          assistance
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <BatchVerification
                          onItemsVerified={handleBatchVerificationCompleted}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Other tool tab contents... */}
                </Tabs>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Verification Dialog */}
        {selectedItemForVerification && selectedItemDetails && (
          <Dialog
            open={!!selectedItemForVerification}
            onOpenChange={(open) => {
              if (!open) setSelectedItemForVerification(null);
            }}
          >
            <DialogContent className="sm:max-w-4xl bg-[#1A1A1A] border-[#333333] text-white">
              <DialogHeader>
                <DialogTitle>Item Verification</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Complete the verification steps for{" "}
                  {selectedItemDetails.itemName}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <VerificationSteps
                  itemId={selectedItemForVerification}
                  verificationSteps={selectedItemDetails.verificationSteps}
                  isVerified={selectedItemDetails.isVerified}
                  onVerificationUpdated={handleVerificationUpdated}
                />
              </div>

              <DialogFooter>
                <Button onClick={() => setSelectedItemForVerification(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Other dialogs... */}
      </div>
    </div>
  );
}

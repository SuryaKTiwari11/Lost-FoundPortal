"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  MoreHorizontal,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { adminAPI } from "@/services/api";
import Link from "next/link";

type ItemStatus = "pending" | "verified" | "rejected";

interface Item {
  _id: string;
  id?: string;
  itemName: string;
  category: string;
  status: ItemStatus;
  type: "lost" | "found";
  reportDate: string;
  ownerName?: string;
  finderName?: string;
  location?: string;
  description?: string;
}

export default function BatchVerification() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Apply filters when tab changes or search query changes
  useEffect(() => {
    applyFilters();
  }, [activeTab, searchQuery, items]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getPendingVerifications();
      if (response.success) {
        setItems(response.data);
        setFilteredItems(response.data);
      } else {
        toast.error(response.error || "Failed to load items for verification");
      }
    } catch (error) {
      console.error("Error fetching verification items:", error);
      toast.error("An error occurred while loading verification items");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => {
        if (activeTab === "lost") return item.type === "lost";
        if (activeTab === "found") return item.type === "found";
        if (activeTab === "pending") return item.status === "pending";
        if (activeTab === "verified") return item.status === "verified";
        if (activeTab === "rejected") return item.status === "rejected";
        return true;
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.ownerName && item.ownerName.toLowerCase().includes(query)) ||
          (item.finderName && item.finderName.toLowerCase().includes(query)) ||
          (item.description && item.description.toLowerCase().includes(query))
      );
    }

    setFilteredItems(filtered);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedItems([]);
    setIsSelectAll(false);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item._id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  const handleBatchApprove = async () => {
    if (selectedItems.length === 0) {
      toast.warning("Please select items to approve");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await adminAPI.batchVerifyItems(
        selectedItems,
        "verified"
      );
      if (response.success) {
        toast.success(`Successfully verified ${selectedItems.length} items`);

        // Update local state
        const updatedItems = items.map((item) => {
          if (selectedItems.includes(item._id)) {
            return { ...item, status: "verified" as ItemStatus };
          }
          return item;
        });
        setItems(updatedItems);
        setSelectedItems([]);
        setIsSelectAll(false);
      } else {
        toast.error(response.error || "Failed to verify items");
      }
    } catch (error) {
      console.error("Error verifying items:", error);
      toast.error("An error occurred while verifying items");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchReject = async () => {
    if (selectedItems.length === 0) {
      toast.warning("Please select items to reject");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await adminAPI.batchVerifyItems(
        selectedItems,
        "rejected"
      );
      if (response.success) {
        toast.success(`Successfully rejected ${selectedItems.length} items`);

        // Update local state
        const updatedItems = items.map((item) => {
          if (selectedItems.includes(item._id)) {
            return { ...item, status: "rejected" as ItemStatus };
          }
          return item;
        });
        setItems(updatedItems);
        setSelectedItems([]);
        setIsSelectAll(false);
      } else {
        toast.error(response.error || "Failed to reject items");
      }
    } catch (error) {
      console.error("Error rejecting items:", error);
      toast.error("An error occurred while rejecting items");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyItem = async (itemId: string, status: ItemStatus) => {
    try {
      const response = await adminAPI.verifyItem(itemId, status);
      if (response.success) {
        toast.success(
          `Item ${status === "verified" ? "verified" : "rejected"} successfully`
        );

        // Update local state
        const updatedItems = items.map((item) => {
          if (item._id === itemId) {
            return { ...item, status };
          }
          return item;
        });
        setItems(updatedItems);
      } else {
        toast.error(response.error || `Failed to ${status} item`);
      }
    } catch (error) {
      console.error(`Error ${status} item:`, error);
      toast.error(
        `An error occurred while ${status === "verified" ? "verifying" : "rejecting"} the item`
      );
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  // Helper to get status badge
  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-700 hover:bg-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-700 hover:bg-red-800">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-700 hover:bg-yellow-800">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-700 hover:bg-gray-800">
            <AlertCircle className="h-3 w-3 mr-1" /> Unknown
          </Badge>
        );
    }
  };

  // Helper to get type badge
  const getTypeBadge = (type: "lost" | "found") => {
    switch (type) {
      case "lost":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            Lost
          </Badge>
        );
      case "found":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Found
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-[#1E1E1E] border-[#333333] shadow-lg overflow-hidden">
      <CardHeader className="bg-[#242424] border-b border-[#333333]">
        <div className="flex justify-between items-center">
          <CardTitle>Batch Verification</CardTitle>
          <Button onClick={fetchItems} variant="outline" disabled={isLoading}>
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          Verify or reject multiple items in batch
        </CardDescription>
      </CardHeader>

      <div className="p-4 border-b border-[#333333] bg-[#242424]">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-8 bg-[#1E1E1E] border-[#333333]"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-green-800 text-green-500 hover:text-green-400 hover:bg-green-900/20"
              onClick={handleBatchApprove}
              disabled={selectedItems.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Approve Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-800 text-red-500 hover:text-red-400 hover:bg-red-900/20"
              onClick={handleBatchReject}
              disabled={selectedItems.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Reject Selected
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="border-b border-[#333333] p-2 bg-[#242424]">
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
            <TabsTrigger value="found">Found</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-0">
          <TabsContent value={activeTab} className="m-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FileText className="h-12 w-12 mb-4 opacity-30" />
                <h3 className="text-xl font-medium mb-2">No items found</h3>
                <p className="text-sm text-center">
                  {searchQuery
                    ? "No items match your search criteria"
                    : `No items available in ${activeTab} category`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#242424] border-[#333333]">
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={isSelectAll}
                          onCheckedChange={handleSelectAll}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </TableHead>
                      <TableHead className="w-[180px]">Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow
                        key={item._id}
                        className="hover:bg-[#242424] border-[#333333]"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item._id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(item._id, checked as boolean)
                            }
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            href={`/${item.type === "lost" ? "lost" : "found"}-items/${item._id}`}
                            className="hover:underline"
                          >
                            {item.itemName}
                          </Link>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {item.type === "lost"
                            ? item.ownerName
                            : item.finderName || "Anonymous"}
                        </TableCell>
                        <TableCell>{formatDate(item.reportDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {item.status !== "verified" && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="border-green-800 text-green-500 hover:text-green-400 hover:bg-green-900/20"
                                onClick={() =>
                                  handleVerifyItem(item._id, "verified")
                                }
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {item.status !== "rejected" && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="border-red-800 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                                onClick={() =>
                                  handleVerifyItem(item._id, "rejected")
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-[#242424] border-[#333333]"
                              >
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#333333]" />
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() =>
                                    window.open(
                                      `/${item.type === "lost" ? "lost" : "found"}-items/${item._id}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="p-4 border-t border-[#333333] bg-[#242424]">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-400">
            {filteredItems.length} items found
            {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
          </div>
          {selectedItems.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-500 border-green-800"
                onClick={handleBatchApprove}
                disabled={isProcessing}
              >
                <Check className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-800"
                onClick={handleBatchReject}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

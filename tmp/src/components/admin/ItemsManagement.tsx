"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/services/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, CheckCircle, XCircle, Search, Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ItemsManagementProps {
  initialStatus?: string;
}

export default function ItemsManagement({
  initialStatus = "pending",
}: ItemsManagementProps) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>(""); // Added type filter for lost/found
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    claimed: 0,
    total: 0,
  });

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (searchQuery) params.append("query", searchQuery);
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      console.log("Fetching items with params:", params.toString());
      const response = await adminAPI.getItems(params.toString());

      if (response.success) {
        console.log("Items received:", response.items);
        setItems(response.items || []);
        setPagination(
          response.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            pages: 1,
          }
        );
        if (response.stats) {
          setStats(response.stats);
        }
      } else {
        toast.error(response.error || "Failed to load items");
        console.error("Failed to load items:", response.error);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("An error occurred while loading items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter, categoryFilter, typeFilter, currentPage]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to page 1 when search changes
      } else {
        fetchItems(); // Fetch with current search term
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleVerify = async (itemId: string, itemType: string) => {
    try {
      const response = await adminAPI.updateItemStatus(itemId, "verified", itemType);
      if (response.success) {
        toast.success("Item verified successfully");
        fetchItems();
      } else {
        toast.error(response.error || "Failed to verify item");
      }
    } catch (error) {
      console.error("Error verifying item:", error);
      toast.error("An error occurred while verifying the item");
    }
  };

  const handleReject = async (itemId: string, itemType: string) => {
    try {
      const response = await adminAPI.updateItemStatus(itemId, "rejected", itemType);
      if (response.success) {
        toast.success("Item rejected");
        fetchItems();
      } else {
        toast.error(response.error || "Failed to reject item");
      }
    } catch (error) {
      console.error("Error rejecting item:", error);
      toast.error("An error occurred while rejecting the item");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      case "claimed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Claimed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Items Management</CardTitle>
          <CardDescription>
            View, verify, and manage lost and found items that have been reported.
          </CardDescription>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {/* Status counts */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </div>
                <div className="text-xl font-bold">{stats.total}</div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">
                  {Math.round((stats.total / stats.total) * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  Pending
                </div>
                <div className="text-xl font-bold">{stats.pending}</div>
              </div>
              <div className="h-8 w-8 bg-yellow-200 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-sm">
                  {stats.total
                    ? Math.round((stats.pending / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              <div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Verified
                </div>
                <div className="text-xl font-bold">{stats.verified}</div>
              </div>
              <div className="h-8 w-8 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-800 text-sm">
                  {stats.total
                    ? Math.round((stats.verified / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Rejected
                </div>
                <div className="text-xl font-bold">{stats.rejected}</div>
              </div>
              <div className="h-8 w-8 bg-red-200 rounded-full flex items-center justify-center">
                <span className="text-red-800 text-sm">
                  {stats.total
                    ? Math.round((stats.rejected / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Category:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Type:</span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 w-full"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2 text-lg font-semibold">No items found</p>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date Found</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.imageURL && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-8 w-8"
                                    onClick={() =>
                                      setSelectedImage(item.imageURL)
                                    }
                                  >
                                    <Image className="h-5 w-5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{item.itemName}</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex justify-center">
                                    <img
                                      src={item.imageURL}
                                      alt={item.itemName}
                                      className="max-w-full max-h-[500px] object-contain rounded-md"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            {item.itemName}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          {item.lastLocation || item.lastSeenLocation || item.foundLocation || item.locationFound}
                        </TableCell>
                        <TableCell>
                          {formatDate(
                            item.dateLost || item.lastSeenDate || item.dateFound || item.foundDate || item.createdAt
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {item.status === "pending" && (
                              <>
                                <Button
                                  onClick={() => handleVerify(item._id, item.type || (item.foundLocation ? "found" : "lost"))}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 flex items-center gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" /> Verify
                                </Button>
                                <Button
                                  onClick={() => handleReject(item._id, item.type || (item.foundLocation ? "found" : "lost"))}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10"
                                >
                                  <XCircle className="h-4 w-4" /> Reject
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() =>
                                window.open(
                                  `/${item.type || (item.foundLocation ? "found" : "lost")}-items/${item._id}`,
                                  "_blank"
                                )
                              }
                              size="sm"
                              variant="ghost"
                              className="h-8"
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, pagination.pages) }).map(
                    (_, index) => {
                      // Logic for showing pages around current page
                      let pageNum = currentPage;
                      if (pagination.pages <= 5) {
                        pageNum = index + 1;
                      } else if (currentPage <= 3) {
                        pageNum = index + 1;
                      } else if (currentPage >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }

                      return (
                        <PaginationItem key={index}>
                          <PaginationLink
                            isActive={currentPage === pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(pagination.pages, prev + 1)
                        )
                      }
                      className={
                        currentPage === pagination.pages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

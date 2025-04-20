import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { adminAPI } from "@/services/api";

export type ItemStatus = "pending" | "verified" | "rejected";

export interface Item {
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

export function useBatchVerification() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch items on initial load
  const fetchItems = useCallback(async () => {
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
  }, []);

  // Apply filters when tab changes or search query changes
  const applyFilters = useCallback(() => {
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
  }, [activeTab, searchQuery, items]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedItems([]);
    setIsSelectAll(false);
  };

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // Handle select all items
  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item._id));
    }
    setIsSelectAll(!isSelectAll);
  };

  // Handle select individual item
  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  // Handle batch approve
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

  // Handle batch reject
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

  // Handle verify single item
  const handleVerifyItem = async (itemId: string, status: ItemStatus) => {
    try {
      const response = await adminAPI.updateItemStatus(
        itemId,
        // Find item type in the items array
        items.find((item) => item._id === itemId)?.type || "lost",
        status
      );

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

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [activeTab, searchQuery, items, applyFilters]);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    filteredItems,
    selectedItems,
    isSelectAll,
    isLoading,
    isProcessing,
    activeTab,
    searchQuery,
    fetchItems,
    handleTabChange,
    handleSearch,
    handleSelectAll,
    handleSelectItem,
    handleBatchApprove,
    handleBatchReject,
    handleVerifyItem,
  };
}

// Helper functions
export const verificationUtils = {
  // Format date for display
  formatDate: (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  },
};

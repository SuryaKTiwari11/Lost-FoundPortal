import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { searchAPI } from "@/services/api";
import { toast } from "sonner";
import type { LostItemFormData } from "@/types";

export interface SearchFilters {
  category?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  location?: string;
}

export function useSearchLostItems() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<LostItemFormData[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Perform search when query or filters change
  useEffect(() => {
    if (debouncedSearchQuery || Object.keys(filters).length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
      setTotalResults(0);
    }
  }, [debouncedSearchQuery, filters, page, pageSize]);

  const performSearch = async () => {
    try {
      setIsSearching(true);

      // Build query params
      const params: Record<string, string> = {
        page: page.toString(),
        limit: pageSize.toString(),
      };

      if (debouncedSearchQuery) {
        params.q = debouncedSearchQuery;
      }

      if (filters.category) {
        params.category = filters.category;
      }

      if (filters.location) {
        params.location = filters.location;
      }

      if (filters.dateRange?.start) {
        params.dateFrom = filters.dateRange.start.toISOString();
      }

      if (filters.dateRange?.end) {
        params.dateTo = filters.dateRange.end.toISOString();
      }

      const response = await searchAPI.searchLostItems(params);

      if (response.success) {
        setSearchResults(response.data as LostItemFormData[]);
        setTotalResults(response.meta?.total || response.data.length);
      } else {
        toast.error(response.error || "Failed to search for lost items");
      }
    } catch (error) {
      console.error("Error searching for lost items:", error);
      toast.error("An error occurred while searching for lost items");
    } finally {
      setIsSearching(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    isSearching,
    searchResults,
    totalResults,
    page,
    setPage,
    pageSize,
    setPageSize,
    performSearch,
  };
}

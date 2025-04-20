"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/shared/SearchBar";
import { SearchFiltersComponent } from "@/components/shared/SearchFilters";
import { SearchResults } from "@/components/shared/SearchResults";
import { useSearchLostItems } from "@/hooks/useSearchLostItems";

export function SearchLostItems() {
  const {
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
  } = useSearchLostItems();

  const [searchPerformed, setSearchPerformed] = useState(false);

  // Set search performed flag when search is done
  useEffect(() => {
    if (searchQuery || Object.keys(filters).length > 0) {
      setSearchPerformed(true);
    }
  }, [searchQuery, filters]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Find Lost Items</h1>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search lost items by name, description, etc."
        />

        <div className="pt-2">
          <SearchFiltersComponent
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
          />
        </div>
      </div>

      <div className="mt-8">
        <SearchResults
          results={searchResults}
          isSearching={isSearching}
          totalResults={totalResults}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          searchPerformed={searchPerformed}
        />
      </div>
    </div>
  );
}

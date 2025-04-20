"use client";

import { LostItem } from "@/model/lostItem.model";
import { FoundItem } from "@/model/foundItem.model";
import ItemCard, { ItemType } from "@/components/shared/items/ItemCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Item = LostItem | FoundItem;

interface ItemsGridProps {
  items: Item[];
  type: ItemType;
  isLoading?: boolean;
  onRefresh?: () => void;
  emptyMessage?: string;
  className?: string;
}

export function ItemsGrid({
  items,
  type,
  isLoading = false,
  onRefresh,
  emptyMessage = "No items found",
  className,
}: ItemsGridProps) {
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div className={className}>
      {/* Header area with actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {type === "lost" ? "Lost Items" : "Found Items"}
        </h2>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-[#333] hover:bg-[#333] hover:text-white"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-[#333] hover:bg-[#333] hover:text-white"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Optional filter area */}
      {showFilters && (
        <div className="mb-6 p-4 rounded-lg border border-[#333] bg-[#1A1A1A]">
          <h3 className="text-sm font-medium mb-3">Filter Options</h3>
          {/* Filter controls would go here */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Category
              </label>
              {/* Category filter */}
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Date Range
              </label>
              {/* Date filter */}
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Location
              </label>
              {/* Location filter */}
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[320px] rounded-lg bg-[#1A1A1A] animate-pulse border border-[#333]"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 border border-dashed border-[#333] rounded-lg">
          <p className="text-gray-400 mb-4">{emptyMessage}</p>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-[#333] hover:bg-[#333] hover:text-white"
              onClick={onRefresh}
            >
              Try Again
            </Button>
          )}
        </div>
      )}

      {/* Items grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}

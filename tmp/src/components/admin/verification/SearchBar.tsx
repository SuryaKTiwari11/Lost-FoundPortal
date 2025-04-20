"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearch: (value: string) => void;
  onBatchApprove: () => Promise<void>;
  onBatchReject: () => Promise<void>;
  selectedCount: number;
  isProcessing: boolean;
}

export function SearchBar({
  searchQuery,
  onSearch,
  onBatchApprove,
  onBatchReject,
  selectedCount,
  isProcessing,
}: SearchBarProps) {
  return (
    <div className="p-4 border-b border-[#333333] bg-[#242424]">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8 bg-[#1E1E1E] border-[#333333]"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-green-800 text-green-500 hover:text-green-400 hover:bg-green-900/20"
            onClick={onBatchApprove}
            disabled={selectedCount === 0 || isProcessing}
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
            onClick={onBatchReject}
            disabled={selectedCount === 0 || isProcessing}
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
  );
}

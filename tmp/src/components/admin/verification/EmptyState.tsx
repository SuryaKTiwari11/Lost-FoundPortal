"use client";

import { FileText } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
  activeTab: string;
}

export function EmptyState({ searchQuery, activeTab }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <FileText className="h-12 w-12 mb-4 opacity-30" />
      <h3 className="text-xl font-medium mb-2">No items found</h3>
      <p className="text-sm text-center">
        {searchQuery
          ? "No items match your search criteria"
          : `No items available in ${activeTab} category`}
      </p>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, Loader2 } from "lucide-react";

interface EmptyStateProps {
  isLoading: boolean;
  readOnly?: boolean;
  onUpload: () => void;
}

export function EmptyState({
  isLoading,
  readOnly = false,
  onUpload,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <ImageIcon className="h-16 w-16 text-gray-500 mb-4" />
      <h3 className="text-xl font-medium mb-2">No images available</h3>
      <p className="text-sm text-center text-gray-400 max-w-md mb-6">
        {readOnly
          ? "This item has no images attached to it."
          : "Upload images to help identify this item."}
      </p>
      {!readOnly && (
        <Button onClick={onUpload} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload Images
        </Button>
      )}
    </div>
  );
}

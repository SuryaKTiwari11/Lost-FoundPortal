"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ImagePlus, Grid2X2, ImageIcon } from "lucide-react";
import { useItemImages } from "@/hooks/useItemImages";
import {
  EmptyState,
  ImageGrid,
  ImageCarousel,
  ImagePreviewDialog,
} from "@/components/admin/gallery";

interface ImageGalleryProps {
  itemId: string;
  itemType: "lost" | "found";
  initialImages?: ItemImage[];
  readOnly?: boolean;
  onImagesUpdated?: (images: ItemImage[]) => void;
  showControls?: boolean;
  onUploadComplete?: () => void;
}

// We import ItemImage from the hook so we don't have to define it twice
import { ItemImage } from "@/hooks/useItemImages";

export default function ImageGallery({
  itemId,
  itemType,
  initialImages = [],
  readOnly = false,
  onImagesUpdated,
  showControls = true,
  onUploadComplete,
}: ImageGalleryProps) {
  // View state
  const [viewMode, setViewMode] = useState<"gallery" | "carousel">("gallery");
  const [previewImage, setPreviewImage] = useState<ItemImage | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState<boolean>(false);

  // Use our custom hook for image management
  const {
    images,
    isLoading,
    isUploading,
    fileInputRef,
    handleFileSelect,
    deleteImage,
    setPrimaryImage,
  } = useItemImages({
    itemId,
    itemType,
    initialImages,
    onImagesUpdated,
    onUploadComplete,
  });

  // Handle opening image preview
  const handleOpenImagePreview = (image: ItemImage) => {
    setPreviewImage(image);
    setShowPreviewDialog(true);
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Show loading state
  if (isLoading && !images.length) {
    return (
      <Card className="bg-[#1E1E1E] border-[#333333]">
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Loading images...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1E1E1E] border-[#333333] h-full">
      <CardHeader className="border-b border-[#333333]">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              {images.length
                ? `${images.length} ${images.length === 1 ? "image" : "images"}`
                : "No images available"}
            </CardDescription>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setViewMode(viewMode === "gallery" ? "carousel" : "gallery")
                }
              >
                {viewMode === "gallery" ? (
                  <Grid2X2 className="h-4 w-4" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
              </Button>
              <Button onClick={triggerFileInput} disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {images.length === 0 ? (
          <EmptyState
            isLoading={isUploading}
            readOnly={readOnly}
            onUpload={triggerFileInput}
          />
        ) : viewMode === "gallery" ? (
          <ImageGrid
            images={images}
            readOnly={readOnly}
            showControls={showControls}
            onDeleteImage={deleteImage}
            onSetPrimary={setPrimaryImage}
            onOpenPreview={handleOpenImagePreview}
            itemType={itemType}
          />
        ) : (
          <ImageCarousel
            images={images}
            readOnly={readOnly}
            showControls={showControls}
            onDeleteImage={deleteImage}
            onSetPrimary={setPrimaryImage}
            onOpenPreview={handleOpenImagePreview}
          />
        )}

        {/* Image Preview Dialog */}
        <ImagePreviewDialog
          image={previewImage}
          open={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
          readOnly={readOnly}
          onSetPrimary={setPrimaryImage}
        />
      </CardContent>

      {showControls && (
        <CardFooter className="border-t border-[#333333] py-4">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {images.length} {images.length === 1 ? "image" : "images"}
            </div>
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={triggerFileInput}>
                <ImagePlus className="h-4 w-4 mr-2" />
                Add More
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

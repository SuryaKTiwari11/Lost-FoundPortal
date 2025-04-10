"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image as ImageIcon,
  ImagePlus,
  Trash2,
  Star,
  StarOff,
  MoreVertical,
  ZoomIn,
  Download,
  Copy,
  Grid2X2,
  X,
  Upload,
  Loader2,
  Check,
  RefreshCw,
} from "lucide-react";
import { adminAPI } from "@/services/api";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  itemId: string;
  itemType: "lost" | "found";
  initialImages?: ItemImage[];
  readOnly?: boolean;
  onImagesUpdated?: (images: ItemImage[]) => void;
  showControls?: boolean;
  onUploadComplete?: () => void;
}

export interface ItemImage {
  _id: string;
  url: string;
  isPrimary?: boolean;
  fileName?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  fileSize?: number;
}

export default function ImageGallery({
  itemId,
  itemType,
  initialImages = [],
  readOnly = false,
  onImagesUpdated,
  showControls = true,
  onUploadComplete,
}: ImageGalleryProps) {
  const [images, setImages] = useState<ItemImage[]>(initialImages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"gallery" | "carousel">("gallery");
  const [previewImage, setPreviewImage] = useState<ItemImage | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Get the primary image or the first image if no primary is set
  const getPrimaryImage = (): ItemImage | undefined => {
    return images.find((img) => img.isPrimary) || images[0];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Convert FileList to array for easier handling
      const fileArray = Array.from(files);

      // Upload all files in parallel
      const uploadPromises = fileArray.map(async (file) => {
        const response = await adminAPI.uploadItemImage(itemId, itemType, file);
        return response.success ? response.data : null;
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as ItemImage[];

      if (successfulUploads.length) {
        // If this is the first image, make it primary
        const updatedImages = [...images, ...successfulUploads];
        if (updatedImages.length === successfulUploads.length) {
          updatedImages[0].isPrimary = true;
          await adminAPI.setItemPrimaryImage(
            itemId,
            itemType,
            updatedImages[0]._id
          );
        }

        setImages(updatedImages);
        if (onImagesUpdated) {
          onImagesUpdated(updatedImages);
        }

        toast.success(
          successfulUploads.length === 1
            ? "Image uploaded successfully"
            : `${successfulUploads.length} images uploaded successfully`
        );
      }

      if (results.length > successfulUploads.length) {
        toast.error(
          `Failed to upload ${results.length - successfulUploads.length} images`
        );
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("An error occurred while uploading images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.deleteItemImage(
        itemId,
        itemType,
        imageId
      );
      if (response.success) {
        const updatedImages = images.filter((img) => img._id !== imageId);

        // If the deleted image was primary, set the first remaining image as primary
        if (
          images.find((img) => img._id === imageId)?.isPrimary &&
          updatedImages.length > 0
        ) {
          updatedImages[0].isPrimary = true;
          await adminAPI.setItemPrimaryImage(
            itemId,
            itemType,
            updatedImages[0]._id
          );
        }

        setImages(updatedImages);
        if (onImagesUpdated) {
          onImagesUpdated(updatedImages);
        }

        toast.success("Image deleted successfully");
      } else {
        toast.error(response.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("An error occurred while deleting the image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.setItemPrimaryImage(
        itemId,
        itemType,
        imageId
      );
      if (response.success) {
        const updatedImages = images.map((img) => ({
          ...img,
          isPrimary: img._id === imageId,
        }));

        setImages(updatedImages);
        if (onImagesUpdated) {
          onImagesUpdated(updatedImages);
        }

        toast.success("Primary image updated successfully");
      } else {
        toast.error(response.error || "Failed to update primary image");
      }
    } catch (error) {
      console.error("Error setting primary image:", error);
      toast.error("An error occurred while updating the primary image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenImagePreview = (image: ItemImage) => {
    setPreviewImage(image);
    setShowPreviewDialog(true);
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString();
  };

  const handleDownloadImage = (image: ItemImage) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.fileName || `image-${image._id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard");
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const uploadFiles = async () => {
    if (!selectedFiles.length) {
      toast.error("Please select at least one file to upload");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Mock API upload
      // In a real implementation, you would use your API service
      // const response = await adminAPI.uploadImages(formData);

      // Simulate successful upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedFiles.length} image(s) uploaded successfully`);
      setSelectedFiles([]);
      loadImages(); // Refresh image list
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  // Load images from server
  const loadImages = async () => {
    setIsLoading(true);

    try {
      // Mock API call
      // In a real implementation, you would use your API service
      // const response = await adminAPI.getImages();

      // Simulate loading images
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response
      const mockImages = [
        "https://images.unsplash.com/photo-1582481031633-5183fa0ddf95?q=80&w=200",
        "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?q=80&w=200",
        "https://images.unsplash.com/photo-1563919328614-54be51adff2e?q=80&w=200",
        "https://images.unsplash.com/photo-1579802063886-824657a8f7f5?q=80&w=200",
        "https://images.unsplash.com/photo-1602067520746-3def5b4f8f0f?q=80&w=200",
      ];

      setUploadedImages(mockImages);
    } catch (error) {
      console.error("Failed to load images:", error);
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete image
  const deleteImage = async (imageUrl: string) => {
    try {
      // Mock API call
      // In a real implementation, you would use your API service
      // await adminAPI.deleteImage(imageUrl);

      // Simulate deletion
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Remove from state
      setUploadedImages((prev) => prev.filter((url) => url !== imageUrl));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image");
    }
  };

  // Load images on component mount
  useState(() => {
    loadImages();
  });

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
          <div className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">No images available</h3>
            <p className="text-sm text-center text-gray-400 max-w-md mb-6">
              {readOnly
                ? "This item has no images attached to it."
                : "Upload images to help identify this item."}
            </p>
            {!readOnly && (
              <Button onClick={triggerFileInput} disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Images
              </Button>
            )}
          </div>
        ) : viewMode === "gallery" ? (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image._id}
                className={cn(
                  "relative group rounded-lg overflow-hidden border border-[#333333] bg-[#242424]",
                  {
                    "ring-2 ring-[#FFD166]": image.isPrimary,
                  }
                )}
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.url}
                    alt="Item image"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-all hover:scale-105 cursor-pointer"
                    onClick={() => handleOpenImagePreview(image)}
                  />
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-[#FFD166] hover:bg-[#FFD166] text-black">
                        <Star className="h-3 w-3 mr-1 fill-black" />
                        Primary
                      </Badge>
                    </div>
                  )}
                  {!readOnly && showControls && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-end justify-end opacity-0 group-hover:opacity-100">
                      <div className="p-2 flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-[#1E1E1E] border-[#333333] hover:bg-[#242424]"
                          onClick={() => handleOpenImagePreview(image)}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        {!image.isPrimary && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-[#1E1E1E] border-[#333333] hover:bg-[#242424]"
                            onClick={() => handleSetPrimary(image._id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-[#1E1E1E] border-[#333333] hover:bg-[#242424]"
                          onClick={() => handleDeleteImage(image._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image) => (
                  <CarouselItem key={image._id}>
                    <div className="p-1">
                      <div className="relative rounded-lg overflow-hidden border border-[#333333]">
                        <div className="aspect-[16/9] relative">
                          <Image
                            src={image.url}
                            alt="Item image"
                            fill
                            sizes="100vw"
                            className="object-contain bg-[#1A1A1A]"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-[#FFD166] hover:bg-[#FFD166] text-black">
                                <Star className="h-3 w-3 mr-1 fill-black" />
                                Primary
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-4 border-t border-[#333333] bg-[#242424]">
                          <div className="flex justify-between items-center">
                            <div className="text-sm truncate">
                              {image.fileName ||
                                `Image ${images.indexOf(image) + 1}`}
                            </div>
                            {!readOnly && showControls && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenImagePreview(image)}
                                >
                                  <ZoomIn className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                {!image.isPrimary && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetPrimary(image._id)}
                                  >
                                    <Star className="h-4 w-4 mr-2" />
                                    Set Primary
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                                  onClick={() => handleDeleteImage(image._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
        )}

        {/* Image Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="bg-[#1E1E1E] border-[#333333] max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div>
                  {previewImage?.fileName || "Image Preview"}
                  {previewImage?.isPrimary && (
                    <Badge className="ml-2 bg-[#FFD166] text-black">
                      <Star className="h-3 w-3 mr-1 fill-black" />
                      Primary Image
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowPreviewDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="relative aspect-video w-full">
              {previewImage && (
                <Image
                  src={previewImage.url}
                  alt="Image preview"
                  fill
                  sizes="100vw"
                  className="object-contain bg-[#181818]"
                />
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {previewImage?.fileSize && (
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="font-medium">Size:</span>
                  <span>{formatFileSize(previewImage.fileSize)}</span>
                </div>
              )}
              {previewImage?.uploadedAt && (
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="font-medium">Uploaded:</span>
                  <span>{formatDate(previewImage.uploadedAt)}</span>
                </div>
              )}
              {previewImage?.uploadedBy && (
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="font-medium">By:</span>
                  <span>{previewImage.uploadedBy}</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <div className="flex justify-between w-full">
                {!readOnly && previewImage && (
                  <div>
                    {!previewImage.isPrimary && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleSetPrimary(previewImage._id);
                          setPreviewImage({
                            ...previewImage,
                            isPrimary: true,
                          });
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Set as Primary
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      previewImage && handleCopyImageUrl(previewImage.url)
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    onClick={() =>
                      previewImage && handleDownloadImage(previewImage)
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { adminAPI } from "@/services/api";

export interface ItemImage {
  _id: string;
  url: string;
  isPrimary?: boolean;
  fileName?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  fileSize?: number;
}

interface UseItemImagesOptions {
  itemId: string;
  itemType: "lost" | "found";
  initialImages?: ItemImage[];
  onImagesUpdated?: (images: ItemImage[]) => void;
  onUploadComplete?: () => void;
}

export function useItemImages({
  itemId,
  itemType,
  initialImages = [],
  onImagesUpdated,
  onUploadComplete,
}: UseItemImagesOptions) {
  const [images, setImages] = useState<ItemImage[]>(initialImages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the primary image or the first image if no primary is set
  const getPrimaryImage = (): ItemImage | undefined => {
    return images.find((img) => img.isPrimary) || images[0];
  };

  // Load images from server
  const loadImages = async () => {
    setIsLoading(true);

    try {
      const response = await adminAPI.getItemImages(itemId, itemType);

      if (response.success && response.data) {
        setImages(response.data);
        return response.data;
      } else {
        toast.error(
          "Failed to load images: " + (response.error || "Unknown error")
        );
        return [];
      }
    } catch (error) {
      console.error("Failed to load images:", error);
      toast.error("Failed to load images");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Upload new image
  const uploadImage = async (file: File) => {
    try {
      const response = await adminAPI.uploadItemImage(itemId, itemType, file);
      return response;
    } catch (error) {
      console.error("Error uploading image:", error);
      return { success: false, error: "Upload failed" };
    }
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Convert FileList to array for easier handling
      const fileArray = Array.from(files);

      // Upload all files in parallel
      const uploadPromises = fileArray.map(async (file) => {
        const response = await uploadImage(file);
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

      if (onUploadComplete) {
        onUploadComplete();
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

  // Delete image
  const deleteImage = async (imageId: string) => {
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
        return true;
      } else {
        toast.error(response.error || "Failed to delete image");
        return false;
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("An error occurred while deleting the image");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Set primary image
  const setPrimaryImage = async (imageId: string) => {
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
        return true;
      } else {
        toast.error(response.error || "Failed to update primary image");
        return false;
      }
    } catch (error) {
      console.error("Error setting primary image:", error);
      toast.error("An error occurred while updating the primary image");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load images on mount
  useEffect(() => {
    if (initialImages.length === 0) {
      loadImages();
    }
  }, []);

  return {
    images,
    isLoading,
    isUploading,
    fileInputRef,
    getPrimaryImage,
    loadImages,
    handleFileSelect,
    deleteImage,
    setPrimaryImage,
    selectedFiles,
    setSelectedFiles,
  };
}

// Utility functions related to images
export const imageUtils = {
  formatFileSize: (bytes: number | undefined): string => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  },

  formatDate: (dateString: string | undefined): string => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString();
  },

  downloadImage: (image: ItemImage) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.fileName || `image-${image._id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  copyImageUrl: (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard");
  },
};

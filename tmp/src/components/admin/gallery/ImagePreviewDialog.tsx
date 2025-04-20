"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemImage, imageUtils } from "@/hooks/useItemImages";
import { Star, Copy, Download, X } from "lucide-react";

interface ImagePreviewDialogProps {
  image: ItemImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
  onSetPrimary?: (imageId: string) => Promise<boolean>;
}

export function ImagePreviewDialog({
  image,
  open,
  onOpenChange,
  readOnly = false,
  onSetPrimary,
}: ImagePreviewDialogProps) {
  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E1E1E] border-[#333333] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              {image.fileName || "Image Preview"}
              {image.isPrimary && (
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
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video w-full">
          <Image
            src={image.url}
            alt="Image preview"
            fill
            sizes="100vw"
            className="object-contain bg-[#181818]"
          />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {image.fileSize && (
            <div className="flex items-center gap-1 text-gray-400">
              <span className="font-medium">Size:</span>
              <span>{imageUtils.formatFileSize(image.fileSize)}</span>
            </div>
          )}
          {image.uploadedAt && (
            <div className="flex items-center gap-1 text-gray-400">
              <span className="font-medium">Uploaded:</span>
              <span>{imageUtils.formatDate(image.uploadedAt)}</span>
            </div>
          )}
          {image.uploadedBy && (
            <div className="flex items-center gap-1 text-gray-400">
              <span className="font-medium">By:</span>
              <span>{image.uploadedBy}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            {!readOnly && onSetPrimary && !image.isPrimary && (
              <div>
                <Button
                  variant="outline"
                  onClick={() => onSetPrimary(image._id)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Set as Primary
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => imageUtils.copyImageUrl(image.url)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button onClick={() => imageUtils.downloadImage(image)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

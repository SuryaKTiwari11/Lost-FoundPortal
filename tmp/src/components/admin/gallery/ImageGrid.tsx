"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ZoomIn, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReliableImage } from "@/components/ui/reliable-image";
import { ItemImage } from "@/hooks/useItemImages";

interface ImageGridProps {
  images: ItemImage[];
  readOnly?: boolean;
  showControls?: boolean;
  onDeleteImage: (imageId: string) => Promise<boolean>;
  onSetPrimary: (imageId: string) => Promise<boolean>;
  onOpenPreview: (image: ItemImage) => void;
  itemType: "lost" | "found";
}

export function ImageGrid({
  images,
  readOnly = false,
  showControls = true,
  onDeleteImage,
  onSetPrimary,
  onOpenPreview,
  itemType,
}: ImageGridProps) {
  return (
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
            <ReliableImage
              src={image.url}
              alt="Item image"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-all hover:scale-105 cursor-pointer"
              category={itemType}
              onClick={() => onOpenPreview(image)}
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
                    onClick={() => onOpenPreview(image)}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  {!image.isPrimary && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-[#1E1E1E] border-[#333333] hover:bg-[#242424]"
                      onClick={() => onSetPrimary(image._id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-[#1E1E1E] border-[#333333] hover:bg-[#242424]"
                    onClick={() => onDeleteImage(image._id)}
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
  );
}

"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star, ZoomIn, Trash2 } from "lucide-react";
import { ItemImage } from "@/hooks/useItemImages";

interface ImageCarouselProps {
  images: ItemImage[];
  readOnly?: boolean;
  showControls?: boolean;
  onDeleteImage: (imageId: string) => Promise<boolean>;
  onSetPrimary: (imageId: string) => Promise<boolean>;
  onOpenPreview: (image: ItemImage) => void;
}

export function ImageCarousel({
  images,
  readOnly = false,
  showControls = true,
  onDeleteImage,
  onSetPrimary,
  onOpenPreview,
}: ImageCarouselProps) {
  return (
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
                        {image.fileName || `Image ${images.indexOf(image) + 1}`}
                      </div>
                      {!readOnly && showControls && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenPreview(image)}
                          >
                            <ZoomIn className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          {!image.isPrimary && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSetPrimary(image._id)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Set Primary
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                            onClick={() => onDeleteImage(image._id)}
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
  );
}

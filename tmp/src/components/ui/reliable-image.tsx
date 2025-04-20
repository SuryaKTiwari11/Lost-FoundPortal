"use client";

import Image from "next/image";
import { useState } from "react";
import { AlertTriangle } from "lucide-react"; // Changed from ExclamationTriangleIcon to AlertTriangle

interface ReliableImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  category?: string;
}

export const ReliableImage = ({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  sizes,
  priority = false,
  category = "item",
}: ReliableImageProps) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to get placeholder image based on category - using dummy URLs that are guaranteed to work
  const getPlaceholderImage = () => {
    // Default fallback image based on category - using dummy placeholder URLs
    const categoryMap: Record<string, string> = {
      Electronics: "https://placehold.co/400x400/333/FFD166?text=Electronics",
      Clothing: "https://placehold.co/400x400/333/FFD166?text=Clothing",
      Accessories: "https://placehold.co/400x400/333/FFD166?text=Accessories",
      Books: "https://placehold.co/400x400/333/FFD166?text=Books",
      Documents: "https://placehold.co/400x400/333/FFD166?text=Documents",
      Keys: "https://placehold.co/400x400/333/FFD166?text=Keys",
      Wallet: "https://placehold.co/400x400/333/FFD166?text=Wallet",
      Other: "https://placehold.co/400x400/333/FFD166?text=Other",
    };

    return (
      categoryMap[category] ||
      "https://placehold.co/400x400/333/FFD166?text=Item"
    );
  };

  // For consistent styling
  const imgStyles = `${className} ${isLoading ? "blur-sm scale-110" : "blur-0 scale-100"} transition-all duration-500 ease-in-out`;

  const handleError = () => {
    setIsError(true);
    setIsLoading(false);
  };

  return (
    <>
      {isError ? (
        <div
          className={`flex items-center justify-center bg-[#2A2A2A] ${fill ? "h-full w-full" : ""}`}
          style={!fill ? { width, height } : undefined}
        >
          {fill ? (
            <div className="relative h-full w-full">
              <Image
                src={getPlaceholderImage()}
                alt={alt}
                fill={true}
                className={`object-cover opacity-60 ${className}`}
                sizes={sizes}
                unoptimized={true}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p className="text-center text-sm">Image not available</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <AlertTriangle className="h-6 w-6 text-gray-400 mb-1" />
              <p className="text-center text-sm text-gray-400">
                Image failed to load
              </p>
            </div>
          )}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={imgStyles}
          sizes={sizes}
          priority={priority}
          onError={handleError}
          onLoad={() => setIsLoading(false)}
          unoptimized={src.startsWith("http")}
        />
      )}
    </>
  );
};

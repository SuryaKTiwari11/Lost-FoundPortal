"use client";

import { useState } from "react";
import Image from "next/image";

// Base64 encoded placeholder image - small gray square with an icon
// This is embedded directly in the code so it never fails to load
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNODAgNjBIMTIwVjE0MEg4MFY2MFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTY1IDkwSDEzNSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4=";

// Different placeholder image for categories
const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  electronics:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNNjUgNzBIMTM1VjEzMEg2NVY3MFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTgwIDk1SDEyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMTAiIHI9IjUiIGZpbGw9IiNmZmYiLz48L3N2Zz4=", // Computer icon
  clothing:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNNzAgMTQwSDEzMEwxNDAgNzBMMTIwIDYwSDgwTDYwIDcwTDcwIDE0MFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+", // Simple shirt icon
  documents:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNNjAgNTBIMTQwVjE1MEg2MFY1MFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTcwIDcwSDEzMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNNzAgOTBIMTMwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik03MCAxMTBIMTAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==", // Document icon
  accessories:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTEwMCAxMTBWMTUwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMyIvPjwvc3ZnPg==", // Watch/accessory icon
  books:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNNTUgNTBIMTQ1VjE1MEg1NVY1MFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTcwIDUwVjE1MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=", // Book icon
  bags: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNNzAgNjBIMTMwVjE0MEg3MFY2MFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTgwIDYwQzgwIDUwIDkwIDQwIDEwMCA0MFM4MCA1MCA4MCA2MFoiIHN0cm9rZT0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMjAgNjBDMTIwIDUwIDExMCA0MCAxMDAgNDBTMTIwIDUwIDEyMCA2MFoiIHN0cm9rZT0iI2ZmZiIvPjwvc3ZnPg==", // Bag icon
};

interface ReliableImageProps {
  src: string | null | undefined;
  alt: string;
  category?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  layout?: "fill" | "fixed" | "intrinsic" | "responsive";
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  unoptimized?: boolean;
  onLoadingComplete?: (result: {
    naturalWidth: number;
    naturalHeight: number;
  }) => void;
}

export function ReliableImage({
  src,
  alt,
  category,
  className,
  priority = false,
  fill = false,
  objectFit = "cover",
  ...props
}: ReliableImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    src ||
      (category && category.toLowerCase() in CATEGORY_PLACEHOLDERS
        ? CATEGORY_PLACEHOLDERS[category.toLowerCase()]
        : PLACEHOLDER_IMAGE)
  );
  const [imgError, setImgError] = useState<boolean>(false);

  // This handles image load errors and uses appropriate placeholder
  const handleError = () => {
    if (!imgError) {
      const fallback =
        category && category.toLowerCase() in CATEGORY_PLACEHOLDERS
          ? CATEGORY_PLACEHOLDERS[category.toLowerCase()]
          : PLACEHOLDER_IMAGE;

      setImgSrc(fallback);
      setImgError(true);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      {fill ? (
        <Image
          src={imgSrc}
          alt={alt}
          fill={true}
          className={`object-${objectFit}`}
          priority={priority}
          onError={handleError}
          unoptimized={imgError} // Don't optimize placeholder SVGs
          {...props}
        />
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          className={className || ""}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
}

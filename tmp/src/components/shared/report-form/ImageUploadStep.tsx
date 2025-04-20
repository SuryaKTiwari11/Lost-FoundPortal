"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Control } from "react-hook-form";

interface ImageUploadStepProps {
  control: Control<any>;
  setValue: any;
  watch: any;
}

export function ImageUploadStep({
  control,
  setValue,
  watch,
}: ImageUploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const images = watch("images") || [];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles?.length) {
        setUploading(true);

        try {
          // Convert accepted files to image previews
          const imagePreviews = acceptedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
          }));

          // Add to existing images
          setValue("images", [...images, ...imagePreviews], {
            shouldValidate: true,
          });
        } catch (error) {
          console.error("Error uploading images:", error);
        } finally {
          setUploading(false);
        }
      }
    },
    [images, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5242880, // 5MB
    maxFiles: 5,
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    // Revoke object URL to avoid memory leaks
    if (newImages[index]?.preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    setValue("images", newImages, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Upload Images</h2>

      <FormField
        control={control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Item Images (Optional)</FormLabel>
            <FormControl>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors bg-[#1E1E1E] hover:bg-[#252525]",
                  isDragActive ? "border-[#FFD166]" : "border-[#333333]"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  {uploading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FFD166]" />
                      <p className="text-sm text-gray-400">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="h-10 w-10 text-gray-400" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {isDragActive
                            ? "Drop images here..."
                            : "Drag & drop images here or click to select"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Supported formats: JPEG, PNG, WebP (max 5MB each)
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 border-[#333333] bg-[#252525]"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select Images
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Upload images of the item to help with identification (up to 5
              images)
            </FormDescription>
            <FormMessage />

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image: any, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md overflow-hidden group"
                  >
                    <Image
                      src={image.preview}
                      alt={`Uploaded image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}

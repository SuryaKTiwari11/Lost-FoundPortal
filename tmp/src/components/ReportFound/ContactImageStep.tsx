import React from "react";
import { Camera, Mail, Phone, ArrowLeft, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { FormInput } from "@/components/shared/FormInput";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FORM_CONSTANTS, FORM_PLACEHOLDERS } from "@/constants/formConstants";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Image from "next/image";

interface ContactImageStepProps {
  register: any;
  errors: any;
  watch: any;
  nextStep: () => void;
  prevStep: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedImage: File | null;
  previewUrl: string | null;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeSelectedImage: () => void;
}

export function ContactImageStep({
  register,
  errors,
  watch,
  nextStep,
  prevStep,
  fileInputRef,
  selectedImage,
  previewUrl,
  handleImageSelect,
  removeSelectedImage,
}: ContactImageStepProps) {
  return (
    <AnimatedSection>
      <h2 className={FORM_CONSTANTS.FORM_HEADING_CLASSES}>
        <Camera className="mr-2 h-5 w-5 text-[#FFD166]" />
        Contact & Image
      </h2>

      <div className="space-y-6">
        {/* Contact Information */}
        <div className={FORM_CONSTANTS.SECTION_CLASSES}>
          <h3 className="text-lg font-medium text-white mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="contactEmail"
              label="Contact Email"
              placeholder={FORM_PLACEHOLDERS.CONTACT_EMAIL}
              type="email"
              Icon={Mail}
              register={register}
              errors={errors}
              required={true}
            />

            <FormInput
              id="contactPhone"
              label="Contact Phone"
              placeholder={FORM_PLACEHOLDERS.CONTACT_PHONE}
              Icon={Phone}
              register={register}
              errors={errors}
              required={false}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className={FORM_CONSTANTS.SECTION_CLASSES}>
          <h3 className="text-lg font-medium text-white mb-4">Item Image</h3>

          <div className="space-y-4">
            {/* Upload option */}
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl px-4 py-4 h-auto border-[#333] hover:bg-[#333]/50 transition-all shadow-sm"
                >
                  <ImagePlus className="w-4 h-4 mr-2" /> Upload Image
                </Button>
                <span className="text-sm text-gray-400">or</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              {/* Image preview */}
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 relative w-full max-w-md"
                >
                  <div className="relative h-48 rounded-xl overflow-hidden border border-[#333] shadow-md">
                    <Image
                      src={previewUrl}
                      alt="Selected image preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-sm text-gray-400">
                    {selectedImage?.name} (
                    {(selectedImage?.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </motion.div>
              )}
            </div>

            {/* External URL option */}
            <div className="flex flex-col mt-4">
              <label className="text-sm text-gray-400 mb-2">
                {!selectedImage
                  ? "Or enter an image URL:"
                  : "Image URL (ignored when uploading an image):"}
              </label>
              <Input
                {...register("imageURL")}
                className={`bg-[#252525] border-[#333333] rounded-xl text-white transition-all focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166] ${selectedImage ? "opacity-50" : ""}`}
                placeholder="https://example.com/image.jpg"
                disabled={!!selectedImage}
              />
              {errors.imageURL && !selectedImage && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.imageURL.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400 mt-2">
        <p>Fields marked with * are required</p>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
          className={FORM_CONSTANTS.BUTTON_SECONDARY_CLASSES}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Button
          type="button"
          onClick={nextStep}
          className={FORM_CONSTANTS.BUTTON_PRIMARY_CLASSES}
          disabled={!watch("contactEmail")}
        >
          Review <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </AnimatedSection>
  );
}

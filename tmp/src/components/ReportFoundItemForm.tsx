"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useReportFoundForm } from "./ReportFound/useReportFoundForm";
import { ItemDetailsStep } from "./ReportFound/ItemDetailsStep";
import { LocationDetailsStep } from "./ReportFound/LocationDetailsStep";
import { ContactImageStep } from "./ReportFound/ContactImageStep";
import { ConfirmationStep } from "./ReportFound/ConfirmationStep";

export default function ReportFoundItemForm() {
  const {
    session,
    status,
    isSubmitting,
    selectedImage,
    previewUrl,
    uploadProgress,
    formStep,
    totalSteps,
    fileInputRef,
    register,
    handleSubmit,
    errors,
    watch,
    control,
    fetchUserProfile,
    handleImageSelect,
    removeSelectedImage,
    onSubmit,
    nextStep,
    prevStep,
    formProgress,
    router,
  } = useReportFoundForm();

  // Fetch user profile data when component mounts
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchUserProfile();
    }
  }, [status, session, fetchUserProfile]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Render login prompt if user is not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="text-center p-8 bg-[#1A1A1A]/80 backdrop-blur-sm rounded-xl border border-[#333] shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Login Required
        </h3>
        <p className="mb-6 text-gray-300">
          You must be logged in to report a found item.
        </p>
        <Button
          onClick={() => router.push("/sign")}
          className="rounded-xl px-6 py-6 h-auto bg-gradient-to-r from-[#FFD166] to-amber-500 text-[#121212] font-medium hover:opacity-90 transition-all shadow-md"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1A1A1A]/80 backdrop-blur-sm rounded-xl border border-[#333] shadow-lg p-8 overflow-hidden"
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 w-full bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FFD166] to-amber-500 transition-all duration-300"
            style={{ width: `${formProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span className={formStep >= 1 ? "text-[#FFD166]" : ""}>
            Item Details
          </span>
          <span className={formStep >= 2 ? "text-[#FFD166]" : ""}>
            Location & Time
          </span>
          <span className={formStep >= 3 ? "text-[#FFD166]" : ""}>
            Contact & Image
          </span>
          <span className={formStep >= 4 ? "text-[#FFD166]" : ""}>Review</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Item Basic Information */}
        {formStep === 1 && (
          <ItemDetailsStep
            register={register}
            errors={errors}
            watch={watch}
            nextStep={nextStep}
            control={control}
          />
        )}

        {/* Step 2: Location & Time */}
        {formStep === 2 && (
          <LocationDetailsStep
            register={register}
            errors={errors}
            watch={watch}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {/* Step 3: Contact & Image */}
        {formStep === 3 && (
          <ContactImageStep
            register={register}
            errors={errors}
            watch={watch}
            nextStep={nextStep}
            prevStep={prevStep}
            fileInputRef={fileInputRef}
            selectedImage={selectedImage}
            previewUrl={previewUrl}
            handleImageSelect={handleImageSelect}
            removeSelectedImage={removeSelectedImage}
          />
        )}

        {/* Step 4: Confirmation */}
        {formStep === 4 && (
          <ConfirmationStep
            prevStep={prevStep}
            isSubmitting={isSubmitting}
            uploadProgress={uploadProgress}
            watch={watch}
          />
        )}
      </form>
    </motion.div>
  );
}

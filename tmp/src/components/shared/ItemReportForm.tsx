"use client";

import { useState } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { motion } from "framer-motion";
import {
  useItemReportForm,
  ItemReportFormType,
} from "@/hooks/useItemReportForm";
import { FormProgressBar } from "@/components/shared/FormProgressBar";
import { FormStep } from "@/components/shared/FormStep";
import { ItemDetailsStep } from "@/components/shared/report-form/ItemDetailsStep";
import { LocationTimeStep } from "@/components/shared/report-form/LocationTimeStep";
import { ContactInfoStep } from "@/components/shared/report-form/ContactInfoStep";
import { ImageUploadStep } from "@/components/shared/report-form/ImageUploadStep";
import { LostItemRewardStep } from "@/components/shared/report-form/LostItemRewardStep";

interface ItemReportFormProps {
  type: ItemReportFormType;
}

export default function ItemReportForm({ type }: ItemReportFormProps) {
  const [formDirection, setFormDirection] = useState(0);

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
  } = useItemReportForm(type);

  // Handle form navigation
  const handleNextStep = () => {
    setFormDirection(1);
    nextStep();
  };

  const handlePrevStep = () => {
    setFormDirection(-1);
    prevStep();
  };

  return (
    <div className="bg-[#0F0F0F] rounded-xl shadow-xl p-6 sm:p-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {type === "lost" ? "Report a Lost Item" : "Report a Found Item"}
        </h1>
        <p className="text-gray-400">
          {type === "lost"
            ? "Fill out the form below to report your lost item. This will help others find and return it to you."
            : "Fill out the form below to report an item you've found. This will help the owner locate and claim it."}
        </p>
      </div>

      <FormProgressBar
        progress={formProgress}
        step={formStep}
        totalSteps={totalSteps}
      />

      <Form {...{ control, handleSubmit: handleSubmit(onSubmit) }}>
        <div className="min-h-[400px] flex flex-col">
          {/* Form Steps */}
          <div className="flex-1 pb-8">
            {/* Step 1: Item Details */}
            <FormStep isActive={formStep === 1} direction={formDirection}>
              <ItemDetailsStep
                control={control}
                register={register}
                errors={errors}
              />
            </FormStep>

            {/* Step 2: Location & Time */}
            <FormStep isActive={formStep === 2} direction={formDirection}>
              <LocationTimeStep
                control={control}
                type={type}
                register={register}
                errors={errors}
                watch={watch}
              />
            </FormStep>

            {/* Step 3: Contact Info */}
            <FormStep isActive={formStep === 3} direction={formDirection}>
              <ContactInfoStep
                control={control}
                type={type}
                register={register}
                errors={errors}
              />
            </FormStep>

            {/* Step 4: Different for Lost and Found */}
            {type === "lost" ? (
              <FormStep isActive={formStep === 4} direction={formDirection}>
                <LostItemRewardStep
                  control={control}
                  register={register}
                  errors={errors}
                />
              </FormStep>
            ) : (
              <FormStep isActive={formStep === 4} direction={formDirection}>
                <ImageUploadStep
                  control={control}
                  register={register}
                  errors={errors}
                  selectedImage={selectedImage}
                  previewUrl={previewUrl}
                  uploadProgress={uploadProgress}
                  fileInputRef={fileInputRef}
                  handleImageSelect={handleImageSelect}
                  removeSelectedImage={removeSelectedImage}
                  isSubmitting={isSubmitting}
                />
              </FormStep>
            )}
          </div>

          {/* Form Navigation */}
          <div className="pt-4 border-t border-[#333333] flex items-center justify-between">
            {formStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                className="gap-2 bg-[#1E1E1E] border-[#333333] hover:bg-[#252525]"
                onClick={handlePrevStep}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="gap-2 bg-[#1E1E1E] border-[#333333] hover:bg-[#252525]"
                onClick={() => router.push("/")}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
            )}

            {formStep < totalSteps ? (
              <Button
                type="button"
                className="gap-2 bg-[#FFD166] text-black hover:bg-[#e6bd5c]"
                onClick={handleNextStep}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="gap-2 bg-[#FFD166] text-black hover:bg-[#e6bd5c]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}

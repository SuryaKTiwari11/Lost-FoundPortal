import React from "react";
import { MapPin, Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useLocationDetailsForm } from "@/hooks/useLocationDetailsForm";
import { FormInput } from "@/components/shared/FormInput";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FORM_CONSTANTS, FORM_PLACEHOLDERS } from "@/constants/formConstants";
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FoundReportData } from "@/schemas/foundReportSchema";

interface LocationDetailsStepProps {
  register: UseFormRegister<FoundReportData>;
  errors: FieldErrors<FoundReportData>;
  watch: any;
  nextStep: () => void;
  prevStep: () => void;
}

export const LocationDetailsStep: React.FC<LocationDetailsStepProps> = ({
  register,
  errors,
  watch,
  nextStep,
  prevStep,
}) => {
  // Use our custom hook for form logic
  const { isFormValid, handleContinue } = useLocationDetailsForm({
    register,
    errors,
    watch,
    nextStep,
  });

  return (
    <AnimatedSection>
      <h2 className={FORM_CONSTANTS.FORM_HEADING_CLASSES}>
        <MapPin className="mr-2 h-5 w-5 text-[#FFD166]" />
        Location & Time Details
      </h2>

      <div className="space-y-4">
        <div>
          <label className="flex items-center text-sm font-medium mb-2 text-gray-300">
            <MapPin className="w-4 h-4 mr-2 text-[#FFD166]" />
            Where did you find it? *
          </label>
          <Input
            {...register("foundLocation")}
            className="bg-[#252525] border-[#333333] rounded-xl text-white transition-all focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166]"
            placeholder="e.g., Library, 2nd Floor"
          />
          {errors.foundLocation && (
            <p className="mt-1 text-red-500 text-sm">
              {errors.foundLocation.message}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-2 text-gray-300">
            <Calendar className="w-4 h-4 mr-2 text-[#FFD166]" />
            Date Found *
          </label>
          <Input
            type="date"
            {...register("foundDate")}
            className="bg-[#252525] border-[#333333] rounded-xl text-white transition-all focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166]"
            max={new Date().toISOString().split("T")[0]} // Prevent future dates
          />
          {errors.foundDate && (
            <p className="mt-1 text-red-500 text-sm">
              {errors.foundDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-2 text-gray-300">
            <Home className="w-4 h-4 mr-2 text-[#FFD166]" />
            Current Holding Location *
          </label>
          <Input
            {...register("currentHoldingLocation")}
            className="bg-[#252525] border-[#333333] rounded-xl text-white transition-all focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166]"
            placeholder="e.g., Lost & Found Office, with you, etc."
          />
          {errors.currentHoldingLocation && (
            <p className="mt-1 text-red-500 text-sm">
              {errors.currentHoldingLocation.message}
            </p>
          )}
        </div>
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
          onClick={handleContinue}
          className={FORM_CONSTANTS.BUTTON_PRIMARY_CLASSES}
          disabled={!watch("foundLocation") || !watch("foundDate")}
        >
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </AnimatedSection>
  );
};

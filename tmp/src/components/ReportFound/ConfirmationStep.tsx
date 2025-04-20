import React from "react";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FORM_CONSTANTS } from "@/constants/formConstants";

interface ConfirmationStepProps {
  prevStep: () => void;
  isSubmitting: boolean;
  uploadProgress: number;
  watch: any;
}

export function ConfirmationStep({
  prevStep,
  isSubmitting,
  uploadProgress,
  watch,
}: ConfirmationStepProps) {
  return (
    <AnimatedSection>
      <div className="space-y-6">
        <h2 className={FORM_CONSTANTS.FORM_HEADING_CLASSES}>
          <Check className="mr-2 h-5 w-5 text-[#FFD166]" />
          Confirm Submission
        </h2>

        <div className={FORM_CONSTANTS.SECTION_CLASSES}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-2">
              Review Your Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Item Name:</p>
                <p className="text-white">{watch("itemName")}</p>
              </div>

              <div>
                <p className="text-gray-400">Category:</p>
                <p className="text-white">{watch("category")}</p>
              </div>

              <div>
                <p className="text-gray-400">Found Location:</p>
                <p className="text-white">{watch("foundLocation")}</p>
              </div>

              <div>
                <p className="text-gray-400">Date Found:</p>
                <p className="text-white">
                  {new Date(watch("foundDate")).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Contact Email:</p>
                <p className="text-white">{watch("contactEmail")}</p>
              </div>

              {watch("currentHoldingLocation") && (
                <div>
                  <p className="text-gray-400">Current Holding Location:</p>
                  <p className="text-white">
                    {watch("currentHoldingLocation")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            onClick={prevStep}
            variant="outline"
            className={FORM_CONSTANTS.BUTTON_SECONDARY_CLASSES}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={FORM_CONSTANTS.BUTTON_PRIMARY_CLASSES}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting... {uploadProgress > 0 && `(${uploadProgress}%)`}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}

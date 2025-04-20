import React from "react";
import { FileText, Phone, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FoundReportData } from "@/schemas/foundReportSchema";

interface ContactInfoStepProps {
  register: UseFormRegister<FoundReportData>;
  errors: FieldErrors<FoundReportData>;
  prevStep: () => void;
  isSubmitting: boolean;
}

export const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
  register,
  errors,
  prevStep,
  isSubmitting,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#1A1A1A]/60 backdrop-blur-sm p-6 rounded-xl border border-[#333] shadow-md">
        <div className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium mb-2 text-gray-300">
              <FileText className="w-4 h-4 mr-2 text-[#FFD166]" />
              Additional Notes
            </label>
            <Textarea
              {...register("additionalNotes")}
              rows={4}
              className="bg-[#252525] border-[#333333] rounded-xl text-white transition-all focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166]"
              placeholder="Any additional information about the found item"
            />
            {errors.additionalNotes && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.additionalNotes.message}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium mb-2 text-gray-300">
              <Phone className="w-4 h-4 mr-2 text-[#FFD166]" />
              Contact Phone
            </label>
            <Input
              {...register("contactPhone")}
              className="bg-[#252525] border-[#333333] rounded-xl text-white transition-all focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166]"
              placeholder="+91 98765 43210"
            />
            {errors.contactPhone && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.contactPhone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
          className="rounded-xl px-6 py-6 h-auto border-[#333] hover:bg-[#333]/50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl px-6 py-6 h-auto bg-gradient-to-r from-[#FFD166] to-amber-500 text-[#121212] font-medium hover:opacity-90 transition-all shadow-md disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

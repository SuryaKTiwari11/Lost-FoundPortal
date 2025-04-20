import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FoundReportData } from "@/schemas/foundReportSchema";

interface UseLocationDetailsFormProps {
  register: UseFormRegister<FoundReportData>;
  errors: FieldErrors<FoundReportData>;
  watch: any;
  nextStep: () => void;
}

export function useLocationDetailsForm({
  register,
  errors,
  watch,
  nextStep,
}: UseLocationDetailsFormProps) {
  // Check if required fields are filled
  const isFormValid =
    !!watch("foundLocation") &&
    !!watch("foundDate") &&
    !!watch("currentHoldingLocation");

  // Handle continue button click
  const handleContinue = () => {
    if (isFormValid) {
      nextStep();
    }
  };

  return {
    isFormValid,
    handleContinue,
  };
}

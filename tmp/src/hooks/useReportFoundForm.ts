import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  foundReportSchema,
  FoundReportData,
} from "@/schemas/foundReportSchema";
import { toast } from "sonner";

interface UseReportFoundFormProps {
  lostItemId: string;
  onSuccess: () => void;
}

export function useReportFoundForm({
  lostItemId,
  onSuccess,
}: UseReportFoundFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const totalSteps = 2;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FoundReportData>({
    resolver: zodResolver(foundReportSchema),
    defaultValues: {
      lostItemId,
      foundDate: new Date().toISOString().split("T")[0], // Current date as default
    },
    mode: "onChange",
  });

  const onSubmit = async (data: FoundReportData) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to report a found item");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = {
        ...data,
        foundBy: session.user.id,
      };

      const response = await fetch("/api/lost-items/report-found", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Thank you for reporting this found item!");
        reset();
        onSuccess();
      } else {
        toast.error(result.error || "Failed to submit found item report");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting your report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setFormStep(formStep + 1);
  };

  const prevStep = () => {
    setFormStep(formStep - 1);
  };

  const formProgress = (formStep / totalSteps) * 100;

  return {
    session,
    isSubmitting,
    formStep,
    totalSteps,
    register,
    handleSubmit,
    errors,
    watch,
    onSubmit,
    nextStep,
    prevStep,
    formProgress,
  };
}

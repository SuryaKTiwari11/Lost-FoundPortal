"use client";

import { motion } from "framer-motion";
import { useReportFoundForm } from "@/hooks/useReportFoundForm";
import { LocationDetailsStep } from "./ReportFound/LocationDetailsStep";
import { ContactInfoStep } from "./ReportFound/ContactInfoStep";

interface ReportFoundFormProps {
  lostItemId: string;
  onSuccess: () => void;
}

export default function ReportFoundForm({
  lostItemId,
  onSuccess,
}: ReportFoundFormProps) {
  const {
    session,
    isSubmitting,
    formStep,
    register,
    handleSubmit,
    errors,
    watch,
    onSubmit,
    nextStep,
    prevStep,
    formProgress,
  } = useReportFoundForm({ lostItemId, onSuccess });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden"
    >
      <div className="mb-6">
        <div className="h-2 w-full bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FFD166] to-amber-500 transition-all duration-300"
            style={{ width: `${formProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Location Details</span>
          <span>Contact Info</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register("lostItemId")} />

        {formStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LocationDetailsStep
              register={register}
              errors={errors}
              watch={watch}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </motion.div>
        )}

        {formStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ContactInfoStep
              register={register}
              errors={errors}
              prevStep={prevStep}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}

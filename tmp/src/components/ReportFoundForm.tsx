"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  foundReportSchema,
  FoundReportData,
} from "@/schemas/foundReportSchema";
import { toast } from "sonner";

interface ReportFoundFormProps {
  lostItemId: string;
  onSuccess: () => void;
}

export default function ReportFoundForm({
  lostItemId,
  onSuccess,
}: ReportFoundFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FoundReportData>({
    resolver: zodResolver(foundReportSchema),
    defaultValues: {
      lostItemId,
      foundDate: new Date().toISOString().split("T")[0], // Current date as default
    },
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

      console.log("Submitting found report:", formData);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("lostItemId")} />

      <div>
        <label className="block text-sm font-medium mb-2">
          Where did you find it? *
        </label>
        <input
          {...register("foundLocation")}
          className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
          placeholder="e.g., Library, 2nd Floor"
        />
        {errors.foundLocation && (
          <p className="mt-1 text-red-500 text-sm">
            {errors.foundLocation.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date Found *</label>
        <input
          type="date"
          {...register("foundDate")}
          className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
          max={new Date().toISOString().split("T")[0]} // Prevent future dates
        />
        {errors.foundDate && (
          <p className="mt-1 text-red-500 text-sm">
            {errors.foundDate.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Current Holding Location *
        </label>
        <input
          {...register("currentHoldingLocation")}
          className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
          placeholder="e.g., Lost & Found Office, with you, etc."
        />
        {errors.currentHoldingLocation && (
          <p className="mt-1 text-red-500 text-sm">
            {errors.currentHoldingLocation.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Additional Notes
        </label>
        <textarea
          {...register("additionalNotes")}
          rows={4}
          className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
          placeholder="Any additional information about the found item"
        ></textarea>
        {errors.additionalNotes && (
          <p className="mt-1 text-red-500 text-sm">
            {errors.additionalNotes.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Contact Phone</label>
        <input
          {...register("contactPhone")}
          className="w-full p-3 bg-[#2A2A2A] rounded-md border border-gray-700 focus:border-[#FFD166] focus:outline-none"
          placeholder="+91 98765 43210"
        />
        {errors.contactPhone && (
          <p className="mt-1 text-red-500 text-sm">
            {errors.contactPhone.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-[#FFD166] text-black rounded-md font-medium hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  );
}

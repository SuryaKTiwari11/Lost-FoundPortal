"use client";

import ItemReportForm from "@/components/shared/ItemReportForm";

export default function ReportFoundItem() {
  const handleSubmit = async (values) => {
    // ...existing code

    const formData = new FormData();
    // Add all your existing form fields
    formData.append("status", "pending"); // Explicitly set status

    // ...rest of the submit logic
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 bg-[#121212] text-white">
      <div className="w-full max-w-2xl mx-auto">
        <ItemReportForm type="found" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

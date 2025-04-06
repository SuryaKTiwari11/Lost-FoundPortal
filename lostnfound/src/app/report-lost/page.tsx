"use client";

import ItemReportForm from "@/components/shared/ItemReportForm";

export default function ReportLostItem() {
  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 bg-[#121212] text-white">
      <div className="w-full max-w-2xl mx-auto">
        <ItemReportForm type="lost" />
      </div>
    </div>
  );
}

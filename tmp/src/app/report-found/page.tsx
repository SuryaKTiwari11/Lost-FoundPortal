"use client";

import React from "react";
import ReportFoundItemForm from "@/components/ReportFoundItemForm";

export default function ReportFoundItem() {
  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 bg-[#121212] text-white">
      <div className="w-full max-w-2xl mx-auto">
        <ReportFoundItemForm />
      </div>
    </div>
  );
}

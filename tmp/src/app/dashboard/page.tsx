"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDashboardItems } from "@/hooks/useDashboardItems";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardItemsTable from "@/components/dashboard/DashboardItemsTable";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import AccessDeniedMessage from "@/components/shared/AccessDeniedMessage";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const {
    lostItems,
    foundItems,
    isLoading: itemsLoading,
  } = useDashboardItems(session);
  const { analyticsData, isLoading: analyticsLoading } =
    useDashboardAnalytics(session);

  // Unified loading state
  const isLoading = itemsLoading || analyticsLoading;

  // Check if user is authenticated
  if (status === "loading" || isLoading) {
    return <DashboardLoading />;
  }

  if (status === "unauthenticated") {
    return (
      <AccessDeniedMessage message="You need to be logged in to view your dashboard." />
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader session={session} />

        <div className="mt-8">
          <DashboardSummary analyticsData={analyticsData} />
        </div>

        <div className="mt-8">
          <DashboardQuickActions />
        </div>

        <div className="mt-8">
          <DashboardItemsTable
            lostItems={lostItems}
            foundItems={foundItems}
            isLoading={itemsLoading}
          />
        </div>
      </div>
    </div>
  );
}

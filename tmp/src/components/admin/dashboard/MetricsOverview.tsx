"use client";

import { AnalyticsCard } from "../AnalyticsCard";
import {
  Package,
  PackageCheck,
  Percent,
  AlertCircle,
  Users,
  UserPlus,
} from "lucide-react";
import { DashboardMetrics } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsOverviewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

export function MetricsOverview({ metrics, loading }: MetricsOverviewProps) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-[#1E1E1E] border border-[#333] rounded-lg p-4 shadow-md"
            >
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28 bg-[#333]" />
                <Skeleton className="h-4 w-4 rounded-full bg-[#333]" />
              </div>
              <Skeleton className="h-8 w-16 mt-4 bg-[#333]" />
              <Skeleton className="h-3 w-32 mt-2 bg-[#333]" />
            </div>
          ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  // Convert trend directions to our component's format
  const getTrendType = (
    direction: string | undefined
  ): "up" | "down" | "neutral" => {
    if (!direction) return "neutral";
    if (direction === "up") return "up";
    if (direction === "down") return "down";
    return "neutral";
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnalyticsCard
        title="Lost Items"
        value={metrics.totalLostItems}
        icon={Package}
        description="Total reported lost items"
        trend={
          metrics.trends?.lostItemsTrend
            ? {
                value: metrics.trends.lostItemsTrend.value,
                trend: getTrendType(metrics.trends.lostItemsTrend.direction),
              }
            : undefined
        }
      />

      <AnalyticsCard
        title="Found Items"
        value={metrics.totalFoundItems}
        icon={PackageCheck}
        description="Total reported found items"
        trend={
          metrics.trends?.foundItemsTrend
            ? {
                value: metrics.trends.foundItemsTrend.value,
                trend: getTrendType(metrics.trends.foundItemsTrend.direction),
              }
            : undefined
        }
      />

      <AnalyticsCard
        title="Match Rate"
        value={`${metrics.matchRate}%`}
        icon={Percent}
        description="Items successfully matched"
        trend={
          metrics.trends?.matchRateTrend
            ? {
                value: metrics.trends.matchRateTrend.value,
                trend: getTrendType(metrics.trends.matchRateTrend.direction),
              }
            : undefined
        }
      />

      <AnalyticsCard
        title="Pending Verifications"
        value={metrics.pendingVerifications}
        icon={AlertCircle}
        description="Items awaiting verification"
        trend={
          metrics.trends?.pendingVerificationsTrend
            ? {
                value: metrics.trends.pendingVerificationsTrend.value,
                trend: getTrendType(
                  metrics.trends.pendingVerificationsTrend.direction
                ),
              }
            : undefined
        }
      />

      {/* Optional user metrics if available in the data */}
      {metrics.activeUsers && (
        <AnalyticsCard
          title="Active Users"
          value={metrics.activeUsers}
          icon={Users}
          description="Current active users"
        />
      )}

      {metrics.newUsersThisMonth && (
        <AnalyticsCard
          title="New Users"
          value={metrics.newUsersThisMonth}
          icon={UserPlus}
          description="New users this month"
        />
      )}
    </div>
  );
}

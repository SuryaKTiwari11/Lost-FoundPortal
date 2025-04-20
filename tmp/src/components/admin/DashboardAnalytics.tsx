"use client";

import {
  RefreshCcw,
  Users,
  Package,
  Footprints,
  Award,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsCard } from "./AnalyticsCard";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardAnalytics() {
  const {
    analyticsData,
    isLoading,
    timeRange,
    setTimeRange,
    refreshAnalytics,
  } = useDashboardAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Dashboard Analytics
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalytics}
            className="h-8 bg-[#252525] border-[#333333] hover:bg-[#333] hover:text-white"
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-[#1E1E1E] border border-[#333] rounded-md p-6 h-[130px]"
              >
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-24 bg-[#333]" />
                  <Skeleton className="h-4 w-4 rounded-full bg-[#333]" />
                </div>
                <Skeleton className="h-8 w-16 mt-6 bg-[#333]" />
                <Skeleton className="h-3 w-32 mt-2 bg-[#333]" />
              </div>
            ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnalyticsCard
            title="Total Users"
            value={analyticsData?.totalUsers || 0}
            icon={Users}
            description="Total registered users"
            trend={
              analyticsData?.usersTrend
                ? {
                    value: analyticsData.usersTrend,
                    trend:
                      analyticsData.usersTrend > 0
                        ? "up"
                        : analyticsData.usersTrend < 0
                          ? "down"
                          : "neutral",
                  }
                : undefined
            }
          />

          <AnalyticsCard
            title="Lost Items"
            value={analyticsData?.lostItems || 0}
            icon={Package}
            description="Total reported lost items"
            trend={
              analyticsData?.lostItemsTrend
                ? {
                    value: analyticsData.lostItemsTrend,
                    trend:
                      analyticsData.lostItemsTrend > 0
                        ? "up"
                        : analyticsData.lostItemsTrend < 0
                          ? "down"
                          : "neutral",
                  }
                : undefined
            }
          />

          <AnalyticsCard
            title="Found Items"
            value={analyticsData?.foundItems || 0}
            icon={Footprints}
            description="Total reported found items"
            trend={
              analyticsData?.foundItemsTrend
                ? {
                    value: analyticsData.foundItemsTrend,
                    trend:
                      analyticsData.foundItemsTrend > 0
                        ? "up"
                        : analyticsData.foundItemsTrend < 0
                          ? "down"
                          : "neutral",
                  }
                : undefined
            }
          />

          <AnalyticsCard
            title="Successful Matches"
            value={analyticsData?.successfulMatches || 0}
            icon={Award}
            description="Items successfully returned to owners"
            trend={
              analyticsData?.matchesTrend
                ? {
                    value: analyticsData.matchesTrend,
                    trend:
                      analyticsData.matchesTrend > 0
                        ? "up"
                        : analyticsData.matchesTrend < 0
                          ? "down"
                          : "neutral",
                  }
                : undefined
            }
          />

          <AnalyticsCard
            title="Avg. Recovery Time"
            value={`${analyticsData?.avgRecoveryTime || 0} days`}
            icon={Clock}
            description="Average time from lost to found"
            trend={
              analyticsData?.recoveryTimeTrend
                ? {
                    value: Math.abs(analyticsData.recoveryTimeTrend),
                    trend:
                      analyticsData.recoveryTimeTrend < 0
                        ? "up"
                        : analyticsData.recoveryTimeTrend > 0
                          ? "down"
                          : "neutral",
                  }
                : undefined
            }
          />

          <AnalyticsCard
            title="Success Rate"
            value={`${analyticsData?.successRate || 0}%`}
            icon={Award}
            description="Percentage of lost items recovered"
            trend={
              analyticsData?.successRateTrend
                ? {
                    value: analyticsData.successRateTrend,
                    trend:
                      analyticsData.successRateTrend > 0
                        ? "up"
                        : analyticsData.successRateTrend < 0
                          ? "down"
                          : "neutral",
                  }
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}

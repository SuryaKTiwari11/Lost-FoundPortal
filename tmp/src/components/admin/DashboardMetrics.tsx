"use client";

import {
  MetricsOverview,
  TimeFilterBar,
  ErrorState,
} from "@/components/admin/dashboard";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardMetrics() {
  const { metrics, loading, error, timeFilter, setTimeFilter, refreshMetrics } =
    useDashboardMetrics();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Dashboard Analytics</h2>
        <TimeFilterBar
          currentFilter={timeFilter}
          onFilterChange={setTimeFilter}
          onRefresh={refreshMetrics}
          disabled={loading}
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refreshMetrics} />
      ) : (
        <>
          {/* Main metrics cards */}
          <section>
            <h3 className="text-lg font-medium mb-4">Overview</h3>
            <MetricsOverview metrics={metrics} loading={loading} />
          </section>

          {/* Additional chart sections - simple placeholders for now */}
          <section className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="bg-[#1E1E1E] border border-[#333] rounded-lg p-4 shadow-md min-h-[300px]">
              <h3 className="text-lg font-medium mb-4">Activity Trends</h3>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <Skeleton className="h-[240px] w-full bg-[#333]" />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  Activity chart would render here
                </div>
              )}
            </div>

            <div className="bg-[#1E1E1E] border border-[#333] rounded-lg p-4 shadow-md min-h-[300px]">
              <h3 className="text-lg font-medium mb-4">
                Category Distribution
              </h3>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <Skeleton className="h-[240px] w-full bg-[#333]" />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  Category distribution chart would render here
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

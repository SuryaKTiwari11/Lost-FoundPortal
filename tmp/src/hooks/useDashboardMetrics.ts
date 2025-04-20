import { useState, useEffect } from "react";
import { DashboardMetrics as MetricsType, TimeFilter } from "@/types/analytics";
import { adminAPI } from "@/services/api";

const mockData: MetricsType = {
  totalLostItems: 245,
  totalFoundItems: 187,
  matchRate: 38,
  pendingVerifications: 17,
  resolvedLastWeek: 43,
  activeUsers: 321,
  newUsersThisMonth: 78,
  trends: {
    lostItemsTrend: { value: 12, direction: "up" },
    foundItemsTrend: { value: 8, direction: "up" },
    matchRateTrend: { value: 5, direction: "up" },
    pendingVerificationsTrend: { value: 15, direction: "down" },
  },
  categoryBreakdown: [
    { name: "Electronics", percentage: 32 },
    { name: "Clothing", percentage: 18 },
    { name: "Personal Items", percentage: 24 },
    { name: "Documents", percentage: 15 },
    { name: "Other", percentage: 11 },
  ],
  dailyActivity: [
    { date: "2025-03-21", lost: 12, found: 8, resolved: 5 },
    { date: "2025-03-22", lost: 8, found: 6, resolved: 3 },
    { date: "2025-03-23", lost: 15, found: 9, resolved: 7 },
    { date: "2025-03-24", lost: 10, found: 7, resolved: 6 },
    { date: "2025-03-25", lost: 13, found: 10, resolved: 8 },
    { date: "2025-03-26", lost: 9, found: 5, resolved: 4 },
    { date: "2025-03-27", lost: 11, found: 8, resolved: 5 },
  ],
  weekdayDistribution: [
    { day: "Monday", value: 18 },
    { day: "Tuesday", value: 15 },
    { day: "Wednesday", value: 19 },
    { day: "Thursday", value: 21 },
    { day: "Friday", value: 25 },
    { day: "Saturday", value: 14 },
    { day: "Sunday", value: 9 },
  ],
};

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<MetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardStats() {
      setLoading(true);
      setError(null);
      try {
        // In a real app, we'd use the actual API
        // const response = await adminAPI.getDashboardStats({ timeFilter });
        // if (response.success) {
        //   setMetrics(response.data);
        // } else {
        //   setError(response.error || "Failed to load dashboard data");
        // }

        // For now, simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 800));
        setMetrics(mockData);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        setError("An error occurred while loading the dashboard metrics");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [timeFilter]);

  const refreshMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, call the API
      // const response = await adminAPI.getDashboardStats({ timeFilter });
      // if (response.success) {
      //   setMetrics(response.data);
      // }

      // For now, simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMetrics(mockData);
    } catch (err) {
      console.error("Error refreshing dashboard metrics:", err);
      setError("An error occurred while refreshing the dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    loading,
    error,
    timeFilter,
    setTimeFilter,
    refreshMetrics,
  };
}

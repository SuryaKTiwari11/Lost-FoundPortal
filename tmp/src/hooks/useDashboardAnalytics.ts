import { useState, useEffect } from "react";
import { adminAPI } from "@/services/api";
import { toast } from "sonner";
import type { AnalyticsData } from "@/types/analytics";

export function useDashboardAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("30");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getDashboardAnalytics();

      if (response.success) {
        setAnalyticsData(response.data as AnalyticsData);
      } else {
        toast.error(response.error || "Failed to load analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("An error occurred while loading analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  return {
    analyticsData,
    isLoading,
    timeRange,
    setTimeRange,
    refreshAnalytics,
  };
}

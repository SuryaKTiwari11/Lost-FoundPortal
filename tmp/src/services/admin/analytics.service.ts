import { ApiResponse } from "@/types/ApiResponse";
import { AnalyticsData } from "@/types/analytics";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import ClaimRequest from "@/model/claimRequest.model";
import User from "@/model/user.model";

/**
 * Service for dashboard analytics functionality
 */
export class AnalyticsService {
  /**
   * Get dashboard analytics data based on timeframe
   */
  async getDashboardAnalytics(
    timeframe: "week" | "month" | "year" | "all" = "month"
  ): Promise<ApiResponse<AnalyticsData>> {
    try {
      await dbConnect();

      // Calculate start date based on timeframe
      const now = new Date();
      let startDate = new Date(0); // Default to all-time

      if (timeframe === "week") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === "month") {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
      } else if (timeframe === "year") {
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
      }

      // Base query for timeframe
      const dateQuery = { createdAt: { $gte: startDate } };

      // Initialize analytics data with proper typing
      const analyticsData: AnalyticsData = {
        totalFoundItems: 0,
        totalLostItems: 0,
        totalVerifiedItems: 0,
        totalClaimedItems: 0,
        totalClaimRequests: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        pendingClaims: 0,
        recoveryRate: 0,
        foundItemsByCategory: [],
        lostItemsByCategory: [],
        foundItemsByLocation: [],
        lostItemsByLocation: [],
        timeTrends: [],
        itemsByCategory: [],
        itemsByStatus: [],
        itemsByType: [],
        itemsByDate: [],
        matchRate: {
          total: 0,
          matched: 0,
          rate: 0,
        },
        resolutionRate: {
          total: 0,
          resolved: 0,
          rate: 0,
        },
        popularLocations: [],
        responseTime: {
          average: 0,
          min: 0,
          max: 0,
        },
      };

      try {
        analyticsData.totalFoundItems = await FoundItem.countDocuments({
          ...dateQuery,
        });
      } catch (e) {
        console.error("Error counting found items:", e);
      }

      try {
        analyticsData.totalLostItems = await LostItem.countDocuments({
          ...dateQuery,
        });
      } catch (e) {
        console.error("Error counting lost items:", e);
      }

      try {
        analyticsData.totalVerifiedItems = await FoundItem.countDocuments({
          ...dateQuery,
          $or: [{ status: "verified" }, { isVerified: true }],
        });
      } catch (e) {
        console.error("Error counting verified items:", e);
      }

      try {
        analyticsData.totalClaimedItems = await FoundItem.countDocuments({
          ...dateQuery,
          status: "claimed",
        });
      } catch (e) {
        console.error("Error counting claimed items:", e);
      }

      try {
        analyticsData.totalClaimRequests = await ClaimRequest.countDocuments({
          ...dateQuery,
        });
        analyticsData.approvedClaims = await ClaimRequest.countDocuments({
          ...dateQuery,
          status: "approved",
        });
        analyticsData.rejectedClaims = await ClaimRequest.countDocuments({
          ...dateQuery,
          status: "rejected",
        });
        analyticsData.pendingClaims = await ClaimRequest.countDocuments({
          ...dateQuery,
          status: "pending",
        });
      } catch (e) {
        console.error("Error counting claim requests:", e);
      }

      // Recovery rate
      if (analyticsData.totalLostItems > 0) {
        analyticsData.recoveryRate = Math.round(
          (analyticsData.totalClaimedItems / analyticsData.totalLostItems) * 100
        );
      }

      // Prepare data for the dashboard analytics component
      try {
        // Category distribution with colors
        const categoryColors = {
          Electronics: "#FF6B6B",
          Books: "#4ECDC4",
          Accessories: "#FFD166",
          Clothing: "#06D6A0",
          "ID Cards": "#118AB2",
          Keys: "#073B4C",
          Documents: "#EF476F",
          Others: "#3d348b",
        };

        const foundItemsByCategory = await FoundItem.aggregate([
          { $match: { ...dateQuery } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        const lostItemsByCategory = await LostItem.aggregate([
          { $match: { ...dateQuery } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        // Format category data for the UI
        analyticsData.itemsByCategory = [
          ...foundItemsByCategory.map((item) => ({
            category: item._id || "Unknown",
            count: item.count,
            color: categoryColors[item._id] || "#777777",
          })),
          ...lostItemsByCategory.map((item) => ({
            category: item._id || "Unknown",
            count: item.count,
            color: categoryColors[item._id] || "#777777",
          })),
        ];

        // Combine and deduplicate categories
        const categoryMap = new Map();
        analyticsData.itemsByCategory.forEach((item) => {
          if (categoryMap.has(item.category)) {
            categoryMap.set(item.category, {
              category: item.category,
              count: categoryMap.get(item.category).count + item.count,
              color: item.color,
            });
          } else {
            categoryMap.set(item.category, item);
          }
        });
        analyticsData.itemsByCategory = Array.from(categoryMap.values());

        // Status distribution
        const statusColors = {
          pending: "#FFD166",
          verified: "#06D6A0",
          rejected: "#EF476F",
          matched: "#118AB2",
          claimed: "#073B4C",
          lost: "#EF476F",
          found: "#06D6A0",
        };

        const foundStatus = await FoundItem.aggregate([
          { $match: { ...dateQuery } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const lostStatus = await LostItem.aggregate([
          { $match: { ...dateQuery } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        analyticsData.itemsByStatus = [
          ...foundStatus.map((item) => ({
            status: item._id || "Unknown",
            count: item.count,
            color: statusColors[item._id] || "#777777",
          })),
          ...lostStatus.map((item) => ({
            status: item._id || "Unknown",
            count: item.count,
            color: statusColors[item._id] || "#777777",
          })),
        ];

        // Item types (Lost vs Found)
        analyticsData.itemsByType = [
          {
            type: "Lost",
            count: analyticsData.totalLostItems,
            color: "#EF476F",
          },
          {
            type: "Found",
            count: analyticsData.totalFoundItems,
            color: "#06D6A0",
          },
        ];

        // Items by date for time trends
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Create a date map for the last 7 days
        const dateMap = new Map();
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);

          const dateKey = date.toISOString().split("T")[0];
          dateMap.set(dateKey, {
            date: dateKey,
            lost: 0,
            found: 0,
            matched: 0,
          });
        }

        // Fill in lost items data
        const lostByDate = await LostItem.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
        ]);

        lostByDate.forEach((item) => {
          if (dateMap.has(item._id)) {
            dateMap.get(item._id).lost = item.count;
          }
        });

        // Fill in found items data
        const foundByDate = await FoundItem.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
        ]);

        foundByDate.forEach((item) => {
          if (dateMap.has(item._id)) {
            dateMap.get(item._id).found = item.count;
          }
        });

        // Fill matched items data (items with claims)
        const matchedByDate = await FoundItem.aggregate([
          {
            $match: {
              createdAt: { $gte: thirtyDaysAgo },
              status: "claimed",
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
        ]);

        matchedByDate.forEach((item) => {
          if (dateMap.has(item._id)) {
            dateMap.get(item._id).matched = item.count;
          }
        });

        // Convert map to array for the UI
        analyticsData.itemsByDate = Array.from(dateMap.values());

        // Match rate
        const totalItems =
          analyticsData.totalLostItems + analyticsData.totalFoundItems;
        const matchedItems = analyticsData.totalClaimedItems;
        analyticsData.matchRate = {
          total: totalItems,
          matched: matchedItems,
          rate:
            totalItems > 0
              ? Math.round((matchedItems / totalItems) * 100 * 10) / 10
              : 0,
        };

        // Resolution rate
        const resolvedItems =
          analyticsData.totalClaimedItems + analyticsData.rejectedClaims;
        analyticsData.resolutionRate = {
          total: totalItems,
          resolved: resolvedItems,
          rate:
            totalItems > 0
              ? Math.round((resolvedItems / totalItems) * 100 * 10) / 10
              : 0,
        };

        // Popular locations
        const foundLocations = await FoundItem.aggregate([
          { $match: { foundLocation: { $exists: true, $ne: "" } } },
          { $group: { _id: "$foundLocation", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]);

        const lostLocations = await LostItem.aggregate([
          { $match: { lostLocation: { $exists: true, $ne: "" } } },
          { $group: { _id: "$lostLocation", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]);

        // Combine and deduplicate locations
        const locationMap = new Map();

        foundLocations.forEach((loc) => {
          locationMap.set(loc._id, {
            location: loc._id,
            count: loc.count,
          });
        });

        lostLocations.forEach((loc) => {
          if (locationMap.has(loc._id)) {
            locationMap.set(loc._id, {
              location: loc._id,
              count: locationMap.get(loc._id).count + loc.count,
            });
          } else {
            locationMap.set(loc._id, {
              location: loc._id,
              count: loc.count,
            });
          }
        });

        analyticsData.popularLocations = Array.from(locationMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Response time (mock data for now)
        analyticsData.responseTime = {
          average: 24,
          min: 1,
          max: 72,
        };
      } catch (e) {
        console.error("Error processing analytics data:", e);
      }

      return {
        success: true,
        data: analyticsData,
      };
    } catch (error: any) {
      console.error("Error retrieving analytics data:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve analytics data",
      };
    }
  }
}

// Export a singleton instance
export const analyticsService = new AnalyticsService();

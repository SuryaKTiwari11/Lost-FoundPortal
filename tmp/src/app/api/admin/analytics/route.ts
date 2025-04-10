import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import ClaimRequest from "@/model/claimRequest.model";
import type { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get timeframe from query params (default to 'all')
    const timeframe = request.nextUrl.searchParams.get("timeframe") || "all";

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

    // Overall stats
    const [
      totalFoundItems,
      totalLostItems,
      totalVerifiedItems,
      totalClaimedItems,
      totalClaimRequests,
      approvedClaims,
      rejectedClaims,
      pendingClaims,
    ] = await Promise.all([
      FoundItem.countDocuments({ ...dateQuery }),
      LostItem.countDocuments({ ...dateQuery }),
      FoundItem.countDocuments({ ...dateQuery, isVerified: true }),
      FoundItem.countDocuments({ ...dateQuery, status: "claimed" }),
      ClaimRequest.countDocuments({ ...dateQuery }),
      ClaimRequest.countDocuments({ ...dateQuery, status: "approved" }),
      ClaimRequest.countDocuments({ ...dateQuery, status: "rejected" }),
      ClaimRequest.countDocuments({ ...dateQuery, status: "pending" }),
    ]);

    // Category distribution
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

    // Time trends (items by day for last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const foundItemsByDay = await FoundItem.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const lostItemsByDay = await LostItem.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Transform data for time series chart
    const timeTrends = [];

    // Create a map of dates for the past 30 days
    const dateMap = new Map();
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      dateMap.set(dateKey, {
        date: dateKey,
        foundItems: 0,
        lostItems: 0,
      });
    }

    // Fill in found items data
    foundItemsByDay.forEach((item) => {
      const dateKey = `${item._id.year}-${item._id.month}-${item._id.day}`;
      if (dateMap.has(dateKey)) {
        dateMap.get(dateKey).foundItems = item.count;
      }
    });

    // Fill in lost items data
    lostItemsByDay.forEach((item) => {
      const dateKey = `${item._id.year}-${item._id.month}-${item._id.day}`;
      if (dateMap.has(dateKey)) {
        dateMap.get(dateKey).lostItems = item.count;
      }
    });

    // Convert map to array and sort by date
    dateMap.forEach((value) => timeTrends.push(value));
    timeTrends.sort((a, b) => a.date.localeCompare(b.date));

    // Recovery rate
    const recoveryRate =
      totalLostItems > 0
        ? Math.round((totalClaimedItems / totalLostItems) * 100)
        : 0;

    // Location data
    const foundItemsByLocation = await FoundItem.aggregate([
      { $match: { ...dateQuery } },
      { $group: { _id: "$foundLocation", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }, // Top 10 locations
    ]);

    const lostItemsByLocation = await LostItem.aggregate([
      { $match: { ...dateQuery } },
      { $group: { _id: "$lostLocation", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }, // Top 10 locations
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalFoundItems,
          totalLostItems,
          totalVerifiedItems,
          totalClaimedItems,
          totalClaimRequests,
          approvedClaims,
          rejectedClaims,
          pendingClaims,
          recoveryRate,
        },
        categoryDistribution: {
          foundItems: foundItemsByCategory,
          lostItems: lostItemsByCategory,
        },
        locationDistribution: {
          foundItems: foundItemsByLocation,
          lostItems: lostItemsByLocation,
        },
        timeTrends,
        timeframe,
      },
    });
  } catch (error) {
    console.error("Error retrieving analytics data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

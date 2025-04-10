"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { adminAPI } from "@/services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AnalyticsData {
  itemsByCategory: {
    category: string;
    count: number;
    color: string;
  }[];
  itemsByStatus: {
    status: string;
    count: number;
    color: string;
  }[];
  itemsByType: {
    type: string;
    count: number;
    color: string;
  }[];
  itemsByDate: {
    date: string;
    lost: number;
    found: number;
    matched: number;
  }[];
  matchRate: {
    total: number;
    matched: number;
    rate: number;
  };
  resolutionRate: {
    total: number;
    resolved: number;
    rate: number;
  };
  popularLocations: {
    location: string;
    count: number;
  }[];
  responseTime: {
    average: number;
    min: number;
    max: number;
  };
}

export default function DashboardAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getAnalytics(timeRange);
      if (response.success) {
        setAnalyticsData(response.data as AnalyticsData);
      } else {
        toast.error(response.error || "Failed to load analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("An error occurred while loading analytics");
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Mock data for development and testing
  const mockAnalyticsData: AnalyticsData = {
    itemsByCategory: [
      { category: "Electronics", count: 45, color: "#FF6B6B" },
      { category: "Clothing", count: 32, color: "#4ECDC4" },
      { category: "Accessories", count: 28, color: "#FFD166" },
      { category: "Documents", count: 22, color: "#06D6A0" },
      { category: "Keys", count: 18, color: "#118AB2" },
      { category: "Other", count: 12, color: "#073B4C" },
    ],
    itemsByStatus: [
      { status: "Pending", count: 25, color: "#FFD166" },
      { status: "Verified", count: 72, color: "#06D6A0" },
      { status: "Rejected", count: 8, color: "#EF476F" },
      { status: "Matched", count: 34, color: "#118AB2" },
      { status: "Claimed", count: 18, color: "#073B4C" },
    ],
    itemsByType: [
      { type: "Lost", count: 88, color: "#EF476F" },
      { type: "Found", count: 69, color: "#06D6A0" },
    ],
    itemsByDate: [
      {
        date: "2023-01-01",
        lost: 5,
        found: 3,
        matched: 1,
      },
      {
        date: "2023-01-02",
        lost: 7,
        found: 4,
        matched: 2,
      },
      {
        date: "2023-01-03",
        lost: 3,
        found: 6,
        matched: 1,
      },
      {
        date: "2023-01-04",
        lost: 8,
        found: 5,
        matched: 3,
      },
      {
        date: "2023-01-05",
        lost: 6,
        found: 7,
        matched: 4,
      },
      {
        date: "2023-01-06",
        lost: 9,
        found: 4,
        matched: 2,
      },
      {
        date: "2023-01-07",
        lost: 4,
        found: 8,
        matched: 3,
      },
    ],
    matchRate: {
      total: 157,
      matched: 52,
      rate: 33.1,
    },
    resolutionRate: {
      total: 157,
      resolved: 70,
      rate: 44.6,
    },
    popularLocations: [
      { location: "Library", count: 23 },
      { location: "Student Center", count: 18 },
      { location: "Cafeteria", count: 15 },
      { location: "Gym", count: 12 },
      { location: "Lecture Hall", count: 10 },
    ],
    responseTime: {
      average: 24,
      min: 1,
      max: 72,
    },
  };

  // Use mock data if no real data is available
  const data = analyticsData || mockAnalyticsData;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color?: string;
      fill?: string;
    }>;
    label?: string;
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#242424] p-3 border border-[#333333] rounded-md shadow-lg">
          <p className="text-gray-300 font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p
              key={`item-${index}`}
              style={{ color: entry.color || entry.fill }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
        <Tabs
          defaultValue="month"
          value={timeRange}
          onValueChange={setTimeRange}
          className="w-[400px]"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
        </div>
      ) : (
        <>
          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Match Rate */}
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Match Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.matchRate.rate}%</div>
                <p className="text-xs text-gray-400 mt-1">
                  {data.matchRate.matched} matched out of {data.matchRate.total}{" "}
                  items
                </p>
                <div className="mt-2 h-2 w-full bg-[#333333] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${data.matchRate.rate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resolution Rate */}
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Resolution Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.resolutionRate.rate}%
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {data.resolutionRate.resolved} resolved out of{" "}
                  {data.resolutionRate.total} items
                </p>
                <div className="mt-2 h-2 w-full bg-[#333333] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${data.resolutionRate.rate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Average Response Time */}
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Avg. Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.responseTime.average} hrs
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Range: {data.responseTime.min} - {data.responseTime.max} hrs
                </p>
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="font-medium text-xs text-blue-400">
                    {data.responseTime.min}h
                  </span>
                  <div className="flex-1 h-2 bg-[#333333] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                      style={{
                        width: "100%",
                      }}
                    />
                  </div>
                  <span className="font-medium text-xs text-blue-400">
                    {data.responseTime.max}h
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Items Distribution */}
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Items Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.itemsByType.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EF476F]" />
                    <span className="text-xs text-gray-400">
                      Lost:{" "}
                      {data.itemsByType.find((i) => i.type === "Lost")?.count ||
                        0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#06D6A0]" />
                    <span className="text-xs text-gray-400">
                      Found:{" "}
                      {data.itemsByType.find((i) => i.type === "Found")
                        ?.count || 0}
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full bg-[#333333] rounded-full overflow-hidden flex">
                  {data.itemsByType.map((item, index) => (
                    <div
                      key={index}
                      className="h-full"
                      style={{
                        width: `${(item.count / data.itemsByType.reduce((sum, i) => sum + i.count, 0)) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Over Time */}
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>Activity Over Time</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.itemsByDate}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                      <XAxis
                        dataKey="date"
                        stroke="#999999"
                        tickFormatter={formatDate}
                      />
                      <YAxis stroke="#999999" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="lost"
                        name="Lost"
                        stroke="#EF476F"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="found"
                        name="Found"
                        stroke="#06D6A0"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="matched"
                        name="Matched"
                        stroke="#118AB2"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Items by Category */}
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>Items by Category</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.itemsByCategory}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                      <XAxis type="number" stroke="#999999" />
                      <YAxis
                        dataKey="category"
                        type="category"
                        stroke="#999999"
                        width={100}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="count" name="Count">
                        {data.itemsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Items by Status */}
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>Items by Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.itemsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({
                          cx,
                          cy,
                          midAngle,
                          outerRadius,
                          percent,
                          status,
                        }) => {
                          const radius = outerRadius + 10;
                          const x =
                            cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                          const y =
                            cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                          return (
                            <text
                              x={x}
                              y={y}
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              className="text-xs"
                              fill="#999999"
                            >
                              {status} ({(percent * 100).toFixed(0)}%)
                            </text>
                          );
                        }}
                      >
                        {data.itemsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Popular Locations */}
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>Popular Locations</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.popularLocations}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                      <XAxis dataKey="location" stroke="#999999" />
                      <YAxis stroke="#999999" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="count"
                        name="Items"
                        fill="#FFD166"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

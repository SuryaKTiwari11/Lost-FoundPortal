import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import {
  SearchIcon,
  UploadIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";

export default function DashboardSummary() {
  const { analytics, isLoading } = useDashboardAnalytics();

  const summaryItems = [
    {
      title: "Lost Items",
      value: analytics?.totalLostItems || 0,
      icon: <SearchIcon className="h-6 w-6" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Found Items",
      value: analytics?.totalFoundItems || 0,
      icon: <UploadIcon className="h-6 w-6" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Matches",
      value: analytics?.totalMatches || 0,
      icon: <CheckCircleIcon className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pending Claims",
      value: analytics?.pendingClaims || 0,
      icon: <ClockIcon className="h-6 w-6" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="border border-[#333] bg-[#1E1E1E]">
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 rounded-full mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {summaryItems.map((item, index) => (
        <Card key={index} className="border border-[#333] bg-[#1E1E1E]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${item.bgColor}`}>
                <div className={item.color}>{item.icon}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400">{item.title}</p>
            <h3 className="text-2xl font-semibold mt-1">{item.value}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const trendVariants = cva("text-xs font-medium flex items-center gap-0.5", {
  variants: {
    trend: {
      up: "text-green-500",
      down: "text-red-500",
      neutral: "text-gray-400",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
});

interface TrendProps extends VariantProps<typeof trendVariants> {
  value: number;
}

function TrendIndicator({ value, trend }: TrendProps) {
  return (
    <span className={trendVariants({ trend })}>
      {trend === "up" ? "↑" : trend === "down" ? "↓" : "●"} {value}%
      <span className="text-xs text-gray-400 ml-1">from last period</span>
    </span>
  );
}

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  className?: string;
}

export function AnalyticsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: AnalyticsCardProps) {
  return (
    <Card className={`bg-[#1E1E1E] border-[#333] shadow-md ${className || ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-[#FFD166]" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}

        {trend && (
          <div className="flex items-center mt-2">
            <TrendIndicator value={trend.value} trend={trend.trend} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { TimeFilter } from "@/types/analytics";

interface TimeFilterBarProps {
  currentFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
  onRefresh: () => void;
  disabled?: boolean;
}

export function TimeFilterBar({
  currentFilter,
  onFilterChange,
  onRefresh,
  disabled = false,
}: TimeFilterBarProps) {
  const filters: { value: TimeFilter; label: string }[] = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="flex bg-muted rounded-md overflow-hidden mr-4">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={currentFilter === filter.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            disabled={disabled}
            className={`rounded-none px-3 py-1 ${
              currentFilter === filter.value ? "bg-secondary" : ""
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={disabled}
      >
        Refresh
      </Button>
    </div>
  );
}

import { useState } from "react";
import { Filter, X, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITEM_CATEGORIES } from "@/constants/categories";
import type { SearchFilters } from "@/hooks/useSearchLostItems";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: any) => void;
  onClearFilters: () => void;
}

export function SearchFiltersComponent({
  filters,
  onFilterChange,
  onClearFilters,
}: SearchFiltersProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [locationFilterOpen, setLocationFilterOpen] = useState(false);
  const [locationInput, setLocationInput] = useState(filters.location || "");

  const hasActiveFilters =
    !!filters.category ||
    !!filters.dateRange?.start ||
    !!filters.dateRange?.end ||
    !!filters.location;

  const handleDateSelect = (date: Date | undefined, type: "start" | "end") => {
    const currentDateRange = filters.dateRange || {};

    onFilterChange("dateRange", {
      ...currentDateRange,
      [type]: date,
    });
  };

  const handleLocationApply = () => {
    onFilterChange("location", locationInput);
    setLocationFilterOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Category Filter */}
      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange("category", value)}
      >
        <SelectTrigger className="w-[140px] bg-[#252525] border-[#333333] rounded-lg h-10 focus:ring-2 focus:ring-[#FFD166]/50">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="bg-[#1E1E1E] border-[#333333]">
          {ITEM_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`gap-2 h-10 bg-[#252525] border-[#333333] hover:bg-[#333] ${
              filters.dateRange?.start || filters.dateRange?.end
                ? "text-[#FFD166] border-[#FFD166]"
                : ""
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Date Range</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-[#1E1E1E] border-[#333333]"
          align="start"
        >
          <div className="p-3 border-b border-[#333333]">
            <div className="text-sm font-medium mb-2">Select date range</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-400 mb-1">From:</div>
                <div className="text-sm">
                  {filters.dateRange?.start
                    ? filters.dateRange.start.toLocaleDateString()
                    : "Not set"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">To:</div>
                <div className="text-sm">
                  {filters.dateRange?.end
                    ? filters.dateRange.end.toLocaleDateString()
                    : "Not set"}
                </div>
              </div>
            </div>
          </div>
          <CalendarComponent
            mode="range"
            defaultMonth={filters.dateRange?.start}
            selected={{
              from: filters.dateRange?.start,
              to: filters.dateRange?.end,
            }}
            onSelect={(range) => {
              onFilterChange("dateRange", {
                start: range?.from,
                end: range?.to,
              });
            }}
            numberOfMonths={1}
            disabled={{ after: new Date() }}
            className="p-3"
          />
          <div className="p-3 border-t border-[#333333] flex justify-end gap-2">
            <Button
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                onFilterChange("dateRange", {});
                setDatePickerOpen(false);
              }}
            >
              Clear dates
            </Button>
            <Button
              className="h-8 text-xs bg-[#FFD166] text-black hover:bg-[#e6bd5c]"
              onClick={() => setDatePickerOpen(false)}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Location Filter */}
      <Popover open={locationFilterOpen} onOpenChange={setLocationFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`gap-2 h-10 bg-[#252525] border-[#333333] hover:bg-[#333] ${
              filters.location ? "text-[#FFD166] border-[#FFD166]" : ""
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Location</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-3 bg-[#1E1E1E] border-[#333333]"
          align="start"
        >
          <div className="text-sm font-medium mb-2">Filter by location</div>
          <div className="space-y-3">
            <Input
              placeholder="Enter location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="bg-[#252525] border-[#333333]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="h-8 text-xs"
                onClick={() => {
                  setLocationInput("");
                  onFilterChange("location", undefined);
                  setLocationFilterOpen(false);
                }}
              >
                Clear
              </Button>
              <Button
                className="h-8 text-xs bg-[#FFD166] text-black hover:bg-[#e6bd5c]"
                onClick={handleLocationApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear all filters button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-10 text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}

      {/* Active filter indicators */}
      <div className="flex flex-wrap gap-2 ml-1">
        {filters.category && (
          <div className="bg-[#333] text-white text-xs rounded-full px-2 py-1 flex items-center">
            <span className="mr-1">{filters.category}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFilterChange("category", undefined)}
              className="h-4 w-4 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {(filters.dateRange?.start || filters.dateRange?.end) && (
          <div className="bg-[#333] text-white text-xs rounded-full px-2 py-1 flex items-center">
            <span className="mr-1">
              {filters.dateRange?.start
                ? filters.dateRange.start.toLocaleDateString()
                : "Any"}{" "}
              -
              {filters.dateRange?.end
                ? filters.dateRange.end.toLocaleDateString()
                : "Any"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFilterChange("dateRange", {})}
              className="h-4 w-4 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {filters.location && (
          <div className="bg-[#333] text-white text-xs rounded-full px-2 py-1 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="mr-1">{filters.location}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFilterChange("location", undefined)}
              className="h-4 w-4 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

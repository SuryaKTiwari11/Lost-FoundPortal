import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Time range:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-[130px] bg-[#252525] border-[#333333] rounded-lg text-sm">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent className="bg-[#1E1E1E] border-[#333333]">
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="90">Last 90 days</SelectItem>
          <SelectItem value="365">Last year</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

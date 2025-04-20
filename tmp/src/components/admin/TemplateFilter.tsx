import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateFilterProps {
  filterType: string;
  onFilterChange: (value: string) => void;
}

export function TemplateFilter({
  filterType,
  onFilterChange,
}: TemplateFilterProps) {
  return (
    <div className="p-4 border-b border-[#333333] bg-[#242424]">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-400">Filter:</div>
        <Select value={filterType} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px] bg-[#1E1E1E] border-[#333333]">
            <SelectValue placeholder="All Templates" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E1E1E] border-[#333333]">
            <SelectItem value="all">All Templates</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="match">Match</SelectItem>
            <SelectItem value="claim">Claim</SelectItem>
            <SelectItem value="verification">Verification</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

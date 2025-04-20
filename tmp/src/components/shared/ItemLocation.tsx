import { MapPin } from "lucide-react";

interface ItemLocationProps {
  location: string;
  showIcon?: boolean;
}

export function ItemLocation({
  location,
  showIcon = false,
}: ItemLocationProps) {
  return (
    <div className="flex items-center transition-all duration-300">
      {showIcon && <MapPin className="h-4 w-4 mr-1 text-gray-400" />}
      <span className="font-medium mr-1">Location:</span>
      {location}
    </div>
  );
}

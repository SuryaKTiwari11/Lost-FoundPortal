import { CardDescription } from "@/components/ui/card";
import { formatDate } from "@/utils/dateUtils";

interface ItemDateProps {
  date: string | Date;
}

export function ItemDate({ date }: ItemDateProps) {
  return (
    <CardDescription className="text-gray-400 transition-all duration-300">
      {formatDate(date)}
    </CardDescription>
  );
}

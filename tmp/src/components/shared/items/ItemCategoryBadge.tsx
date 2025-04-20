import { cn } from "@/lib/utils";

interface ItemCategoryBadgeProps {
  category: string;
  className?: string;
}

export function ItemCategoryBadge({
  category,
  className,
}: ItemCategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block bg-[#FFD166] text-[#121212] rounded px-2 py-1 text-xs font-medium",
        className
      )}
    >
      {category}
    </span>
  );
}

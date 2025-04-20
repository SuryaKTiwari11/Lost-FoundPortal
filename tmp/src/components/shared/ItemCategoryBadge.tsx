interface ItemCategoryBadgeProps {
  category: string;
}

export function ItemCategoryBadge({ category }: ItemCategoryBadgeProps) {
  return (
    <span className="inline-block bg-[#FFD166] text-[#121212] rounded px-2 py-1 text-xs mr-2 font-medium transition-all duration-300 hover:bg-[#e6bd5c]">
      {category}
    </span>
  );
}

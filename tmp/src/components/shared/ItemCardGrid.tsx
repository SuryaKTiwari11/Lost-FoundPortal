import Link from "next/link";
import ItemCard from "./ItemCard";

interface Item {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  imageURL?: string;
  lostLocation?: string;
  foundLocation?: string;
  lostDate?: string;
  foundDate?: string;
  status: string;
}

interface ItemCardGridProps {
  items: Item[];
  itemType: "lost" | "found";
  columns?: number;
}

export default function ItemCardGrid({
  items,
  itemType,
  columns = 3,
}: ItemCardGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No items to display.</p>
      </div>
    );
  }

  // Determine grid columns based on the 'columns' prop
  const gridCols =
    {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    }[columns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {items.map((item) => (
        <ItemCard
          key={item._id}
          id={item._id}
          title={item.itemName}
          category={item.category}
          description={item.description}
          imageUrl={item.imageURL}
          location={
            itemType === "lost" ? item.lostLocation : item.foundLocation
          }
          date={itemType === "lost" ? item.lostDate : item.foundDate}
          status={item.status}
          detailsUrl={`/${itemType}-items/${item._id}`}
        />
      ))}
    </div>
  );
}

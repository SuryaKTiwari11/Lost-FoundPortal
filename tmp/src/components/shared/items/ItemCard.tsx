"use client";

import { LostItem } from "@/model/lostItem.model";
import { FoundItem } from "@/model/foundItem.model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ItemImage } from "@/components/shared/items/ItemImage";
import { ItemCategoryBadge } from "@/components/shared/items/ItemCategoryBadge";
import { MapPin, Calendar } from "lucide-react";
import { formatDistance } from "date-fns";
import { useRouter } from "next/navigation";

export type ItemType = "lost" | "found";

// Union type that accepts either LostItem or FoundItem
type Item = LostItem | FoundItem;

interface ItemCardProps {
  item: Item;
  type: ItemType;
  className?: string;
  showFooter?: boolean;
}

export default function ItemCard({
  item,
  type,
  className,
  showFooter = true,
}: ItemCardProps) {
  const router = useRouter();

  const navigateToDetail = () => {
    router.push(`/${type}-items/${item._id}`);
  };

  // Calculate time ago
  const timeAgo = formatDistance(new Date(item.date), new Date(), {
    addSuffix: true,
  });

  return (
    <Card
      className={cn(
        "overflow-hidden border-[#333] bg-[#1A1A1A] text-white hover:shadow-lg transition-all duration-300 hover:border-[#444] cursor-pointer",
        className
      )}
      onClick={navigateToDetail}
    >
      <div className="relative h-48 w-full bg-[#2A2A2A]">
        <ItemImage
          src={item.image || null}
          alt={item.name}
          category={item.category}
          fill={true}
        />

        {/* Item type overlay badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          {type === "lost" ? "Lost" : "Found"}
        </div>
      </div>

      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl text-white">{item.name}</CardTitle>
        <div className="flex items-center mt-1">
          <ItemCategoryBadge category={item.category} className="mr-2" />
          <CardDescription className="text-gray-400 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {timeAgo}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p className="text-gray-300 mb-3 line-clamp-2">{item.description}</p>
      </CardContent>

      {showFooter && (
        <CardFooter className="p-4 pt-0 text-gray-400 text-sm">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{item.location}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

import { ILostItem } from "@/models/LostItem";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReliableImage } from "@/components/ui/reliable-image";

interface ItemCardProps {
  item: ILostItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="overflow-hidden border-[#333] bg-[#1A1A1A] text-white hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full bg-[#2A2A2A]">
        {item.image ? (
          <ReliableImage
            src={item.image}
            alt={item.name}
            category={item.category}
            fill={true}
            className="h-full w-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ReliableImage
              src={null}
              category={item.category}
              alt="Category placeholder"
              className="h-32 w-32"
            />
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl text-white">{item.name}</CardTitle>
        <div className="flex items-center mt-1">
          <span className="inline-block bg-[#FFD166] text-[#121212] rounded px-2 py-1 text-xs mr-2 font-medium">
            {item.category}
          </span>
          <CardDescription className="text-gray-400">
            {new Date(item.date).toLocaleDateString()}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p className="text-gray-300 mb-3 line-clamp-2">{item.description}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0 text-gray-400 text-sm">
        <span className="font-medium">Location:</span> {item.location}
      </CardFooter>
    </Card>
  );
}

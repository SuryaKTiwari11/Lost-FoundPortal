import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ItemCardProps {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  location?: string;
  date?: string;
  status: string;
  detailsUrl: string;
}

export default function ItemCard({
  id,
  title,
  category,
  description,
  imageUrl,
  location,
  date,
  status,
  detailsUrl,
}: ItemCardProps) {
  // Function to format date for better display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let badgeClass = "";

    switch (status) {
      case "pending":
        badgeClass = "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30";
        break;
      case "verified":
        badgeClass = "bg-green-500/20 text-green-300 hover:bg-green-500/30";
        break;
      case "resolved":
        badgeClass = "bg-green-500/20 text-green-300 hover:bg-green-500/30";
        break;
      case "claimed":
        badgeClass = "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30";
        break;
      case "rejected":
        badgeClass = "bg-red-500/20 text-red-300 hover:bg-red-500/30";
        break;
      default:
        badgeClass = "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30";
    }

    return <Badge className={`${badgeClass} capitalize`}>{status}</Badge>;
  };

  return (
    <Card className="overflow-hidden bg-[#1E1E1E] border-[#333] text-white h-full flex flex-col transition-all hover:border-[#FFD166]/50 hover:shadow-md">
      <div className="relative aspect-video bg-[#252525]">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No image
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {renderStatusBadge(status)}
        </div>

        {/* Category badge */}
        <div className="absolute bottom-2 left-2">
          <Badge
            variant="outline"
            className="bg-black/50 backdrop-blur-sm border-white/10"
          >
            <Tag className="h-3 w-3 mr-1" /> {category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg line-clamp-1 mb-2">{title}</h3>

        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
          {description || "No description provided"}
        </p>

        {/* Item details */}
        <div className="space-y-2 mt-3">
          {location && (
            <div className="flex items-center text-sm text-gray-400">
              <MapPin className="h-4 w-4 mr-1 text-[#FFD166]" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}

          {date && (
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-1 text-[#FFD166]" />
              <span>{formatDate(date)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full border-[#333] hover:bg-[#252525] hover:text-[#FFD166]"
          asChild
        >
          <Link href={detailsUrl}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

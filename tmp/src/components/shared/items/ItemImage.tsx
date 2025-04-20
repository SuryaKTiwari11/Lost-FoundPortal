import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ItemImageProps {
  src: string | null;
  alt: string;
  category: string;
  fill?: boolean;
  className?: string;
}

export function ItemImage({
  src,
  alt,
  category,
  fill = false,
  className,
}: ItemImageProps) {
  // Generate color based on category (consistent for same category)
  const generateColorFromString = (str: string) => {
    const colors = [
      "bg-blue-500/20",
      "bg-red-500/20",
      "bg-green-500/20",
      "bg-purple-500/20",
      "bg-yellow-500/20",
      "bg-pink-500/20",
      "bg-indigo-500/20",
      "bg-orange-500/20",
      "bg-teal-500/20",
    ];

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use the hash to pick a color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getCategoryIcon = (category: string): React.ReactNode => {
    // Just a simple representation, you would likely use actual icons
    const firstLetter = category.charAt(0).toUpperCase();
    return (
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-4xl font-bold text-white/40">{firstLetter}</span>
      </div>
    );
  };

  if (src) {
    return (
      <div className={cn("relative", className, fill ? "h-full w-full" : "")}>
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill={true}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={300}
            height={300}
            className="object-cover"
          />
        )}
      </div>
    );
  }

  // Fallback placeholder with category-specific styling
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        generateColorFromString(category),
        fill ? "h-full w-full" : "",
        className
      )}
    >
      {getCategoryIcon(category)}
    </div>
  );
}

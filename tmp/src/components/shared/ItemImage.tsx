import { ReliableImage } from "@/components/ui/reliable-image";

interface ItemImageProps {
  image: string | null | undefined;
  name: string;
  category: string;
}

export function ItemImage({ image, name, category }: ItemImageProps) {
  return (
    <div className="relative h-48 w-full bg-[#2A2A2A]">
      {image ? (
        <ReliableImage
          src={image}
          alt={name}
          category={category}
          fill={true}
          className="h-full w-full object-cover transition-all duration-300"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <ReliableImage
            src={null}
            category={category}
            alt="Category placeholder"
            className="h-32 w-32 transition-all duration-300"
          />
        </div>
      )}
    </div>
  );
}

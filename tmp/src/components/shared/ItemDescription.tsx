interface ItemDescriptionProps {
  description: string;
  maxLines?: number;
}

export function ItemDescription({
  description,
  maxLines = 2,
}: ItemDescriptionProps) {
  const lineClampClass = `line-clamp-${maxLines}`;

  return (
    <p
      className={`text-gray-300 mb-3 ${lineClampClass} transition-all duration-300`}
    >
      {description}
    </p>
  );
}

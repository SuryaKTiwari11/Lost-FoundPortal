import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ItemCard from "@/components/shared/ItemCard";
import { Button } from "@/components/ui/button";
import type { LostItemFormData } from "@/types";

interface SearchResultsProps {
  results: LostItemFormData[];
  isSearching: boolean;
  totalResults: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchPerformed: boolean;
}

export function SearchResults({
  results,
  isSearching,
  totalResults,
  page,
  pageSize,
  onPageChange,
  searchPerformed,
}: SearchResultsProps) {
  const router = useRouter();

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / pageSize);

  // Navigate to item details page
  const handleItemClick = (itemId: string) => {
    router.push(`/lost-items/${itemId}`);
  };

  // No search performed yet
  if (!searchPerformed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-center mb-2">
          Enter search criteria to find lost items
        </p>
        <p className="text-sm text-gray-500">
          You can search by name, description, or use filters
        </p>
      </div>
    );
  }

  // Loading state
  if (isSearching) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
      </div>
    );
  }

  // No results
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-center mb-2">No items found matching your search</p>
        <p className="text-sm text-gray-500">
          Try adjusting your search terms or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="text-sm text-gray-400">
        Showing {(page - 1) * pageSize + 1}-
        {Math.min(page * pageSize, totalResults)} of {totalResults} results
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <ItemCard
            key={item._id}
            item={item}
            onClick={() => handleItemClick(item._id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="bg-[#252525] border-[#333333] hover:bg-[#333]"
          >
            Previous
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Complex logic to show 5 pages max
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (page <= 3) {
              pageNumber = i + 1;
            } else if (page >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = page - 2 + i;
            }

            return (
              <Button
                key={i}
                variant={pageNumber === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className={
                  pageNumber === page
                    ? "bg-[#FFD166] text-black hover:bg-[#e6bd5c]"
                    : "bg-[#252525] border-[#333333] hover:bg-[#333]"
                }
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="bg-[#252525] border-[#333333] hover:bg-[#333]"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

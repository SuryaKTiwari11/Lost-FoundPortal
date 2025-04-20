import { useState, useEffect } from "react";

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
  createdAt: string;
}

interface UseRecentItemsReturn {
  items: Item[];
  isLoading: boolean;
  error: Error | null;
}

export function useRecentItems(
  itemType: "lost" | "found",
  limit: number = 10
): UseRecentItemsReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRecentItems() {
      try {
        setIsLoading(true);
        setError(null);

        // Determine which API endpoint to use based on itemType
        const endpoint =
          itemType === "lost" ? "/api/lost-items" : "/api/found-items";

        const response = await fetch(`${endpoint}?limit=${limit}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch recent ${itemType} items`);
        }

        const data = await response.json();

        if (data.success) {
          setItems(data.data || []);
        } else {
          throw new Error(
            data.error || `Failed to fetch recent ${itemType} items`
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error(`Error fetching recent ${itemType} items:`, err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentItems();
  }, [itemType, limit]);

  return { items, isLoading, error };
}

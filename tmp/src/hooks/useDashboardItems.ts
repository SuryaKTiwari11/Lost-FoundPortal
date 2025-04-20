import { useState, useEffect } from "react";
import { Session } from "next-auth";

interface LostItem {
  _id: string;
  itemName: string;
  category: string;
  lostLocation: string;
  lostDate: string;
  status: string;
  createdAt: string;
}

interface FoundItem {
  _id: string;
  itemName: string;
  category: string;
  foundLocation: string;
  foundDate: string;
  status: string;
  createdAt: string;
}

interface UseDashboardItemsReturn {
  lostItems: LostItem[];
  foundItems: FoundItem[];
  isLoading: boolean;
  error: Error | null;
}

export function useDashboardItems(
  session: Session | null
): UseDashboardItemsReturn {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserItems() {
      if (!session?.user?.email) return;

      try {
        setIsLoading(true);

        // Fetch lost items reported by the user
        const lostResponse = await fetch(
          `/api/lost-items?reporter=${encodeURIComponent(session.user.email)}`
        );
        const lostData = await lostResponse.json();

        // Fetch found items reported by the user
        const foundResponse = await fetch(
          `/api/found-items?reporter=${encodeURIComponent(session.user.email)}`
        );
        const foundData = await foundResponse.json();

        if (lostData.success) {
          setLostItems(lostData.data || []);
        }

        if (foundData.success) {
          setFoundItems(foundData.data || []);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Error fetching dashboard items:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchUserItems();
    }
  }, [session]);

  return { lostItems, foundItems, isLoading, error };
}

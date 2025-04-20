import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ItemCardGrid from "@/components/shared/ItemCardGrid";
import Spinner from "@/components/ui/Spinner";
import { ArrowRight } from "lucide-react";
import { useRecentItems } from "@/hooks/useRecentItems";

export default function RecentLostItems() {
  const { items, isLoading, error } = useRecentItems("lost", 6);

  return (
    <section className="bg-[#1A1A1A] py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white">Recent Lost Items</h2>
            <p className="text-gray-400 mt-2">
              Browse through recently reported lost items in your community
            </p>
          </div>

          <Button
            variant="link"
            className="text-[#FFD166] hover:text-amber-400"
            asChild
          >
            <Link href="/lost-items" className="flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">
            <p>Failed to load recent items. Please try again later.</p>
          </div>
        ) : (
          <ItemCardGrid items={items} itemType="lost" />
        )}
      </div>
    </section>
  );
}

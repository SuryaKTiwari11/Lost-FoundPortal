"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";
import { Search, ArrowRight, MapPin, InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface LostItem {
  _id: string;
  itemName: string;
  category: string;
  lostLocation: string;
  lostDate: string;
  images: string[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentItems, setRecentItems] = useState<LostItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  // Fetch recent lost items from the database
  useEffect(() => {
    async function fetchRecentLostItems() {
      try {
        const response = await fetch("/api/lost-items?limit=6&sort=recent");

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.items) {
            setRecentItems(data.items);
          }
        }
      } catch (error) {
        console.error("Error fetching recent lost items:", error);
      } finally {
        setItemsLoading(false);
      }
    }

    fetchRecentLostItems();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate search delay
    setTimeout(() => {
      setLoading(false);
      window.location.href = `/search?query=${searchQuery}`;
    }, 1000);
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <main className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-[#121212]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] to-[#121212] opacity-50"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Find What You've <span className="text-[#FFD166]">Lost</span> or
            Help Others <span className="text-[#FFD166]">Find</span> Theirs
          </h1>
          <p className="text-gray-300 text-xl mb-12 max-w-3xl mx-auto">
            A community platform to report lost items and connect people with
            their belongings.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for lost items..."
                className="pl-10 pr-20 py-6 h-12 text-lg bg-[#2A2A2A] border-[#333333] text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-1.5 top-1.5 h-9"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "Search"}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button asChild variant="secondary">
              <Link href="/report-lost">Report Lost Item</Link>
            </Button>
            <Button asChild>
              <Link href="/found-items">Browse Found Items</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="py-16 px-4 bg-[#121212]">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-white">
              Recently Lost Items
            </h2>
            <Button variant="outline" asChild>
              <Link href="/lost-items">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {itemsLoading ? (
            <div className="flex justify-center items-center py-16">
              <Spinner size="lg" />
            </div>
          ) : recentItems.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {recentItems.map((item) => (
                  <CarouselItem
                    key={item._id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="h-full">
                      <div className="aspect-square relative overflow-hidden rounded-t-xl">
                        {item.images && item.images.length > 0 ? (
                          <Image
                            src={item.images[0]}
                            alt={item.itemName}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform hover:scale-105"
                            onError={(e) => {
                              // Fallback for image loading errors
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src =
                                "https://placehold.co/400x400/2A2A2A/AAAAAA?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="h-full bg-[#2A2A2A] flex items-center justify-center">
                            <InfoIcon className="h-16 w-16 text-[#333333]" />
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{item.itemName}</CardTitle>
                          <Badge className="bg-[#FFD166] text-[#121212]">
                            {item.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-gray-400 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{item.lostLocation}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Lost on: {formatDate(item.lostDate)}
                        </div>
                        <Button className="w-full mt-4" asChild>
                          <Link href={`/lost-items/${item._id}`}>
                            View Details
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-5 bg-[#1A1A1A] border-[#333333]" />
              <CarouselNext className="-right-5 bg-[#1A1A1A] border-[#333333]" />
            </Carousel>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No lost items reported yet.</p>
              <Button asChild>
                <Link href="/report-lost">Report a Lost Item</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-[#1A1A1A]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-[#FFD166] text-[#121212] flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Report Your Lost Item
                </h3>
                <p className="text-gray-400">
                  Fill out a simple form with details and optionally upload
                  images of your lost item.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-[#FFD166] text-[#121212] flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Get Notifications</h3>
                <p className="text-gray-400">
                  Receive alerts when someone reports finding an item matching
                  your description.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-[#FFD166] text-[#121212] flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Recover Your Item</h3>
                <p className="text-gray-400">
                  Arrange to meet and verify your ownership to reclaim your lost
                  belongings.
                </p>
              </CardContent>
            </Card>
          </div>

          <Button className="mt-12" asChild>
            <Link href="/sign/up">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

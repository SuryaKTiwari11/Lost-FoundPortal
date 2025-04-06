"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";
import { Search, ArrowRight, MapPin, InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const recentItems = [
    {
      id: 1,
      title: "iPhone 13 Pro",
      category: "Electronics",
      location: "Main Library",
      date: "2023-05-15",
      image: "/images/iphone.jpg", // Replace with actual image path
    },
    {
      id: 2,
      title: "Black Leather Wallet",
      category: "Accessories",
      location: "Student Center",
      date: "2023-05-14",
      image: "/images/wallet.jpg", // Replace with actual image path
    },
    {
      id: 3,
      title: "Student ID Card",
      category: "Documents",
      location: "Cafeteria",
      date: "2023-05-13",
      image: "/images/id-card.jpg", // Replace with actual image path
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate search delay
    setTimeout(() => {
      setLoading(false);
      window.location.href = `/search?query=${searchQuery}`;
    }, 1000);
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

          <Carousel className="w-full">
            <CarouselContent>
              {recentItems.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="h-full">
                    <div className="aspect-square relative overflow-hidden rounded-t-xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-50"></div>
                      <div className="h-48 bg-[#2A2A2A] flex items-center justify-center">
                        <InfoIcon className="h-16 w-16 text-[#333333]" />
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{item.title}</CardTitle>
                        <Badge className="bg-[#FFD166] text-[#121212]">
                          {item.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-gray-400 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{item.location}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Lost on: {new Date(item.date).toLocaleDateString()}
                      </div>
                      <Button className="w-full mt-4">View Details</Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-5 bg-[#1A1A1A] border-[#333333]" />
            <CarouselNext className="-right-5 bg-[#1A1A1A] border-[#333333]" />
          </Carousel>
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
            <Link href="/signup">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

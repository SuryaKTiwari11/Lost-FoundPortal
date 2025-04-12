"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  MapPin,
  Search,
  Filter,
  AlertCircle,
} from "lucide-react";
import { ITEM_CATEGORIES } from "@/constants/categories";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";

// Type definitions for items
interface BaseItem {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  imageURL?: string;
  status: string;
  reportedBy: {
    name: string;
    email: string;
  };
  createdAt: Date;
}

interface LostItem extends BaseItem {
  lostLocation: string;
  lostDate: Date;
}

interface FoundItem extends BaseItem {
  foundLocation: string;
  foundDate: Date;
  isVerified: boolean;
}

export default function AllItemsPage() {
  // State for tab selection and filters
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State for items and loading
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("query", searchQuery);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (location) queryParams.append("location", location);
      if (selectedDate)
        queryParams.append("date", selectedDate.toISOString().split("T")[0]);

      // Fetch lost items if needed
      if (activeTab === "all" || activeTab === "lost") {
        const lostResponse = await fetch(
          `/api/lost-items?${queryParams.toString()}`
        );

        if (!lostResponse.ok) {
          throw new Error(`Failed to fetch lost items: ${lostResponse.status}`);
        }

        const lostData = await lostResponse.json();
        if (lostData.success) {
          setLostItems(lostData.data);
        } else {
          console.error("API returned error for lost items:", lostData.error);
          setLostItems([]);
        }
      }

      // Fetch found items if needed
      if (activeTab === "all" || activeTab === "found") {
        const foundResponse = await fetch(
          `/api/found-items?${queryParams.toString()}`
        );

        if (!foundResponse.ok) {
          throw new Error(
            `Failed to fetch found items: ${foundResponse.status}`
          );
        }

        const foundData = await foundResponse.json();
        if (foundData.success) {
          setFoundItems(foundData.data);
        } else {
          console.error("API returned error for found items:", foundData.error);
          setFoundItems([]);
        }
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items. Please try again later.");

      // Only clear the specific item set we were trying to fetch
      if (activeTab === "lost") {
        setLostItems([]);
      } else if (activeTab === "found") {
        setFoundItems([]);
      } else {
        setLostItems([]);
        setFoundItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when they change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 500); // Debounce search for better performance

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, selectedDate, location, activeTab]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  // Display items based on the active tab
  const displayedItems =
    activeTab === "lost"
      ? lostItems
      : activeTab === "found"
        ? foundItems
        : [...lostItems, ...foundItems];

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDate(undefined);
    setLocation("");
    // Fetch without filters after clearing
    setTimeout(fetchItems, 0);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2 text-[#FFD166]">Browse Items</h1>
        <p className="text-gray-400 mb-8">
          Search through lost and found items on campus
        </p>

        {/* Search and filter bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for items..."
                className="pl-10 py-6 h-12 text-lg bg-[#2A2A2A] border-[#333333] text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="md:self-auto self-stretch"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Expanded filters */}
          {isFilterOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-[#1A1A1A] border border-[#333333] rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Any category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any category</SelectItem>
                    {ITEM_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                    {selectedDate && (
                      <div className="p-2 border-t border-[#333333] flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDate(undefined)}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter location..."
                    className="pl-10 h-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end mt-2">
                <Button variant="ghost" onClick={clearFilters} className="mr-2">
                  Clear All
                </Button>
                <Button onClick={() => fetchItems()}>Apply Filters</Button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs for switching between all/lost/found */}
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="bg-[#1A1A1A]">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="lost">Lost Items</TabsTrigger>
            <TabsTrigger value="found">Found Items</TabsTrigger>
          </TabsList>

          <div className="mt-2 text-sm text-gray-400">
            Showing {displayedItems.length} items
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
            {selectedDate && ` on ${format(selectedDate, "PPP")}`}
            {location && ` at ${location}`}
          </div>

          <TabsContent value="all" className="mt-6">
            <ItemsGrid items={displayedItems} loading={loading} />
          </TabsContent>

          <TabsContent value="lost" className="mt-6">
            <ItemsGrid items={lostItems} loading={loading} />
          </TabsContent>

          <TabsContent value="found" className="mt-6">
            <ItemsGrid items={foundItems} loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ItemsGrid({ items, loading }: { items: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" className="text-[#FFD166]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium mb-2">No items found</h3>
        <p className="text-gray-400 max-w-md">
          Try adjusting your filters or search query to find items.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </div>
  );
}

function ItemCard({ item }: { item: any }) {
  const isLostItem = "lostLocation" in item || item.status === "lost";

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "Unknown date";

    try {
      const date = new Date(dateString);

      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }

      return format(date, "MMM d, yyyy");
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <Card className="bg-[#1A1A1A] border-[#333333] hover:border-[#FFD166] transition-colors duration-200 overflow-hidden h-full flex flex-col">
      <div className="relative h-48 bg-[#2A2A2A] flex items-center justify-center">
        {item.imageURL ? (
          <Image
            src={item.imageURL}
            alt={item.itemName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="text-[#444444] text-5xl font-bold opacity-50">
            {item.category?.charAt(0) || "?"}
          </div>
        )}
        <Badge
          className={`absolute top-2 right-2 ${
            isLostItem
              ? "bg-red-900 hover:bg-red-800 text-white"
              : "bg-green-900 hover:bg-green-800 text-white"
          }`}
        >
          {isLostItem ? "Lost" : "Found"}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{item.itemName}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-2 flex-grow">
        <div className="flex items-start gap-2 text-gray-400 mb-2">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">
            {isLostItem
              ? `Lost at: ${item.lostLocation}`
              : `Found at: ${item.foundLocation}`}
          </span>
        </div>

        <div className="text-sm text-gray-400 mb-4">
          <span>
            {isLostItem
              ? `Lost on: ${formatDate(item.lostDate || item.dateLost)}`
              : `Found on: ${formatDate(item.foundDate)}`}
          </span>
        </div>

        <p className="text-sm line-clamp-3 text-gray-300">{item.description}</p>
      </CardContent>

      <CardFooter className="pt-2">
        <Link
          href={
            isLostItem ? `/lost-items/${item._id}` : `/found-items/${item._id}`
          }
          className="w-full"
        >
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

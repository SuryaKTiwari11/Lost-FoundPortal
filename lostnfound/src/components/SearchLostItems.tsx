"use client";

import { useState, useEffect, useCallback } from "react";
import ItemCard from "@/components/ItemCard";
import { ILostItem } from "@/models/LostItem";
import { Input } from "@/components/ui/input";
import { Search, Calendar as CalendarIcon, Tag } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Sample data with local placeholder images
const SAMPLE_ITEMS: ILostItem[] = [
  {
    id: "1",
    name: "Blue Backpack",
    description: "Nike backpack with laptop compartment",
    category: "Bags",
    location: "Library - Floor 2",
    date: new Date("2023-08-15").toISOString(),
    image: "/images/placeholder-bag.jpg", // Replace with local placeholder image
    status: "lost",
    contactInfo: "john@example.com",
  },
  {
    id: "2",
    name: "iPhone 13 Pro",
    description: "Space gray iPhone with blue case",
    category: "Electronics",
    location: "Student Center",
    date: new Date("2023-08-20").toISOString(),
    image: "/images/placeholder-electronics.jpg", // Replace with local placeholder image
    status: "lost",
    contactInfo: "sarah@example.com",
  },
  {
    id: "3",
    name: "Water Bottle",
    description: "Hydroflask green water bottle",
    category: "Others",
    location: "Gym",
    date: new Date("2023-08-10").toISOString(),
    status: "lost",
    contactInfo: "mike@example.com",
  },
  {
    id: "4",
    name: "Textbook",
    description: "Introduction to Computer Science textbook",
    category: "Books",
    location: "Cafeteria",
    date: new Date("2023-08-22").toISOString(),
    status: "lost",
    contactInfo: "lisa@example.com",
  },
];

export default function SearchLostItems() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [filteredItems, setFilteredItems] = useState<ILostItem[]>(SAMPLE_ITEMS);
  const [isLoading, setIsLoading] = useState(false);

  // Categories for filter - move outside useEffect to prevent re-creation
  const categories = ["All", "Bags", "Electronics", "Books", "Others"];

  // Memoize the filter function to prevent unnecessary re-calculations
  const filterItems = useCallback(() => {
    let results = SAMPLE_ITEMS;

    // Apply search term filter
    if (searchTerm.trim()) {
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "All") {
      results = results.filter((item) => item.category === selectedCategory);
    }

    // Apply date filter
    if (date) {
      const filterDate = new Date(date).setHours(0, 0, 0, 0);
      results = results.filter((item) => {
        const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
        return itemDate === filterDate;
      });
    }

    return results;
  }, [searchTerm, selectedCategory, date]);

  // Use the memoized filter function in useEffect
  useEffect(() => {
    setIsLoading(true);

    // Use a cleanup function to prevent state updates after unmount
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setFilteredItems(filterItems());
        setIsLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [filterItems]);

  // Handle date selection with a stable function reference
  const handleDateSelect = useCallback((newDate: Date | undefined) => {
    setDate(newDate);
  }, []);

  // Clear filters function
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setDate(undefined);
  }, []);

  return (
    <div className="space-y-8">
      {/* Netflix-like header description */}
      <div className="text-center mb-6">
        <p className="text-gray-400 max-w-2xl mx-auto">
          Browse through all reported lost items. Use the filters below to
          narrow down your search.
        </p>
      </div>

      {/* Enhanced search and filters section */}
      <div className="bg-[#1A1A1A] rounded-xl p-6 shadow-lg border border-[#333333]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search input with icon */}
          <div className="relative">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Search Items
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                type="text"
                placeholder="Find by name, description or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#252525] border-[#333] text-white pl-10 placeholder:text-gray-500 h-11 focus:ring-[#FFD166] focus:border-[#FFD166]"
              />
            </div>
          </div>

          {/* Category filter with icon */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md bg-[#252525] border-[#333] text-white pl-10 py-2.5 h-11 appearance-none focus:outline-none focus:ring-1 focus:ring-[#FFD166]"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category === "All" ? "" : category}
                  >
                    {category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Calendar date picker replacing the input date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lost Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal bg-[#252525] border-[#333] text-white h-11 hover:bg-[#333] hover:text-white focus:ring-[#FFD166] focus:ring-1 ${!date ? "text-gray-500" : "text-white"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-[#1A1A1A] border-[#333]"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="bg-[#1A1A1A] text-white"
                  // Add specific styles to avoid theme inconsistencies
                  classNames={{
                    day_selected:
                      "bg-[#FFD166] text-[#121212] hover:bg-[#FFD166] hover:text-[#121212]",
                    day_today: "bg-[#333] text-white",
                  }}
                />
                {date && (
                  <div className="p-2 border-t border-[#333] flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateSelect(undefined)}
                      className="text-[#FFD166] hover:text-[#FFD166] hover:bg-[#333]"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Results section with Netflix-inspired styling */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#FFD166] flex items-center">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "Item" : "Items"} Found
          </h2>

          {isLoading && (
            <div className="text-gray-400 flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#FFD166]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </div>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#1A1A1A] rounded-xl border border-[#333] flex flex-col items-center">
            <svg
              className="w-16 h-16 text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20A8 8 0 104 12a8 8 0 008 8z"
              ></path>
            </svg>
            <p className="text-gray-400 text-lg">
              No items found matching your search criteria.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 text-[#FFD166] hover:underline focus:outline-none"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

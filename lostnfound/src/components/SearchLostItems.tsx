"use client";

import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import ItemCard from "./ItemCard";
import Spinner from "./ui/Spinner";
import { ILostItem } from "@/models/LostItem";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Tag } from "lucide-react";

// Sample categories - replace with actual categories from your application
const categories = [
  { id: "all", name: "All Categories" },
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "documents", name: "Documents" },
  { id: "accessories", name: "Accessories" },
  { id: "other", name: "Other" },
];

export default function SearchLostItems() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [results, setResults] = useState<ILostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Debounced search function to prevent excessive API calls
  const debouncedSearch = useCallback(
    debounce(
      async (
        query: string,
        category: string,
        startDate: string,
        endDate: string
      ) => {
        if (!query && category === "all" && !startDate && !endDate) {
          // Don't search if all fields are empty/default
          setResults([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        setSearchPerformed(true);

        try {
          const params = new URLSearchParams();
          if (query) params.append("query", query);
          if (category !== "all") params.append("category", category);
          if (startDate) params.append("startDate", startDate);
          if (endDate) params.append("endDate", endDate);

          const response = await fetch(
            `/api/search-lost-items?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error("Search failed");
          }

          const data = await response.json();
          setResults(data.items);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      },
      500
    ), // 500ms debounce
    []
  );

  // Trigger search when inputs change
  useEffect(() => {
    debouncedSearch(searchQuery, category, startDate, endDate);

    // Cancel the debounce on cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, category, startDate, endDate, debouncedSearch]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-[#1A1A1A] rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Search Lost Items
        </h2>

        <div className="space-y-4">
          {/* Search input */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by item name, description or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#2A2A2A] border-[#333333] text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category filter */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-[#2A2A2A] border-[#333333] text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A2A] border-[#333333] text-white">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date range filters - Using native date inputs to avoid React version conflicts */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 bg-[#2A2A2A] border-[#333333] text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9 bg-[#2A2A2A] border-[#333333] text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
          </div>
        ) : (
          <div>
            {searchPerformed && (
              <div className="flex items-center mb-6">
                <h3 className="text-xl font-semibold text-white mr-4">
                  {results.length} {results.length === 1 ? "Result" : "Results"}{" "}
                  Found
                </h3>
                {category !== "all" && (
                  <Badge className="bg-[#FFD166] text-[#121212] hover:bg-[#FFD166]/90">
                    <Tag className="w-3 h-3 mr-1" />
                    {categories.find((cat) => cat.id === category)?.name}
                  </Badge>
                )}
                
                {/* Added date range indicator badges */}
                {startDate && (
                  <Badge className="ml-2 bg-[#2A2A2A] text-white hover:bg-[#333333]">
                    <Calendar className="w-3 h-3 mr-1" />
                    From: {new Date(startDate).toLocaleDateString()}
                  </Badge>
                )}
                
                {endDate && (
                  <Badge className="ml-2 bg-[#2A2A2A] text-white hover:bg-[#333333]">
                    <Calendar className="w-3 h-3 mr-1" />
                    To: {new Date(endDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            )}

            {searchPerformed && results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => (
                  <ItemCard key={item._id.toString()} item={item} />
                ))}
              </div>
            ) : searchPerformed ? (
              <div className="text-center p-8 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                <p className="text-gray-300">
                  No items found. Try adjusting your search criteria.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-[#FFD166] text-[#FFD166] hover:bg-[#FFD166]/10"
                  onClick={() => {
                    setSearchQuery('');
                    setCategory('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}


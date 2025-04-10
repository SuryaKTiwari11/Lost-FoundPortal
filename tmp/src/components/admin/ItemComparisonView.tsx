"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X, AlertTriangle, ArrowRight } from "lucide-react";
import type { ItemMatch, FoundItem, LostItem } from "@/types";
import { adminAPI } from "@/services/api";

interface ItemComparisonViewProps {
  matchId: string;
  potentialMatches: ItemMatch[];
  onMatchConfirmed: () => void;
}

export default function ItemComparisonView({
  matchId,
  potentialMatches,
  onMatchConfirmed,
}: ItemComparisonViewProps) {
  const [match, setMatch] = useState<ItemMatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonMetrics, setComparisonMetrics] = useState<{
    category: number;
    date: number;
    location: number;
    description: number;
    overall: number;
  }>({
    category: 0,
    date: 0,
    location: 0,
    description: 0,
    overall: 0,
  });

  useEffect(() => {
    // Find the match from potentialMatches
    const foundMatch = potentialMatches.find(
      (m) => m._id === matchId || m.id === matchId
    );

    if (foundMatch) {
      setMatch(foundMatch);
      calculateComparisonMetrics(foundMatch);
    } else {
      // If not found in props, fetch from API
      fetchMatchDetails(matchId);
    }
  }, [matchId, potentialMatches]);

  const fetchMatchDetails = async (id: string) => {
    try {
      setIsLoading(true);
      // Split the ID to get lostItemId and foundItemId (if using combined ID format)
      const [lostItemId, foundItemId] = id.split("-");

      if (lostItemId && foundItemId) {
        const response = await adminAPI.getItemComparisonDetails(
          lostItemId,
          foundItemId
        );

        if (response.success && response.data) {
          setMatch(response.data);
          calculateComparisonMetrics(response.data);
        }
      }
    } catch (error) {
      console.error("Error fetching match details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateComparisonMetrics = (match: ItemMatch) => {
    if (!match || !match.lostItem || !match.foundItem) return;

    const lostItem = match.lostItem;
    const foundItem = match.foundItem;

    // Calculate category similarity (exact match = 100%, otherwise 0%)
    const categoryScore = lostItem.category === foundItem.category ? 100 : 0;

    // Calculate date proximity (same day = 100%, within 3 days = 75%, within 7 days = 50%, otherwise scaled)
    const lostDate = new Date(
      lostItem.lostDate || lostItem.dateLost || lostItem.createdAt
    );
    const foundDate = new Date(foundItem.foundDate);
    const daysDifference = Math.abs(
      Math.floor(
        (lostDate.getTime() - foundDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    let dateScore = 0;
    if (daysDifference === 0) dateScore = 100;
    else if (daysDifference <= 3) dateScore = 75;
    else if (daysDifference <= 7) dateScore = 50;
    else if (daysDifference <= 14) dateScore = 25;
    else dateScore = 10;

    // Calculate location similarity using string similarity
    const lostLocation = (
      lostItem.lostLocation ||
      lostItem.lastLocation ||
      ""
    ).toLowerCase();
    const foundLocation = (foundItem.foundLocation || "").toLowerCase();

    let locationScore = 0;
    if (lostLocation === foundLocation) {
      locationScore = 100;
    } else if (
      lostLocation.includes(foundLocation) ||
      foundLocation.includes(lostLocation)
    ) {
      locationScore = 75;
    } else {
      // Simple word matching for locations
      const lostWords = lostLocation.split(/\s+/);
      const foundWords = foundLocation.split(/\s+/);

      let matchedWords = 0;
      lostWords.forEach((word) => {
        if (
          word.length > 2 &&
          foundWords.some((fw) => fw.includes(word) || word.includes(fw))
        ) {
          matchedWords++;
        }
      });

      locationScore = Math.min(
        100,
        (matchedWords / Math.max(1, lostWords.length)) * 100
      );
    }

    // Calculate description similarity
    const lostDesc = (lostItem.description || "").toLowerCase();
    const foundDesc = (foundItem.description || "").toLowerCase();

    let descriptionScore = 0;
    // Count matching significant words (length > 3)
    const lostWords = lostDesc.split(/\s+/).filter((w) => w.length > 3);
    const foundWords = foundDesc.split(/\s+/).filter((w) => w.length > 3);

    let matchedWords = 0;
    lostWords.forEach((word) => {
      if (foundWords.some((fw) => fw.includes(word) || word.includes(fw))) {
        matchedWords++;
      }
    });

    descriptionScore = Math.min(
      100,
      (matchedWords / Math.max(1, Math.min(lostWords.length, 10))) * 100
    );

    // Calculate overall score with weighted components
    const overall = Math.round(
      categoryScore * 0.3 +
        dateScore * 0.2 +
        locationScore * 0.3 +
        descriptionScore * 0.2
    );

    setComparisonMetrics({
      category: categoryScore,
      date: dateScore,
      location: locationScore,
      description: descriptionScore,
      overall,
    });
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-lime-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  if (!match) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Match not found</h3>
          <p className="text-sm text-muted-foreground">
            Unable to find match details
          </p>
        </div>
      </div>
    );
  }

  const { lostItem, foundItem } = match;

  return (
    <div className="space-y-6">
      {/* Overall match score */}
      <div className="bg-muted/20 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-semibold">Overall Match Score</h3>
            <p className="text-sm text-muted-foreground">
              Based on category, date, location, and description similarity
            </p>
          </div>
          <Badge
            className={`text-lg px-3 py-1 ${
              comparisonMetrics.overall >= 70
                ? "bg-green-700 hover:bg-green-800"
                : comparisonMetrics.overall >= 50
                  ? "bg-yellow-700 hover:bg-yellow-800"
                  : "bg-red-700 hover:bg-red-800"
            }`}
          >
            {comparisonMetrics.overall}%
          </Badge>
        </div>
        <Progress
          value={comparisonMetrics.overall}
          className="h-3"
          indicatorClassName={getProgressColor(comparisonMetrics.overall)}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Category</span>
              <span>{comparisonMetrics.category}%</span>
            </div>
            <Progress
              value={comparisonMetrics.category}
              className="h-2"
              indicatorClassName={getProgressColor(comparisonMetrics.category)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Date</span>
              <span>{comparisonMetrics.date}%</span>
            </div>
            <Progress
              value={comparisonMetrics.date}
              className="h-2"
              indicatorClassName={getProgressColor(comparisonMetrics.date)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Location</span>
              <span>{comparisonMetrics.location}%</span>
            </div>
            <Progress
              value={comparisonMetrics.location}
              className="h-2"
              indicatorClassName={getProgressColor(comparisonMetrics.location)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Description</span>
              <span>{comparisonMetrics.description}%</span>
            </div>
            <Progress
              value={comparisonMetrics.description}
              className="h-2"
              indicatorClassName={getProgressColor(
                comparisonMetrics.description
              )}
            />
          </div>
        </div>
      </div>

      {/* Side by side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lost Item */}
        <Card>
          <CardHeader className="bg-red-950/20">
            <CardTitle className="flex items-center">
              <span className="bg-red-900/60 text-white p-1 rounded-md text-xs mr-2">
                LOST
              </span>
              {lostItem.itemName}
            </CardTitle>
            <CardDescription>
              Reported by {lostItem.ownerName || "Anonymous"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {lostItem.images && lostItem.images.length > 0 ? (
              <div className="aspect-square w-full relative rounded-md overflow-hidden border">
                <Image
                  src={lostItem.images[0]}
                  alt={lostItem.itemName}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="aspect-square w-full bg-muted flex items-center justify-center rounded-md border">
                <p className="text-sm text-muted-foreground">
                  No image available
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Category</h4>
                <p>{lostItem.category}</p>
                {lostItem.category === foundItem.category ? (
                  <Badge
                    variant="outline"
                    className="mt-1 border-green-500 text-green-500"
                  >
                    <Check className="h-3 w-3 mr-1" /> Match
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="mt-1 border-red-500 text-red-500"
                  >
                    <X className="h-3 w-3 mr-1" /> No Match
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium">Lost On</h4>
                <p>
                  {formatDate(
                    lostItem.lostDate || lostItem.dateLost || lostItem.createdAt
                  )}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Lost Location</h4>
                <p>
                  {lostItem.lostLocation ||
                    lostItem.lastLocation ||
                    "Unknown location"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm">{lostItem.description}</p>
              </div>

              {lostItem.distinguishingFeatures && (
                <div>
                  <h4 className="text-sm font-medium">
                    Distinguishing Features
                  </h4>
                  <p className="text-sm">{lostItem.distinguishingFeatures}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Found Item */}
        <Card>
          <CardHeader className="bg-green-950/20">
            <CardTitle className="flex items-center">
              <span className="bg-green-900/60 text-white p-1 rounded-md text-xs mr-2">
                FOUND
              </span>
              {foundItem.itemName}
            </CardTitle>
            <CardDescription>
              Found by {foundItem.finderName || "Anonymous"} on{" "}
              {formatDate(foundItem.foundDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {foundItem.images && foundItem.images.length > 0 ? (
              <div className="aspect-square w-full relative rounded-md overflow-hidden border">
                <Image
                  src={foundItem.images[0]}
                  alt={foundItem.itemName}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="aspect-square w-full bg-muted flex items-center justify-center rounded-md border">
                <p className="text-sm text-muted-foreground">
                  No image available
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Category</h4>
                <p>{foundItem.category}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Found On</h4>
                <p>{formatDate(foundItem.foundDate)}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Found Location</h4>
                <p>{foundItem.foundLocation}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm">{foundItem.description}</p>
              </div>

              {foundItem.condition && (
                <div>
                  <h4 className="text-sm font-medium">Condition</h4>
                  <p className="text-sm">{foundItem.condition}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          onClick={onMatchConfirmed}
          className="bg-green-700 hover:bg-green-800"
        >
          Confirm Match
        </Button>
      </div>
    </div>
  );
}

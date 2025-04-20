import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";
import FoundItem from "@/model/foundItem.model";
import ItemMatch from "@/model/itemMatch.model";
import type { ApiResponse } from "@/types";

/**
 * Endpoint to get potential matches for a lost item
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the lost item ID from query params
    const lostItemId = request.nextUrl.searchParams.get("lostItemId");

    if (!lostItemId) {
      return NextResponse.json(
        { success: false, error: "Lost item ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the lost item
    const lostItem = await LostItem.findById(lostItemId);
    if (!lostItem) {
      return NextResponse.json(
        { success: false, error: "Lost item not found" },
        { status: 404 }
      );
    }

    // Check authorization - only the owner or admins can view matches
    const isAdmin = session.user.role === "admin";
    const isOwner = lostItem.reportedBy.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Find potential found items that match
    // Match criteria: similar category, found after the item was lost,
    // location relatively close, and not already claimed or matched
    const potentialMatches = await FoundItem.find({
      category: lostItem.category,
      foundDate: { $gte: lostItem.dateLost },
      status: { $in: ["pending", "verified"] },
      matchedWithLostItem: { $exists: false },
    }).sort({ foundDate: 1 });

    // Calculate match confidence for each potential match
    const matchesWithConfidence = potentialMatches.map((foundItem) => {
      let confidence = 0;

      // Category match (exact or related)
      if (foundItem.category === lostItem.category) {
        confidence += 30;
      }

      // Description similarity (basic implementation, can be enhanced)
      if (foundItem.description && lostItem.description) {
        const commonWords = findCommonWords(
          foundItem.description.toLowerCase(),
          lostItem.description.toLowerCase()
        );
        confidence += Math.min(commonWords * 5, 30);
      }

      // Date proximity (closer dates get higher score)
      const foundDate = new Date(foundItem.foundDate);
      const lostDate = new Date(lostItem.dateLost);
      const daysDiff = Math.abs(
        (foundDate.getTime() - lostDate.getTime()) / (1000 * 3600 * 24)
      );

      if (daysDiff <= 1) {
        confidence += 20;
      } else if (daysDiff <= 3) {
        confidence += 10;
      } else if (daysDiff <= 7) {
        confidence += 5;
      }

      // Location similarity (basic implementation)
      if (foundItem.foundLocation && lostItem.lastLocation) {
        const locationMatch =
          foundItem.foundLocation
            .toLowerCase()
            .includes(lostItem.lastLocation.toLowerCase()) ||
          lostItem.lastLocation
            .toLowerCase()
            .includes(foundItem.foundLocation.toLowerCase());

        if (locationMatch) {
          confidence += 20;
        }
      }

      return {
        item: foundItem,
        confidence: Math.min(confidence, 100), // Cap at 100%
      };
    });

    // Sort by confidence and return top matches
    const sortedMatches = matchesWithConfidence
      .sort((a, b) => b.confidence - a.confidence)
      .filter((match) => match.confidence > 20); // Only return reasonable matches

    return NextResponse.json({
      success: true,
      data: sortedMatches,
    });
  } catch (error) {
    console.error("Error finding potential matches:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to find common words between two strings
function findCommonWords(str1: string, str2: string): number {
  const words1 = str1.split(/\W+/).filter((word) => word.length > 3);
  const words2 = str2.split(/\W+/).filter((word) => word.length > 3);

  const uniqueWords = new Set(words1);
  let commonCount = 0;

  words2.forEach((word) => {
    if (uniqueWords.has(word)) {
      commonCount++;
      uniqueWords.delete(word); // Count each word only once
    }
  });

  return commonCount;
}

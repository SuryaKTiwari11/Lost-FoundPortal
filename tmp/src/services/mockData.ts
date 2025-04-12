// Mock data for development and testing
import type { FoundItem, LostItem, ClaimRequest, ItemStats } from "@/types";

// Use client-side only or deterministic ID generation
const generateId = () => {
  // Using a deterministic approach instead of Math.random() to avoid hydration errors
  return `id-${Date.now().toString(36)}-${(++idCounter).toString(36)}`;
};

// Counter for generating unique IDs
let idCounter = 0;

// Create dates
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const oneWeekAgo = new Date(today);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

// Mock user
const mockUser = {
  _id: "user-001",
  name: "John Doe",
  email: "john@thapar.edu",
  image: "https://randomuser.me/api/portraits/men/1.jpg",
  role: "user",
};

const mockAdmin = {
  _id: "admin-001",
  name: "Admin User",
  email: "admin@thapar.edu",
  image: "https://randomuser.me/api/portraits/men/2.jpg",
  role: "admin",
};

// Deterministic selection function to replace Math.random()
const selectItem = <T>(items: T[], index: number): T => {
  return items[index % items.length];
};

// Mock found items
const createMockFoundItems = (
  count: number,
  status = "found",
  isVerified = false
): FoundItem[] => {
  const categories = [
    "Electronics",
    "Books",
    "Accessories",
    "Clothing",
    "ID Cards",
    "Keys",
    "Documents",
    "Others",
  ];

  const locations = [
    "Library",
    "Cafeteria",
    "Auditorium",
    "Classroom",
    "Sports Complex",
  ];

  const dates = [today, yesterday, twoDaysAgo, threeDaysAgo, oneWeekAgo];

  return Array(count)
    .fill(null)
    .map((_, index) => ({
      _id: `found-${index + 1}`,
      itemName: `Found Item ${index + 1}`,
      description: `This is a description for found item ${index + 1}. It was found in a public area.`,
      category: selectItem(categories, index),
      foundLocation: selectItem(locations, index),
      foundDate: selectItem(dates, index),
      currentHoldingLocation: "Admin Office",
      imageURL:
        index % 3 === 0
          ? `https://source.unsplash.com/random/300x300?sig=${index}`
          : undefined,
      reportedBy: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        image: mockUser.image,
      },
      contactEmail: mockUser.email,
      contactPhone: "+91 98765 43210",
      status: status,
      isVerified: isVerified,
      createdAt: selectItem(dates, index),
      updatedAt: today,
    }));
};

// Mock lost items
const createMockLostItems = (count: number): LostItem[] => {
  const categories = [
    "Electronics",
    "Books",
    "Accessories",
    "Clothing",
    "ID Cards",
    "Keys",
    "Documents",
    "Others",
  ];

  const locations = [
    "Library",
    "Cafeteria",
    "Auditorium",
    "Classroom",
    "Sports Complex",
  ];

  const dates = [today, yesterday, twoDaysAgo, threeDaysAgo, oneWeekAgo];

  return Array(count)
    .fill(null)
    .map((_, index) => ({
      _id: `lost-${index + 1}`,
      itemName: `Lost Item ${index + 1}`,
      description: `This is a description for lost item ${index + 1}. It was last seen in a public area.`,
      category: selectItem(categories, index),
      lostLocation: selectItem(locations, index),
      lostDate: selectItem(dates, index),
      imageURL:
        index % 3 === 0
          ? `https://source.unsplash.com/random/300x300?sig=${index + 100}`
          : undefined,
      reportedBy: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        image: mockUser.image,
      },
      contactEmail: mockUser.email,
      contactPhone: "+91 98765 43210",
      status: "lost",
      foundReports: [],
      createdAt: selectItem(dates, index),
    }));
};

// Mock claim requests
const createMockClaimRequests = (
  count: number,
  mockFoundItems: FoundItem[]
): ClaimRequest[] => {
  const dates = [yesterday, twoDaysAgo, threeDaysAgo];

  return Array(count)
    .fill(null)
    .map((_, index) => ({
      _id: `claim-${index + 1}`,
      item: mockFoundItems[index % mockFoundItems.length],
      user: mockUser as any,
      proofOfOwnership: `I can identify this item by the unique scratch on the back and the personalized engraving with my initials. I also have the receipt of purchase.`,
      contactPhone: "+91 98765 43210",
      status: "pending",
      createdAt: selectItem(dates, index),
      updatedAt: today,
    }));
};

// Create mock data
const pendingItems = createMockFoundItems(8, "found", false);
const verifiedItems = createMockFoundItems(6, "found", true);
const claimedItems = createMockFoundItems(4, "claimed", true);
const rejectedItems = createMockFoundItems(2, "rejected", false);
const lostItems = createMockLostItems(10);
const claimRequests = createMockClaimRequests(5, verifiedItems);

// Mock stats
const mockStats: ItemStats = {
  pending: pendingItems.length,
  verified: verifiedItems.length,
  claimed: claimedItems.length,
  rejected: rejectedItems.length,
  total:
    pendingItems.length +
    verifiedItems.length +
    claimedItems.length +
    rejectedItems.length,
};

// Create potential matches
const createPotentialMatches = () => {
  const matches = [];

  for (let i = 0; i < 5; i++) {
    const lostItem = lostItems[i];
    const foundItem = verifiedItems[i % verifiedItems.length];

    matches.push({
      _id: `match-${i}`,
      id: `match-${i}`,
      lostItem,
      foundItem,
      score: Math.floor(Math.random() * 4) + 3, // Score between 3 and 6
    });
  }

  return matches;
};

const potentialMatches = createPotentialMatches();

// Export mock data
export const mockData = {
  adminItems: {
    success: true,
    data: {
      items: pendingItems,
      stats: mockStats,
    },
  },
  claimRequests: {
    success: true,
    data: {
      claims: claimRequests,
    },
  },
  matchingLostItems: {
    success: true,
    data: {
      items: lostItems,
      total: lostItems.length,
    },
  },
  foundItems: {
    success: true,
    data: [...pendingItems, ...verifiedItems, ...claimedItems],
  },
  lostItems: {
    success: true,
    data: lostItems,
  },
  foundItemDetail: {
    success: true,
    data: verifiedItems[0],
  },
  lostItemDetail: {
    success: true,
    data: lostItems[0],
  },
  allItems: {
    success: true,
    data: {
      lostItems,
      foundItems: [...pendingItems, ...verifiedItems],
      total: lostItems.length + pendingItems.length + verifiedItems.length,
    },
  },
  searchResults: {
    success: true,
    data: {
      items: lostItems.slice(0, 3),
    },
  },
};

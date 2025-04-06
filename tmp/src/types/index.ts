// Centralized type definitions for the entire application

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Types
export interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  role: "user" | "admin";
  rollNumber?: string;
  contactPhone?: string;
  alternateEmail?: string;
  department?: string;
  yearOfStudy?: string;
  hostelDetails?: string;
  bio?: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Item Types
export interface BaseItem {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  imageURL?: string;
  status: string;
  reportedBy: {
    _id?: string;
    name: string;
    email: string;
    image?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LostItem extends BaseItem {
  lostLocation: string;
  lostDate: Date;
  dateLost?: Date; // For backward compatibility
  lastLocation?: string; // For backward compatibility
  reward?: string;
  foundReports?: any[];
  matchedWithFoundItem?: string;
  status: "lost" | "found" | "claimed" | "foundReported" | "pending_claim";
}

export interface FoundItem extends BaseItem {
  foundLocation: string;
  foundDate: Date;
  currentHoldingLocation?: string;
  isVerified: boolean;
  claimedBy?: string | User;
  claimRequestIds?: string[];
  matchedWithLostItem?: string;
  claimedAt?: Date;
  status: "found" | "claimed" | "verified" | "rejected";
}

export interface ClaimRequest {
  _id: string;
  item: FoundItem;
  user: User;
  proofOfOwnership: string;
  contactPhone?: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemMatch {
  _id: string;
  lostItem: LostItem;
  foundItem: FoundItem;
  score: number;
  id: string;
}

export interface FoundReport {
  _id: string;
  lostItem: string | LostItem;
  foundBy: string | User;
  foundLocation: string;
  foundDate: Date;
  currentHoldingLocation: string;
  additionalNotes?: string;
  contactPhone?: string;
  status: "pending" | "verified" | "rejected";
  adminNotes?: string;
  verifiedBy?: string | User;
  createdAt: Date;
  updatedAt: Date;
}

// Form Data Types
export interface FoundItemFormData {
  itemName: string;
  description: string;
  category: string;
  foundLocation: string;
  foundDate: Date;
  currentHoldingLocation?: string;
  imageURL?: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface LostItemFormData {
  itemName: string;
  description: string;
  category: string;
  lastSeenLocation: string;
  lastSeenDate: Date;
  ownerName?: string;
  imageURL?: string;
  contactEmail: string;
  contactPhone?: string;
  reward?: string;
}

export interface FoundReportData {
  lostItemId: string;
  foundLocation: string;
  foundDate: string;
  currentHoldingLocation: string;
  additionalNotes?: string;
  contactPhone?: string;
}

export interface ProfileFormData {
  name: string;
  rollNumber?: string;
  contactPhone?: string;
  alternateEmail?: string;
  department?: string;
  yearOfStudy?: string;
  hostelDetails?: string;
  bio?: string;
}

export interface ClaimItemData {
  itemId: string;
  userId: string;
  claimReason: string;
  proofDescription: string;
}

// Admin Dashboard Types
export interface ItemStats {
  pending: number;
  verified: number;
  claimed: number;
  rejected: number;
  total: number;
}

// Constants
export const ITEM_CATEGORIES = [
  "Electronics",
  "Books",
  "Accessories",
  "Clothing",
  "ID Cards",
  "Keys",
  "Documents",
  "Others",
];

// Mock Data for Development
export const MOCK_FOUND_ITEMS: FoundItem[] = [
  {
    _id: "f1",
    itemName: "Blue Wallet",
    category: "Accessories",
    foundLocation: "Student Center",
    foundDate: new Date(2023, 4, 14),
    description:
      "Blue leather wallet with some cash and ID cards. Found on a table near the entrance.",
    imageURL: "",
    status: "found",
    isVerified: true,
    currentHoldingLocation: "Admin Office, Room 123",
    reportedBy: {
      name: "Alex Johnson",
      email: "alex@example.com",
    },
    createdAt: new Date(2023, 4, 14),
  },
  {
    _id: "f2",
    itemName: "iPhone 13",
    category: "Electronics",
    foundLocation: "Library",
    foundDate: new Date(2023, 5, 20),
    description:
      "Black iPhone 13 with a cracked screen protector. Found on a study desk.",
    imageURL: "",
    status: "found",
    isVerified: true,
    currentHoldingLocation: "Security Office",
    reportedBy: {
      name: "Maria Garcia",
      email: "maria@example.com",
    },
    createdAt: new Date(2023, 5, 20),
  },
  {
    _id: "f3",
    itemName: "Textbook",
    category: "Books",
    foundLocation: "Lecture Hall B",
    foundDate: new Date(2023, 6, 5),
    description:
      "Introduction to Computer Science textbook. Found under a chair.",
    imageURL: "",
    status: "found",
    isVerified: false,
    reportedBy: {
      name: "John Smith",
      email: "john@example.com",
    },
    createdAt: new Date(2023, 6, 5),
  },
  {
    _id: "f4",
    itemName: "Water Bottle",
    category: "Others",
    foundLocation: "Gym",
    foundDate: new Date(2023, 6, 10),
    description: "Blue metal water bottle with a university logo.",
    imageURL: "",
    status: "claimed",
    isVerified: true,
    claimedAt: new Date(2023, 6, 15),
    reportedBy: {
      name: "Sarah Lee",
      email: "sarah@example.com",
    },
    createdAt: new Date(2023, 6, 10),
  },
  {
    _id: "f5",
    itemName: "Student ID Card",
    category: "ID Cards",
    foundLocation: "Cafeteria",
    foundDate: new Date(2023, 6, 12),
    description: "Student ID card for Emily Johnson.",
    imageURL: "",
    status: "found",
    isVerified: true,
    currentHoldingLocation: "Admin Office",
    reportedBy: {
      name: "David Wilson",
      email: "david@example.com",
    },
    createdAt: new Date(2023, 6, 12),
  },
];

export const MOCK_LOST_ITEMS: LostItem[] = [
  {
    _id: "l1",
    itemName: "Red Backpack",
    category: "Accessories",
    lostLocation: "Library",
    lostDate: new Date(2023, 5, 10),
    description: "Red Jansport backpack with laptop and notebooks inside.",
    status: "lost",
    reportedBy: {
      name: "Emma Thompson",
      email: "emma@example.com",
    },
    createdAt: new Date(2023, 5, 10),
  },
  {
    _id: "l2",
    itemName: "Glasses",
    category: "Accessories",
    lostLocation: "Science Building",
    lostDate: new Date(2023, 5, 15),
    description: "Black-framed prescription glasses in a blue case.",
    status: "lost",
    reportedBy: {
      name: "Michael Brown",
      email: "michael@example.com",
    },
    createdAt: new Date(2023, 5, 15),
  },
  {
    _id: "l3",
    itemName: "Laptop Charger",
    category: "Electronics",
    lostLocation: "Student Center",
    lostDate: new Date(2023, 6, 2),
    description: "MacBook Pro charger with a small tear in the cable.",
    status: "lost",
    reportedBy: {
      name: "Sophia Martinez",
      email: "sophia@example.com",
    },
    createdAt: new Date(2023, 6, 2),
  },
];

export const MOCK_CLAIM_REQUESTS: ClaimRequest[] = [
  {
    _id: "c1",
    item: MOCK_FOUND_ITEMS[0],
    user: {
      _id: "u1",
      name: "James Wilson",
      email: "james@example.com",
      role: "user",
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    proofOfOwnership:
      "The wallet contains my student ID, two credit cards (Visa ending in 4582 and Mastercard ending in 7890), and about $25 in cash. There's also a photo of my dog inside.",
    status: "pending",
    createdAt: new Date(2023, 5, 16),
    updatedAt: new Date(2023, 5, 16),
  },
  {
    _id: "c2",
    item: MOCK_FOUND_ITEMS[1],
    user: {
      _id: "u2",
      name: "Olivia Davis",
      email: "olivia@example.com",
      role: "user",
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    proofOfOwnership:
      "The iPhone has a lock screen wallpaper of a sunset beach. The phone case has a small chip in the bottom right corner. The phone is locked with Face ID and the passcode is 123456.",
    contactPhone: "555-123-4567",
    status: "pending",
    createdAt: new Date(2023, 5, 22),
    updatedAt: new Date(2023, 5, 22),
  },
];

export const MOCK_ITEM_MATCHES: ItemMatch[] = [
  {
    _id: "m1",
    id: "m1",
    lostItem: MOCK_LOST_ITEMS[0],
    foundItem: MOCK_FOUND_ITEMS[2],
    score: 5,
  },
  {
    _id: "m2",
    id: "m2",
    lostItem: MOCK_LOST_ITEMS[2],
    foundItem: MOCK_FOUND_ITEMS[1],
    score: 4,
  },
];

export const MOCK_ITEM_STATS: ItemStats = {
  pending: 2,
  verified: 3,
  claimed: 1,
  rejected: 0,
  total: 6,
};

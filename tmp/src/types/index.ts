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

// Email Template Types
export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  type: "lostItem" | "foundItem" | "itemMatched" | "claimRequest" | "general";
  variables?: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Item Types
export interface BaseItem {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  imageURL?: string;
  images?: string[]; // Added support for multiple images
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
  documents?: DocumentVerification[]; // Added support for document verification
}

// Enhanced Found Item with verification steps
export interface FoundItem extends BaseItem {
  foundLocation: string;
  foundDate: Date;
  currentHoldingLocation?: string;
  isVerified: boolean;
  verificationSteps?: {
    photoVerified?: boolean;
    photoVerifiedAt?: Date;
    photoVerifiedBy?: string | User;
    photoVerificationNotes?: string;

    descriptionVerified?: boolean;
    descriptionVerifiedAt?: Date;
    descriptionVerifiedBy?: string | User;
    descriptionVerificationNotes?: string;

    ownershipProofVerified?: boolean;
    ownershipProofVerifiedAt?: Date;
    ownershipProofVerifiedBy?: string | User;
    ownershipProofVerificationNotes?: string;
  };
  claimedBy?: string | User;
  claimRequestIds?: string[];
  matchedWithLostItem?: string;
  claimedAt?: Date;
  status: "found" | "claimed" | "verified" | "rejected";
  verificationHistory?: VerificationAction[];
  documents?: DocumentVerification[];
}

// Verification Action for history tracking
export interface VerificationAction {
  timestamp: Date;
  action: string;
  performedBy: string | User;
  notes?: string;
}

// Document verification type
export interface DocumentVerification {
  _id?: string;
  documentType: "receipt" | "photo" | "description" | "other";
  documentURL: string;
  name: string;
  description?: string;
  isVerified?: boolean;
  verifiedBy?: string | User;
  verifiedAt?: Date;
  feedback?: string;
  uploadedBy: string | User;
  uploadedAt: Date;
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
  documents?: DocumentVerification[];
}

export interface ItemMatch {
  _id: string;
  lostItem: LostItem;
  foundItem: FoundItem;
  score: number;
  id: string;
  matchType?: "ai" | "manual" | "basic";
  matchDetails?: {
    categoryMatch?: boolean;
    descriptionSimilarity?: number;
    locationProximity?: number;
    dateProximity?: number;
    visualSimilarity?: number;
  };
  createdAt?: Date;
  createdBy?: string | User;
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

// Email Template for improved communication
export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  type: "notification" | "match" | "claim" | "verification" | "other";
  createdBy: string | User;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Communication History for tracking all communications
export interface CommunicationHistory {
  _id?: string;
  userId: string;
  itemId?: string;
  type: "email" | "notification" | "system" | "other";
  subject: string;
  body: string;
  status: "sent" | "failed" | "pending";
  metadata?: {
    emailTemplate?: string;
    ipAddress?: string;
    userAgent?: string;
    deliveryStatus?: string;
    openedAt?: Date;
    clickedAt?: Date;
  };
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics types for dashboard
export interface AnalyticsData {
  itemStats: ItemStats;
  recoveryRates: RecoveryRateData;
  locationData: LocationDataPoint[];
  categoryData: CategoryDataPoint[];
  timelineData: TimelineDataPoint[];
  processingTimes: ProcessingTimeData;
}

export interface RecoveryRateData {
  overall: number; // Percentage of lost items that were found and claimed
  byCategory: { [category: string]: number };
  byTimeframe: { [timeframe: string]: number }; // daily, weekly, monthly
}

export interface LocationDataPoint {
  location: string;
  lostCount: number;
  foundCount: number;
  latitude?: number;
  longitude?: number;
}

export interface CategoryDataPoint {
  category: string;
  lostCount: number;
  foundCount: number;
  recoveryRate: number;
}

export interface TimelineDataPoint {
  date: string;
  lostItems: number;
  foundItems: number;
  claimedItems: number;
}

export interface ProcessingTimeData {
  averageVerificationTime: number; // in hours
  averageClaimProcessingTime: number; // in hours
  averageTimeToMatch: number; // in hours
  averageTimeToRecover: number; // in days
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
  images?: File[]; // For multiple image uploads
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
  images?: File[]; // For multiple image uploads
  contactEmail: string;
  contactPhone?: string;
  reward?: string;
  documents?: File[]; // For document uploads
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
  documents?: File[]; // For document uploads
}

// Batch operations types
export interface BatchOperationData {
  itemIds: string[];
  operation: "verify" | "reject" | "delete" | "notify";
  operationData?: any;
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

// Remove mock data section since we're implementing real data

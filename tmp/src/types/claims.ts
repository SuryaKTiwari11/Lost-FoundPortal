export type ClaimStatus = "pending" | "approved" | "rejected" | "canceled";

export interface ClaimRequest {
  _id: string;
  foundItem: string | any; // Object ID or populated object
  lostItem?: string | any; // Optional Object ID or populated object
  claimant: string | any; // User ID or populated user
  ownershipProof: string;
  contactDetails: string;
  status: ClaimStatus;
  claimDate: Date | string;
  processedBy?: string | any; // Admin who processed the claim
  processedAt?: Date | string;
  adminNotes?: string;
  cancellationReason?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ClaimStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  canceled: number;
}

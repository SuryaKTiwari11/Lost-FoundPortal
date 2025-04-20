"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { ItemStatus } from "@/hooks/useBatchVerification";

interface StatusBadgeProps {
  status: ItemStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-green-700 hover:bg-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-700 hover:bg-red-800">
          <XCircle className="h-3 w-3 mr-1" /> Rejected
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-700 hover:bg-yellow-800">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-700 hover:bg-gray-800">
          <AlertCircle className="h-3 w-3 mr-1" /> Unknown
        </Badge>
      );
  }
}

interface TypeBadgeProps {
  type: "lost" | "found";
}

export function TypeBadge({ type }: TypeBadgeProps) {
  switch (type) {
    case "lost":
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Lost
        </Badge>
      );
    case "found":
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Found
        </Badge>
      );
    default:
      return null;
  }
}

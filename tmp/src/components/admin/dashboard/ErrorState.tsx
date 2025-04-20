"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}

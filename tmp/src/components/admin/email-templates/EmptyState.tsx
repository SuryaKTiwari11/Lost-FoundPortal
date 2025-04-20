"use client";

import { Button } from "@/components/ui/button";
import { Mail, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateTemplate: () => void;
}

export function EmptyState({ onCreateTemplate }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center border rounded-lg p-8">
      <div className="text-center">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-1">No Template Selected</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a template from the list or create a new one
        </p>
        <Button onClick={onCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Template
        </Button>
      </div>
    </div>
  );
}

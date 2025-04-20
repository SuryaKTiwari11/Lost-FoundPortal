"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface EmailPreviewProps {
  isOpen: boolean;
  subject: string;
  body: string;
  onClose: () => void;
  onSendTest: () => void;
}

export function EmailPreview({
  isOpen,
  subject,
  body,
  onClose,
  onSendTest,
}: EmailPreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
          <DialogDescription>
            Preview how your email will look with sample data
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="border-b pb-2">
            <p className="font-medium text-sm text-muted-foreground">
              Subject:
            </p>
            <p className="text-lg font-medium">{subject}</p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-2">
              Body:
            </p>
            <div className="p-4 border rounded-md bg-card whitespace-pre-wrap">
              {body}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onSendTest}>
            <Send className="mr-2 h-4 w-4" />
            Send Test Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

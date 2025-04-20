import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailTemplateFormProps {
  formData: {
    name: string;
    subject: string;
    body: string;
    type: string;
  };
  onChange: (key: string, value: string) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  submitText: string;
  submitIcon: "create" | "update";
}

export function EmailTemplateForm({
  formData,
  onChange,
  isSubmitting,
  onCancel,
  onSubmit,
  submitText,
  submitIcon,
}: EmailTemplateFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Template Name</label>
        <Input
          placeholder="Enter template name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="bg-[#2A2A2A] border-[#333333]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Template Type</label>
        <Select
          value={formData.type}
          onValueChange={(value) => onChange("type", value)}
        >
          <SelectTrigger className="w-full bg-[#2A2A2A] border-[#333333]">
            <SelectValue placeholder="Select template type" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E1E1E] border-[#333333]">
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="match">Match</SelectItem>
            <SelectItem value="claim">Claim</SelectItem>
            <SelectItem value="verification">Verification</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email Subject</label>
        <Input
          placeholder="Enter email subject"
          value={formData.subject}
          onChange={(e) => onChange("subject", e.target.value)}
          className="bg-[#2A2A2A] border-[#333333]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email Body</label>
        <Textarea
          placeholder="Enter email body"
          value={formData.body}
          onChange={(e) => onChange("body", e.target.value)}
          className="min-h-[150px] bg-[#2A2A2A] border-[#333333]"
        />
        <p className="text-xs text-gray-400">
          You can use placeholders like {"{itemName}"}, {"{location}"}, etc.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : submitIcon === "create" ? (
            <Plus className="h-4 w-4 mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          {submitText}
        </Button>
      </div>
    </div>
  );
}

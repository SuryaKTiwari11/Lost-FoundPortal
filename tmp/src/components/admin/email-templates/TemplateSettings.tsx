"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useState } from "react";
import { EmailTemplate } from "@/hooks/useEmailTemplates";

interface TemplateSettingsProps {
  template: EmailTemplate;
  editMode: boolean;
  onUpdateTemplate: (updates: Partial<EmailTemplate>) => void;
  onAddVariable: (variable: string) => void;
  onRemoveVariable: (variable: string) => void;
}

export function TemplateSettings({
  template,
  editMode,
  onUpdateTemplate,
  onAddVariable,
  onRemoveVariable,
}: TemplateSettingsProps) {
  const [newVariable, setNewVariable] = useState("");

  const handleAddVariable = () => {
    if (newVariable.trim()) {
      onAddVariable(newVariable.trim());
      setNewVariable("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="template-status">Template Active</Label>
          <p className="text-sm text-muted-foreground">
            Enable or disable this template
          </p>
        </div>
        <Switch
          id="template-status"
          checked={template.isActive}
          onCheckedChange={(checked) => onUpdateTemplate({ isActive: checked })}
          disabled={!editMode}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-type">Template Type</Label>
        <Select
          disabled={!editMode}
          value={template.type}
          onValueChange={(value) => onUpdateTemplate({ type: value as any })}
        >
          <SelectTrigger id="template-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="confirmation">Confirmation</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-variables">Variables</Label>
        {editMode ? (
          <div className="flex space-x-2">
            <Input
              id="new-variable"
              placeholder="Add variable name"
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newVariable.trim()) {
                  onAddVariable(newVariable.trim());
                  setNewVariable("");
                }
              }}
            />
            <Button variant="outline" onClick={handleAddVariable}>
              Add
            </Button>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 mt-2">
          {template.variables.map((variable) => (
            <div
              key={variable}
              className={`bg-muted flex items-center px-2 py-1 rounded-md ${
                editMode ? "pr-1" : ""
              }`}
            >
              <span className="text-sm">{variable}</span>
              {editMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => onRemoveVariable(variable)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {template.variables.length === 0 && (
            <span className="text-sm text-muted-foreground">
              No variables defined
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { EmailTemplate } from "@/hooks/useEmailTemplates";

interface TemplateContentEditorProps {
  template: EmailTemplate;
  editMode: boolean;
  onUpdateTemplate: (updates: Partial<EmailTemplate>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function TemplateContentEditor({
  template,
  editMode,
  onUpdateTemplate,
  onSave,
  onCancel,
}: TemplateContentEditorProps) {
  const handleInsertVariable = (variable: string) => {
    const textarea = document.getElementById(
      "template-body"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const position = textarea.selectionStart;
      const text = textarea.value;
      const before = text.substring(0, position);
      const after = text.substring(position);
      const newText = `${before}{{${variable}}}${after}`;

      onUpdateTemplate({ body: newText });

      // Set focus back to textarea
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = position + variable.length + 4;
        textarea.selectionEnd = position + variable.length + 4;
      }, 0);
    }
  };

  return (
    <div className="space-y-4">
      {editMode ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={template.name}
              onChange={(e) => onUpdateTemplate({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-subject">Subject Line</Label>
            <Input
              id="template-subject"
              value={template.subject}
              onChange={(e) => onUpdateTemplate({ subject: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-body">Email Body</Label>
            <Textarea
              id="template-body"
              value={template.body}
              onChange={(e) => onUpdateTemplate({ body: e.target.value })}
              className="min-h-[200px] font-mono"
            />
          </div>
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium mb-2">Available Variables:</p>
            <div className="flex flex-wrap gap-2">
              {template.variables.map((variable) => (
                <span
                  key={variable}
                  className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs cursor-pointer"
                  onClick={() => handleInsertVariable(variable)}
                >
                  {"{{" + variable + "}}"}
                </span>
              ))}
              {template.variables.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No variables available
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Subject</Label>
            <p className="text-lg">{template.subject}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Body</Label>
            <div className="p-4 border rounded-md whitespace-pre-wrap">
              {template.body}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

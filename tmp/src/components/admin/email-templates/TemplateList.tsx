"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { EmailTemplate } from "@/hooks/useEmailTemplates";

interface TemplateListProps {
  templates: EmailTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: EmailTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export function TemplateList({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onDeleteTemplate,
}: TemplateListProps) {
  return (
    <div className="col-span-1 border rounded-lg shadow-sm overflow-hidden">
      <div className="bg-muted p-4 border-b">
        <h3 className="font-semibold">Available Templates</h3>
      </div>
      <div className="divide-y">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`p-4 flex justify-between items-center hover:bg-muted/50 cursor-pointer ${
              selectedTemplateId === template.id ? "bg-muted" : ""
            }`}
          >
            <div>
              <p className="font-medium">{template.name}</p>
              <p className="text-sm text-muted-foreground">
                {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {template.isActive ? (
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              ) : (
                <span className="h-2 w-2 bg-gray-300 rounded-full"></span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTemplate(template.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No templates available
          </div>
        )}
      </div>
    </div>
  );
}

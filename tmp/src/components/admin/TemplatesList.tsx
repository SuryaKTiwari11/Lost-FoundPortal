import { FileText, Loader2, Pencil, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateBadge } from "./TemplateBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EmailTemplate } from "@/types";

interface TemplatesListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (template: EmailTemplate) => void;
  onSelect?: (template: EmailTemplate) => void;
  filterType: string;
}

export function TemplatesList({
  templates,
  isLoading,
  onEdit,
  onDelete,
  onSelect,
  filterType,
}: TemplatesListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <FileText className="h-12 w-12 mb-4 opacity-30" />
        <h3 className="text-xl font-medium mb-2">No templates found</h3>
        <p className="text-sm text-center">
          {filterType === "all"
            ? "Create your first email template to get started"
            : `No templates found with the ${filterType} type`}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#242424] border-[#333333]">
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[250px]">Subject</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow
              key={template._id}
              className="hover:bg-[#242424] border-[#333333]"
            >
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell className="truncate max-w-[250px]">
                {template.subject}
              </TableCell>
              <TableCell>
                <TemplateBadge type={template.type} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onSelect && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onSelect(template)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(template)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-red-800 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                    onClick={() => onDelete(template)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

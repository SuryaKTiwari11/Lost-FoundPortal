"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TemplatesList } from "./TemplatesList";
import { TemplateFilter } from "./TemplateFilter";
import { EmailTemplateForm } from "./EmailTemplateForm";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import type { EmailTemplate } from "@/types";

interface EmailTemplatesProps {
  selectable?: boolean;
  onSelectTemplate?: (template: EmailTemplate) => void;
}

export function EmailTemplates({
  selectable = false,
  onSelectTemplate,
}: EmailTemplatesProps) {
  const {
    templates,
    isLoading,
    isSubmitting,
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    filterType,
    formData,
    selectedTemplate,
    setFormData,
    setFilterType,
    setShowCreateDialog,
    setShowEditDialog,
    setShowDeleteDialog,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    handleEditClick,
    handleDeleteClick,
    handleSelectTemplate,
    openCreateDialog,
  } = useEmailTemplates(onSelectTemplate);

  // Handle form field changes
  const handleFormChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="rounded-md border border-[#333333] overflow-hidden">
      <div className="bg-[#242424] p-4 flex justify-between items-center border-b border-[#333333]">
        <h3 className="text-lg font-medium">Email Templates</h3>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <TemplateFilter filterType={filterType} onFilterChange={setFilterType} />

      <TemplatesList
        templates={templates}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onSelect={selectable ? handleSelectTemplate : undefined}
        filterType={filterType}
      />

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
          </DialogHeader>
          <EmailTemplateForm
            formData={formData}
            onChange={handleFormChange}
            isSubmitting={isSubmitting}
            onCancel={() => setShowCreateDialog(false)}
            onSubmit={handleCreateTemplate}
            submitText="Create Template"
            submitIcon="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
          </DialogHeader>
          <EmailTemplateForm
            formData={formData}
            onChange={handleFormChange}
            isSubmitting={isSubmitting}
            onCancel={() => setShowEditDialog(false)}
            onSubmit={handleUpdateTemplate}
            submitText="Update Template"
            submitIcon="update"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#1A1A1A] border-[#333333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the template &quot;
              {selectedTemplate?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

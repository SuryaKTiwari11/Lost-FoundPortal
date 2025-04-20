import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { EmailTemplate, ApiResponse } from "@/types";

// Initial form data state
const initialFormData = {
  name: "",
  subject: "",
  body: "",
  type: "general",
};

export function useEmailTemplates(
  onSelectTemplate?: (template: EmailTemplate) => void
) {
  // State for templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState<string>("all");

  // Currently selected template for edit/delete operations
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);

  // Form data state
  const [formData, setFormData] = useState(initialFormData);

  // Fetch all email templates
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/email-templates");
      const data: ApiResponse<EmailTemplate[]> = await response.json();

      if (data.success && data.data) {
        setTemplates(data.data);
      } else {
        toast.error(data.error || "Failed to fetch templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("An error occurred while fetching templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Open create dialog
  const openCreateDialog = () => {
    setFormData(initialFormData);
    setShowCreateDialog(true);
  };

  // Handle edit button click
  const handleEditClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
    });
    setShowEditDialog(true);
  };

  // Handle delete button click
  const handleDeleteClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  // Handle template selection (for when used in a selector)
  const handleSelectTemplate = (template: EmailTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  // Create new template
  const handleCreateTemplate = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<EmailTemplate> = await response.json();

      if (data.success) {
        toast.success("Template created successfully");
        setShowCreateDialog(false);
        fetchTemplates();
      } else {
        toast.error(data.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("An error occurred while creating the template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing template
  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/email-templates/${selectedTemplate._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data: ApiResponse = await response.json();

      if (data.success) {
        toast.success("Template updated successfully");
        setShowEditDialog(false);
        fetchTemplates();
      } else {
        toast.error(data.error || "Failed to update template");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("An error occurred while updating the template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/email-templates/${selectedTemplate._id}`,
        {
          method: "DELETE",
        }
      );

      const data: ApiResponse = await response.json();

      if (data.success) {
        toast.success("Template deleted successfully");
        setShowDeleteDialog(false);
        fetchTemplates();
      } else {
        toast.error(data.error || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("An error occurred while deleting the template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}

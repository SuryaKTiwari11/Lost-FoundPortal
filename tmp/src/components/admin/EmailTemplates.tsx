"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Plus, Pencil, Trash2, FileText, Loader2, Check } from "lucide-react";
import { adminAPI } from "@/services/api";
import { toast } from "sonner";
import type { EmailTemplate as EmailTemplateType } from "@/types";

interface EmailTemplatesProps {
  onSelectTemplate?: (template: EmailTemplateType) => void;
}

export default function EmailTemplates({
  onSelectTemplate,
}: EmailTemplatesProps) {
  const [templates, setTemplates] = useState<EmailTemplateType[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplateType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    type: "notification",
  });

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates when filterType changes
  const filteredTemplates =
    filterType === "all"
      ? templates
      : templates.filter((template) => template.type === filterType);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getEmailTemplates();
      if (response.success) {
        setTemplates(response.data as EmailTemplateType[]);
      } else {
        toast.error(response.error || "Failed to load email templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("An error occurred while loading email templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setIsSubmitting(true);
      const { name, subject, body, type } = formData;

      if (!name.trim() || !subject.trim() || !body.trim()) {
        toast.error("Please fill all required fields");
        return;
      }

      const response = await adminAPI.createEmailTemplate(
        name,
        subject,
        body,
        type
      );
      if (response.success) {
        toast.success("Email template created successfully");
        setTemplates([...templates, response.data as EmailTemplateType]);
        setShowCreateDialog(false);
        resetForm();
      } else {
        toast.error(response.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("An error occurred while creating template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      if (!selectedTemplate) return;

      setIsSubmitting(true);
      const { name, subject, body, type } = formData;

      if (!name.trim() || !subject.trim() || !body.trim()) {
        toast.error("Please fill all required fields");
        return;
      }

      const response = await adminAPI.updateEmailTemplate(
        selectedTemplate._id,
        name,
        subject,
        body,
        type
      );

      if (response.success) {
        toast.success("Email template updated successfully");
        setTemplates(
          templates.map((t) =>
            t._id === selectedTemplate._id
              ? (response.data as EmailTemplateType)
              : t
          )
        );
        setShowEditDialog(false);
        resetForm();
      } else {
        toast.error(response.error || "Failed to update template");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("An error occurred while updating template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      if (!selectedTemplate) return;

      setIsSubmitting(true);
      const response = await adminAPI.deleteEmailTemplate(selectedTemplate._id);

      if (response.success) {
        toast.success("Template deleted successfully");
        setTemplates(templates.filter((t) => t._id !== selectedTemplate._id));
        setShowDeleteDialog(false);
      } else {
        toast.error(response.error || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("An error occurred while deleting template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (template: EmailTemplateType) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
    });
    setShowEditDialog(true);
  };

  const handleDeleteClick = (template: EmailTemplateType) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  const handleSelectTemplate = (template: EmailTemplateType) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      body: "",
      type: "notification",
    });
    setSelectedTemplate(null);
  };

  // Get badge color by template type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "notification":
        return (
          <Badge className="bg-blue-700 hover:bg-blue-800">Notification</Badge>
        );
      case "match":
        return <Badge className="bg-green-700 hover:bg-green-800">Match</Badge>;
      case "claim":
        return (
          <Badge className="bg-purple-700 hover:bg-purple-800">Claim</Badge>
        );
      case "verification":
        return (
          <Badge className="bg-yellow-700 hover:bg-yellow-800">
            Verification
          </Badge>
        );
      default:
        return <Badge className="bg-gray-700 hover:bg-gray-800">Other</Badge>;
    }
  };

  return (
    <Card className="bg-[#1E1E1E] border-[#333333] shadow-lg overflow-hidden">
      <CardHeader className="bg-[#242424] border-b border-[#333333]">
        <div className="flex justify-between items-center">
          <CardTitle>Email Templates</CardTitle>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          Manage email templates for various notifications
        </CardDescription>
      </CardHeader>

      <div className="p-4 border-b border-[#333333] bg-[#242424]">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">Filter:</div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-[#1E1E1E] border-[#333333]">
              <SelectValue placeholder="All Templates" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E1E1E] border-[#333333]">
              <SelectItem value="all">All Templates</SelectItem>
              <SelectItem value="notification">Notification</SelectItem>
              <SelectItem value="match">Match</SelectItem>
              <SelectItem value="claim">Claim</SelectItem>
              <SelectItem value="verification">Verification</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileText className="h-12 w-12 mb-4 opacity-30" />
            <h3 className="text-xl font-medium mb-2">No templates found</h3>
            <p className="text-sm text-center">
              {filterType === "all"
                ? "Create your first email template to get started"
                : `No templates found with the ${filterType} type`}
            </p>
          </div>
        ) : (
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
                {filteredTemplates.map((template) => (
                  <TableRow
                    key={template._id}
                    className="hover:bg-[#242424] border-[#333333]"
                  >
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell className="truncate max-w-[250px]">
                      {template.subject}
                    </TableCell>
                    <TableCell>{getTypeBadge(template.type)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onSelectTemplate && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-red-800 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                          onClick={() => handleDeleteClick(template)}
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
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-[#333333] bg-[#242424]">
        <div className="text-sm text-gray-400">
          {filteredTemplates.length}{" "}
          {filteredTemplates.length === 1 ? "template" : "templates"}{" "}
          {filterType !== "all" && `(filtered by ${filterType})`}
        </div>
      </CardFooter>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1E1E1E] border-[#333333]">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a reusable email template for notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="Enter template name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-[#2A2A2A] border-[#333333]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="bg-[#2A2A2A] border-[#333333]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Body</label>
              <Textarea
                placeholder="Enter email body"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                className="min-h-[150px] bg-[#2A2A2A] border-[#333333]"
              />
              <p className="text-xs text-gray-400">
                You can use placeholders like {"{itemName}"}, {"{location}"},
                etc.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1E1E1E] border-[#333333]">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the selected email template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="Enter template name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-[#2A2A2A] border-[#333333]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="bg-[#2A2A2A] border-[#333333]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Body</label>
              <Textarea
                placeholder="Enter email body"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                className="min-h-[150px] bg-[#2A2A2A] border-[#333333]"
              />
              <p className="text-xs text-gray-400">
                You can use placeholders like {"{itemName}"}, {"{location}"},
                etc.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1E1E1E] border-[#333333]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this template? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTemplate && (
              <div className="p-4 bg-[#2A2A2A] rounded-md">
                <div className="font-medium">{selectedTemplate.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {selectedTemplate.subject}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
              disabled={isSubmitting}
              className="bg-red-700 hover:bg-red-800 focus:ring-red-500"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

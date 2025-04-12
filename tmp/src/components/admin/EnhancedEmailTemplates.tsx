"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save, Trash2, Edit, Eye, Code, Mail, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: "notification" | "confirmation" | "reminder" | "other";
  isActive: boolean;
  lastModified: string;
  variables: string[];
};

const mockTemplates: EmailTemplate[] = [
  {
    id: "template-1",
    name: "Item Found Notification",
    subject: "Good News! Your Lost Item Has Been Found",
    body: "Hello {{userName}},\n\nWe're pleased to inform you that an item matching your lost report has been found. The item was found at {{foundLocation}} on {{foundDate}}.\n\nPlease visit our office to verify and claim your item. You'll need to bring your ID and proof of ownership.\n\nItem Details:\n- Category: {{itemCategory}}\n- Description: {{itemDescription}}\n\nBest regards,\nLost & Found Team",
    type: "notification",
    isActive: true,
    lastModified: "2024-04-01T12:00:00Z",
    variables: [
      "userName",
      "foundLocation",
      "foundDate",
      "itemCategory",
      "itemDescription",
    ],
  },
  {
    id: "template-2",
    name: "Verification Reminder",
    subject: "Reminder: Your Item is Waiting for Collection",
    body: "Hello {{userName}},\n\nThis is a friendly reminder that your lost item is still waiting for collection at our office. Please visit us at your earliest convenience.\n\nYour claim reference number is: {{claimReference}}\n\nIf you cannot collect your item within {{daysRemaining}} days, please contact us to make alternative arrangements.\n\nBest regards,\nLost & Found Team",
    type: "reminder",
    isActive: true,
    lastModified: "2024-03-28T15:30:00Z",
    variables: ["userName", "claimReference", "daysRemaining"],
  },
];

export default function EnhancedEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<{
    show: boolean;
    subject: string;
    body: string;
  }>({
    show: false,
    subject: "",
    body: "",
  });

  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [claimReferenceNumber, setClaimReferenceNumber] = useState("");

  // Generate stable claim reference on client-side only
  useEffect(() => {
    setClaimReferenceNumber(
      "CLAIM-" + Math.floor(10000 + Math.random() * 90000)
    );
  }, []);

  // Preview with sample data
  const generatePreview = (template: EmailTemplate) => {
    const sampleData = {
      userName: "John Smith",
      foundLocation: "Main Building, Room 101",
      foundDate: new Date().toLocaleDateString(),
      itemCategory: "Electronics",
      itemDescription: "Black smartphone with cracked screen",
      claimReference: claimReferenceNumber || "CLAIM-12345", // Use stable reference
      daysRemaining: "7",
    };

    let previewSubject = template.subject;
    let previewBody = template.body;

    // Replace all variables in the template
    template.variables.forEach((variable) => {
      const pattern = new RegExp(`{{${variable}}}`, "g");
      const value = sampleData[variable as keyof typeof sampleData];

      if (value) {
        previewSubject = previewSubject.replace(pattern, value);
        previewBody = previewBody.replace(pattern, value);
      }
    });

    return { subject: previewSubject, body: previewBody };
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditMode(false);
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    // In a real app, you would call an API here
    setTemplates(
      templates.map((t) =>
        t.id === selectedTemplate.id
          ? { ...selectedTemplate, lastModified: new Date().toISOString() }
          : t
      )
    );

    setEditMode(false);
    toast.success("Email template saved successfully");
  };

  const handlePreviewTemplate = () => {
    if (!selectedTemplate) return;

    const preview = generatePreview(selectedTemplate);
    setPreviewEmail({
      show: true,
      subject: preview.subject,
      body: preview.body,
    });
  };

  const handleSendTestEmail = async () => {
    if (!selectedTemplate || !testEmailAddress) return;

    setSendingEmail(true);

    try {
      // Simulate API call to send email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Test email sent to ${testEmailAddress}`);
    } catch (error) {
      toast.error("Failed to send test email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCreateTemplate = () => {
    // Use stable IDs with incrementing numbers instead of timestamps
    const newTemplateId = `template-${templates.length + 10}`;

    const newTemplate: EmailTemplate = {
      id: newTemplateId,
      name: "New Template",
      subject: "Subject",
      body: "Email body...",
      type: "other",
      isActive: true,
      lastModified: new Date().toISOString(),
      variables: [],
    };

    setTemplates([...templates, newTemplate]);
    setSelectedTemplate(newTemplate);
    setEditMode(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
    toast.success("Template deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <Button onClick={handleCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="col-span-1 border rounded-lg shadow-sm overflow-hidden">
          <div className="bg-muted p-4 border-b">
            <h3 className="font-semibold">Available Templates</h3>
          </div>
          <div className="divide-y">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-4 flex justify-between items-center hover:bg-muted/50 cursor-pointer ${
                  selectedTemplate?.id === template.id ? "bg-muted" : ""
                }`}
              >
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.type.charAt(0).toUpperCase() +
                      template.type.slice(1)}
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
                      handleDeleteTemplate(template.id);
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

        {/* Template Editor */}
        <div className="col-span-1 md:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>
                    {editMode ? "Edit Template" : selectedTemplate.name}
                  </CardTitle>
                  <CardDescription>
                    Last modified:{" "}
                    {new Date(selectedTemplate.lastModified).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {!editMode ? (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviewTemplate}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSaveTemplate}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <CardContent className="space-y-4">
                    {editMode ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="template-name">Template Name</Label>
                          <Input
                            id="template-name"
                            value={selectedTemplate.name}
                            onChange={(e) =>
                              setSelectedTemplate({
                                ...selectedTemplate,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template-subject">Subject Line</Label>
                          <Input
                            id="template-subject"
                            value={selectedTemplate.subject}
                            onChange={(e) =>
                              setSelectedTemplate({
                                ...selectedTemplate,
                                subject: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template-body">Email Body</Label>
                          <Textarea
                            id="template-body"
                            value={selectedTemplate.body}
                            onChange={(e) =>
                              setSelectedTemplate({
                                ...selectedTemplate,
                                body: e.target.value,
                              })
                            }
                            className="min-h-[200px] font-mono"
                          />
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm font-medium mb-2">
                            Available Variables:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedTemplate.variables.map((variable) => (
                              <span
                                key={variable}
                                className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                                onClick={() => {
                                  const textarea = document.getElementById(
                                    "template-body"
                                  ) as HTMLTextAreaElement;
                                  if (textarea) {
                                    const position = textarea.selectionStart;
                                    const text = textarea.value;
                                    const before = text.substring(0, position);
                                    const after = text.substring(position);
                                    const newText = `${before}{{${variable}}}${after}`;
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      body: newText,
                                    });
                                    // Set focus back to textarea
                                    setTimeout(() => {
                                      textarea.focus();
                                      textarea.selectionStart =
                                        position + variable.length + 4;
                                      textarea.selectionEnd =
                                        position + variable.length + 4;
                                    }, 0);
                                  }
                                }}
                              >
                                {"{{" + variable + "}}"}
                              </span>
                            ))}
                            {selectedTemplate.variables.length === 0 && (
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
                          <Label className="text-muted-foreground">
                            Subject
                          </Label>
                          <p className="text-lg">{selectedTemplate.subject}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Body</Label>
                          <div className="p-4 border rounded-md whitespace-pre-wrap">
                            {selectedTemplate.body}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4">
                    {editMode ? (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSaveTemplate}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <div className="w-full">
                        <div className="flex items-center space-x-2 mb-4">
                          <Input
                            placeholder="Enter email to send test"
                            value={testEmailAddress}
                            onChange={(e) =>
                              setTestEmailAddress(e.target.value)
                            }
                          />
                          <Button
                            onClick={handleSendTestEmail}
                            disabled={!testEmailAddress || sendingEmail}
                          >
                            {sendingEmail ? (
                              "Sending..."
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Test
                              </>
                            )}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handlePreviewTemplate}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview With Sample Data
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </TabsContent>

                <TabsContent value="settings">
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="template-status">Template Active</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable this template
                        </p>
                      </div>
                      <Switch
                        id="template-status"
                        checked={selectedTemplate.isActive}
                        onCheckedChange={(checked) =>
                          setSelectedTemplate({
                            ...selectedTemplate,
                            isActive: checked,
                          })
                        }
                        disabled={!editMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-type">Template Type</Label>
                      <Select
                        disabled={!editMode}
                        value={selectedTemplate.type}
                        onValueChange={(value) =>
                          setSelectedTemplate({
                            ...selectedTemplate,
                            type: value as any,
                          })
                        }
                      >
                        <SelectTrigger id="template-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notification">
                            Notification
                          </SelectItem>
                          <SelectItem value="confirmation">
                            Confirmation
                          </SelectItem>
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.currentTarget.value) {
                                const newVar = e.currentTarget.value.trim();
                                if (
                                  newVar &&
                                  !selectedTemplate.variables.includes(newVar)
                                ) {
                                  setSelectedTemplate({
                                    ...selectedTemplate,
                                    variables: [
                                      ...selectedTemplate.variables,
                                      newVar,
                                    ],
                                  });
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById(
                                "new-variable"
                              ) as HTMLInputElement;
                              if (input && input.value.trim()) {
                                const newVar = input.value.trim();
                                if (
                                  !selectedTemplate.variables.includes(newVar)
                                ) {
                                  setSelectedTemplate({
                                    ...selectedTemplate,
                                    variables: [...selectedTemplate, newVar],
                                  });
                                  input.value = "";
                                }
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTemplate.variables.map((variable) => (
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
                                onClick={() =>
                                  setSelectedTemplate({
                                    ...selectedTemplate,
                                    variables:
                                      selectedTemplate.variables.filter(
                                        (v) => v !== variable
                                      ),
                                  })
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {selectedTemplate.variables.length === 0 && (
                          <span className="text-sm text-muted-foreground">
                            No variables defined
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg p-8">
              <div className="text-center">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">
                  No Template Selected
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a template from the list or create a new one
                </p>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={previewEmail.show}
        onOpenChange={(open) =>
          setPreviewEmail({ ...previewEmail, show: open })
        }
      >
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
              <p className="text-lg font-medium">{previewEmail.subject}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-2">
                Body:
              </p>
              <div className="p-4 border rounded-md bg-card whitespace-pre-wrap">
                {previewEmail.body}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewEmail({ ...previewEmail, show: false })}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setPreviewEmail({ ...previewEmail, show: false });
                setTestEmailAddress("");
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

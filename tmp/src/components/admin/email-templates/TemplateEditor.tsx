"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Eye, Save, Send } from "lucide-react";
import { TemplateContentEditor } from "./TemplateContentEditor";
import { TemplateSettings } from "./TemplateSettings";
import { EmailTemplate } from "@/hooks/useEmailTemplates";

interface TemplateEditorProps {
  template: EmailTemplate;
  editMode: boolean;
  testEmailAddress: string;
  sendingEmail: boolean;
  onSetEditMode: (value: boolean) => void;
  onUpdateTemplate: (updates: Partial<EmailTemplate>) => void;
  onSaveTemplate: () => void;
  onPreviewTemplate: () => void;
  onSendTestEmail: () => void;
  onSetTestEmailAddress: (value: string) => void;
  onAddVariable: (variable: string) => void;
  onRemoveVariable: (variable: string) => void;
}

export function TemplateEditor({
  template,
  editMode,
  testEmailAddress,
  sendingEmail,
  onSetEditMode,
  onUpdateTemplate,
  onSaveTemplate,
  onPreviewTemplate,
  onSendTestEmail,
  onSetTestEmailAddress,
  onAddVariable,
  onRemoveVariable,
}: TemplateEditorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{editMode ? "Edit Template" : template.name}</CardTitle>
          <CardDescription>
            Last modified: {new Date(template.lastModified).toLocaleString()}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          {!editMode ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSetEditMode(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onPreviewTemplate}>
                <Eye className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="outline" size="icon" onClick={onSaveTemplate}>
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
            <TemplateContentEditor
              template={template}
              editMode={editMode}
              onUpdateTemplate={onUpdateTemplate}
              onSave={onSaveTemplate}
              onCancel={() => onSetEditMode(false)}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            {editMode ? (
              <>
                <Button variant="ghost" onClick={() => onSetEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={onSaveTemplate}>
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
                    onChange={(e) => onSetTestEmailAddress(e.target.value)}
                  />
                  <Button
                    onClick={onSendTestEmail}
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
                  onClick={onPreviewTemplate}
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
            <TemplateSettings
              template={template}
              editMode={editMode}
              onUpdateTemplate={onUpdateTemplate}
              onAddVariable={onAddVariable}
              onRemoveVariable={onRemoveVariable}
            />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

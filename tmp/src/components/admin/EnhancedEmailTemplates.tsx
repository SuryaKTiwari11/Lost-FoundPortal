"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import {
  TemplateList,
  TemplateEditor,
  EmailPreview,
  EmptyState,
} from "@/components/admin/email-templates";

export default function EnhancedEmailTemplates() {
  const {
    templates,
    selectedTemplate,
    editMode,
    previewEmail,
    testEmailAddress,
    sendingEmail,
    setEditMode,
    setTestEmailAddress,
    handleTemplateSelect,
    handleSaveTemplate,
    handlePreviewTemplate,
    handleSendTestEmail,
    handleCreateTemplate,
    handleDeleteTemplate,
    handleUpdateTemplate,
    handleAddVariable,
    handleRemoveVariable,
    closePreview,
  } = useEmailTemplates();

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
        <TemplateList
          templates={templates}
          selectedTemplateId={selectedTemplate?.id || null}
          onSelectTemplate={handleTemplateSelect}
          onDeleteTemplate={handleDeleteTemplate}
        />

        {/* Template Editor */}
        <div className="col-span-1 md:col-span-2">
          {selectedTemplate ? (
            <TemplateEditor
              template={selectedTemplate}
              editMode={editMode}
              testEmailAddress={testEmailAddress}
              sendingEmail={sendingEmail}
              onSetEditMode={setEditMode}
              onUpdateTemplate={handleUpdateTemplate}
              onSaveTemplate={handleSaveTemplate}
              onPreviewTemplate={handlePreviewTemplate}
              onSendTestEmail={handleSendTestEmail}
              onSetTestEmailAddress={setTestEmailAddress}
              onAddVariable={handleAddVariable}
              onRemoveVariable={handleRemoveVariable}
            />
          ) : (
            <EmptyState onCreateTemplate={handleCreateTemplate} />
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <EmailPreview
        isOpen={previewEmail.show}
        subject={previewEmail.subject}
        body={previewEmail.body}
        onClose={closePreview}
        onSendTest={() => {
          closePreview();
          setTestEmailAddress("");
        }}
      />
    </div>
  );
}

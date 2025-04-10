"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Step = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "skipped";
  actions?: {
    label: string;
    onClick: () => void;
  }[];
};

export default function VerificationSteps({ itemId }: { itemId?: string }) {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "step-1",
      title: "Initial Verification",
      description: "Review item details and verify the report",
      status: "completed",
      actions: [
        {
          label: "View Details",
          onClick: () => console.log("View details clicked"),
        },
      ],
    },
    {
      id: "step-2",
      title: "Evidence Check",
      description: "Verify photos and description against physical item",
      status: "in-progress",
      actions: [
        {
          label: "Mark as Verified",
          onClick: () => handleStepComplete("step-2"),
        },
        {
          label: "Request More Info",
          onClick: () => console.log("Request more info clicked"),
        },
      ],
    },
    {
      id: "step-3",
      title: "Owner Notification",
      description: "Send notification to potential owners",
      status: "pending",
      actions: [
        {
          label: "Send Notification",
          onClick: () => handleStepComplete("step-3"),
        },
        {
          label: "Skip",
          onClick: () => handleStepSkip("step-3"),
        },
      ],
    },
    {
      id: "step-4",
      title: "Claim Verification",
      description: "Verify ownership claim and validate identity",
      status: "pending",
      actions: [
        {
          label: "Verify Claim",
          onClick: () => handleStepComplete("step-4"),
        },
        {
          label: "Reject Claim",
          onClick: () => console.log("Reject claim clicked"),
        },
      ],
    },
    {
      id: "step-5",
      title: "Handover",
      description: "Complete handover process and obtain signature",
      status: "pending",
      actions: [
        {
          label: "Complete Handover",
          onClick: () => handleStepComplete("step-5"),
        },
      ],
    },
  ]);

  const handleStepComplete = (stepId: string) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, status: "completed" as const } : step
      )
    );

    // Find the next pending step and set it to in-progress
    const currentIndex = steps.findIndex((step) => step.id === stepId);
    const nextPendingStep = steps
      .slice(currentIndex + 1)
      .find((step) => step.status === "pending");

    if (nextPendingStep) {
      setSteps(
        steps.map((step) =>
          step.id === nextPendingStep.id
            ? { ...step, status: "in-progress" as const }
            : step
        )
      );
    }
  };

  const handleStepSkip = (stepId: string) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, status: "skipped" as const } : step
      )
    );

    // Find the next pending step and set it to in-progress
    const currentIndex = steps.findIndex((step) => step.id === stepId);
    const nextPendingStep = steps
      .slice(currentIndex + 1)
      .find((step) => step.status === "pending");

    if (nextPendingStep) {
      setSteps(
        steps.map((step) =>
          step.id === nextPendingStep.id
            ? { ...step, status: "in-progress" as const }
            : step
        )
      );
    }
  };

  const totalSteps = steps.length;
  const completedSteps = steps.filter(
    (step) => step.status === "completed" || step.status === "skipped"
  ).length;

  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Verification Progress</h3>
        <div className="flex items-center gap-2">
          <Progress value={progressPercentage} className="h-2" />
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {steps.map((step, index) => (
          <AccordionItem key={step.id} value={step.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    step.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : step.status === "in-progress"
                        ? "bg-blue-100 text-blue-600"
                        : step.status === "skipped"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.status === "completed" ? (
                    <Check className="h-4 w-4" />
                  ) : step.status === "skipped" ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{step.title}</span>
                  <span
                    className={`text-xs ${
                      step.status === "completed"
                        ? "text-green-600"
                        : step.status === "in-progress"
                          ? "text-blue-600"
                          : step.status === "skipped"
                            ? "text-gray-500"
                            : "text-gray-400"
                    }`}
                  >
                    {step.status === "completed"
                      ? "Completed"
                      : step.status === "in-progress"
                        ? "In Progress"
                        : step.status === "skipped"
                          ? "Skipped"
                          : "Pending"}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4 text-sm text-gray-600">
                    {step.description}
                  </p>

                  {step.status === "in-progress" && (
                    <div className="bg-blue-50 p-3 rounded-md flex items-center gap-2 mb-4">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        This step is currently in progress
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {step.actions?.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={actionIndex === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={action.onClick}
                        disabled={
                          step.status === "pending" &&
                          index !== 0 &&
                          steps[index - 1].status !== "completed" &&
                          steps[index - 1].status !== "skipped"
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

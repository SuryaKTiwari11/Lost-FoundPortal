"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FormProgressBarProps {
  steps: number;
  currentStep: number;
  className?: string;
}

export function FormProgressBar({
  steps,
  currentStep,
  className,
}: FormProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate progress percentage
    const percentage = Math.round((currentStep / (steps - 1)) * 100);
    setProgress(percentage);
  }, [currentStep, steps]);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between px-1">
        {Array.from({ length: steps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300",
              i + 1 <= currentStep + 1
                ? "bg-[#FFD166] text-[#1E1E1E]"
                : "bg-[#333333] text-gray-400"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="w-full bg-[#333333] rounded-full h-2.5">
        <div
          className="bg-[#FFD166] h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between px-1">
        <p className="text-xs text-gray-400">
          Step {currentStep + 1} of {steps}
        </p>
        <p className="text-xs text-gray-400">{progress}% Complete</p>
      </div>
    </div>
  );
}

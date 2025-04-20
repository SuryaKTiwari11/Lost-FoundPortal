import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FormProgressBarProps {
  progress: number;
  step: number;
  totalSteps: number;
  className?: string;
}

export function FormProgressBar({
  progress,
  step,
  totalSteps,
  className,
}: FormProgressBarProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex justify-between mb-2 text-sm">
        <span className="text-gray-400">
          Step {step} of {totalSteps}
        </span>
        <span className="text-gray-400">{Math.round(progress)}%</span>
      </div>
      <Progress
        value={progress}
        className="h-1 bg-[#333333]"
        indicatorClassName="bg-[#FFD166]"
      />
    </div>
  );
}

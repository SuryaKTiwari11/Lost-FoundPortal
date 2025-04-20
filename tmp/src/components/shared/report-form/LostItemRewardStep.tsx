import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { DollarSign, AlertCircle } from "lucide-react";

interface LostItemRewardStepProps {
  control: Control<any>;
  register: any;
  errors: any;
}

export function LostItemRewardStep({
  control,
  register,
  errors,
}: LostItemRewardStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">
        Reward & Additional Information
      </h2>

      {/* Reward Information */}
      <div className="space-y-1">
        <FormField
          control={control}
          name="reward"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Reward (Optional)</FormLabel>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input
                    placeholder="Enter reward amount (if any)"
                    className="bg-[#1E1E1E] border-[#333333] pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
              <p className="text-xs text-gray-500 mt-1">
                Adding a reward can increase your chances of getting your item
                back
              </p>
            </FormItem>
          )}
        />
      </div>

      {/* Additional Details */}
      <div className="space-y-1">
        <FormField
          control={control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">
                Additional Information (Optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information that might help identify your item"
                  className="min-h-[120px] bg-[#1E1E1E] border-[#333333]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Important Notice */}
      <div className="rounded-lg bg-[#1A1A1A] border border-[#333333] p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#FFD166] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">
              Important Notice
            </h4>
            <p className="text-xs text-gray-400">
              Please be aware that all reports are reviewed by our team. False
              reports or misuse of the system may result in account suspension.
              We encourage honest and accurate reporting to ensure the platform
              remains useful for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

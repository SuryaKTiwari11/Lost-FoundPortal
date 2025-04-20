import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { Mail, User, Phone } from "lucide-react";
import { ItemReportFormType } from "@/hooks/useItemReportForm";

interface ContactInfoStepProps {
  control: Control<any>;
  type: ItemReportFormType;
  register: any;
  errors: any;
}

export function ContactInfoStep({
  control,
  type,
  register,
  errors,
}: ContactInfoStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
      <p className="text-sm text-gray-400 mb-4">
        Please provide your contact details so that{" "}
        {type === "lost" ? "finders" : "owners"} can reach you.
      </p>

      {/* Contact Name */}
      <div className="space-y-1">
        <FormField
          control={control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Your Name</FormLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    className="bg-[#1E1E1E] border-[#333333] pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact Email */}
      <div className="space-y-1">
        <FormField
          control={control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Email Address</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="bg-[#1E1E1E] border-[#333333] pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact Phone */}
      <div className="space-y-1">
        <FormField
          control={control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">
                Phone Number (Optional)
              </FormLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="bg-[#1E1E1E] border-[#333333] pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

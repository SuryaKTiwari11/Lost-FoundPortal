"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Control } from "react-hook-form";

interface LocationTimeStepProps {
  control: Control<any>;
  register: any;
  errors: any;
  formType: "lost" | "found";
}

export function LocationTimeStep({
  control,
  register,
  errors,
  formType,
}: LocationTimeStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {formType === "lost" ? "Where & When Lost" : "Where & When Found"}
      </h2>

      <FormField
        control={control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="Enter the location"
                  {...field}
                  className="bg-[#1E1E1E] border-[#333333] pl-10"
                />
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </FormControl>
            <FormDescription>
              Be as specific as possible (e.g., "Central Library, 2nd floor")
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal bg-[#1E1E1E] border-[#333333]",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-[#1E1E1E] border-[#333333]"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              {formType === "lost"
                ? "When did you lose the item?"
                : "When did you find the item?"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalLocationInfo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Location Details (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Any landmarks or details that might help"
                {...field}
                className="bg-[#1E1E1E] border-[#333333]"
              />
            </FormControl>
            <FormDescription>
              Nearby landmarks, building names, or other helpful details
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

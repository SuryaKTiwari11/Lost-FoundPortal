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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITEM_CATEGORIES } from "@/constants/categories";
import { Control } from "react-hook-form";

interface ItemDetailsStepProps {
  control: Control<any>;
  register: any;
  errors: any;
}

export function ItemDetailsStep({
  control,
  register,
  errors,
}: ItemDetailsStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Item Details</h2>

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Item Name</FormLabel>
            <FormControl>
              <Input
                placeholder="E.g., Blue Backpack, iPhone 13, Car Keys"
                {...field}
                className="bg-[#1E1E1E] border-[#333333]"
              />
            </FormControl>
            <FormDescription>
              A brief, descriptive name for the item
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-[#1E1E1E] border-[#333333]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#1E1E1E] border-[#333333]">
                {ITEM_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Select the category that best describes the item
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide detailed information about the item, including color, size, brand, identifying marks, etc."
                {...field}
                className="bg-[#1E1E1E] border-[#333333] min-h-[120px]"
              />
            </FormControl>
            <FormDescription>
              The more details you provide, the easier it will be to identify
              the item
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

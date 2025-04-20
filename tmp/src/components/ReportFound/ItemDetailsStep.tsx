import React from "react";
import { Tag, FileText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import { FormInput } from "@/components/shared/FormInput";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FORM_CONSTANTS, FORM_PLACEHOLDERS } from "@/constants/formConstants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITEM_CATEGORIES } from "@/constants/categories";
import { Controller } from "react-hook-form";

interface ItemDetailsStepProps {
  register: any;
  errors: any;
  watch: any;
  nextStep: () => void;
  control: any;
}

export function ItemDetailsStep({
  register,
  errors,
  watch,
  nextStep,
  control,
}: ItemDetailsStepProps) {
  return (
    <AnimatedSection>
      <h2 className={FORM_CONSTANTS.FORM_HEADING_CLASSES}>
        <Tag className="mr-2 h-5 w-5 text-[#FFD166]" />
        Item Details
      </h2>

      <div className="space-y-4">
        <FormInput
          id="itemName"
          label="Item Name"
          placeholder={FORM_PLACEHOLDERS.ITEM_NAME}
          Icon={ShoppingBag}
          register={register}
          errors={errors}
          required={true}
        />

        <div>
          <label className="flex items-center text-sm font-medium mb-2 text-gray-300">
            <Tag className="w-4 h-4 mr-2 text-[#FFD166]" />
            Category *
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger
                  className={`bg-[#252525] border-[#333333] rounded-xl text-white transition-all focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166] ${
                    errors.category ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="mt-1 text-red-500 text-sm">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-2 text-gray-300">
            <FileText className="w-4 h-4 mr-2 text-[#FFD166]" />
            Description *
          </label>
          <Textarea
            {...register("description")}
            rows={4}
            className="bg-[#252525] border-[#333333] rounded-xl text-white transition-all focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166]"
            placeholder="Provide details about the item, including any identifying features"
          />
          {errors.description && (
            <p className="mt-1 text-red-500 text-sm">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={nextStep}
          className={FORM_CONSTANTS.BUTTON_PRIMARY_CLASSES}
          disabled={
            !watch("itemName") || !watch("category") || !watch("description")
          }
        >
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </AnimatedSection>
  );
}

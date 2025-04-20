import React from "react";
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";

interface FormInputProps<T> {
  id: string;
  label: string;
  register: UseFormRegister<T>;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function FormInput<T>({
  id,
  label,
  register,
  error,
  type = "text",
  placeholder,
  required = false,
  icon,
  className,
}: FormInputProps<T>) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center text-sm font-medium text-gray-300"
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          {...register(id as any)}
          placeholder={placeholder}
          className={`bg-[#252525] border-[#333333] rounded-xl text-white transition-all focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166] ${
            error ? "border-red-500" : ""
          } ${className || ""}`}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

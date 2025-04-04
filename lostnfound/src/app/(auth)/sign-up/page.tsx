"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, User, Mail, Lock, BookOpen, AtSign } from "lucide-react";

const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores"
      ),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    rollNumber: z
      .string()
      .regex(/^[a-zA-Z0-9]+$/, "Roll number must be alphanumeric"),
    universityEmail: z
      .string()
      .email("Please enter a valid email")
      .endsWith("@thapar.edu", "Email must be a valid @thapar.edu address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<SignUpFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError("");

    try {
      // Validate form data
      const validatedData = signUpSchema.parse(formData);
      setIsLoading(true);

      // Submit data to API
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      // Redirect to verification page
      router.push(
        "/verification?email=" +
          encodeURIComponent(validatedData.universityEmail)
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#121212]">
      <Card className="w-full max-w-2xl bg-[#1A1A1A] border-[#333333] shadow-xl">
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <CardTitle className="text-3xl font-bold text-white">
            Create an Account
          </CardTitle>
          <p className="text-gray-400 text-base">
            Enter your details to create your account
          </p>
        </CardHeader>

        {generalError && (
          <div className="px-8 mb-2">
            <div className="p-4 rounded-md bg-red-900/30 border border-red-800 text-red-200 text-sm">
              {generalError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-8 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-white block pb-1"
                >
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                    className={`pl-11 bg-[#2A2A2A] border-[#333333] text-white h-12 ${errors.firstName ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-500 pt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-white block pb-1"
                >
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                    className={`pl-11 bg-[#2A2A2A] border-[#333333] text-white h-12 ${errors.lastName ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-red-500 pt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-white block pb-1"
              >
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username || ""}
                  onChange={handleChange}
                  className={`pl-11 bg-[#2A2A2A] border-[#333333] text-white h-12 ${errors.username ? "border-red-500" : ""}`}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500 pt-1">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rollNumber"
                className="text-sm font-medium text-white block pb-1"
              >
                Roll Number
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="rollNumber"
                  name="rollNumber"
                  placeholder="Enter your roll number"
                  value={formData.rollNumber || ""}
                  onChange={handleChange}
                  className={`pl-11 bg-[#2A2A2A] border-[#333333] text-white h-12 ${errors.rollNumber ? "border-red-500" : ""}`}
                />
              </div>
              {errors.rollNumber && (
                <p className="text-sm text-red-500 pt-1">{errors.rollNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="universityEmail"
                className="text-sm font-medium text-white block pb-1"
              >
                University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="universityEmail"
                  name="universityEmail"
                  type="email"
                  placeholder="example@thapar.edu"
                  value={formData.universityEmail || ""}
                  onChange={handleChange}
                  className={`pl-11 bg-[#2A2A2A] border-[#333333] text-white h-12 ${errors.universityEmail ? "border-red-500" : ""}`}
                />
              </div>
              {errors.universityEmail && (
                <p className="text-sm text-red-500 pt-1">
                  {errors.universityEmail}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-white block pb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  className={`pl-11 bg-[#2A2A2A] border-[#333333] text-white h-12 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 pt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-white block pb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  className={`pl-11 bg-[#2A2A2A] border-[#333333] text-white h-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 pt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col px-8 py-8">
            <Button
              className="w-full bg-[#FFD166] text-[#121212] hover:bg-[#FFD166]/90 py-6 text-base font-medium rounded-md"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>

            <div className="mt-8 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[#FFD166] hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

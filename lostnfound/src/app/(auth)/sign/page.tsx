"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

// Simple spinner component in case the import is failing
const Spinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={`animate-spin ${sizeClasses[size as keyof typeof sizeClasses]} ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  // Get error message from URL if present
  const errorMessage = searchParams?.get("error");
  const successMessage = searchParams?.get("verified");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
      // The page will be redirected by NextAuth, so no need for additional handling here
    } catch (error) {
      console.error("Google sign in error:", error);
      setError("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#121212]">
      <Card className="w-full max-w-md bg-[#1A1A1A] border-[#333333] shadow-xl">
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <CardTitle className="text-3xl font-bold text-white">
            Welcome to Lost & Found
          </CardTitle>
          <p className="text-gray-400 text-base">
            Sign in with your Thapar email
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pt-2">
          {(error || errorMessage) && (
            <div className="p-4 rounded-md bg-red-900/30 border border-red-800 text-red-200 text-sm">
              {error ||
                (errorMessage === "AccessDenied"
                  ? "You must use a valid Thapar email (@thapar.edu) to sign in."
                  : "Authentication failed. Please try again.")}
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-md bg-green-900/30 border border-green-800 text-green-200 text-sm">
              Your email has been verified successfully! You can now sign in.
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-white mb-2">
              Please use your university email address to sign in
            </p>
            <p className="text-gray-400 text-xs">
              Only <span className="text-[#FFD166]">@thapar.edu</span> emails
              are allowed
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col px-8 py-8">
          <Button
            className="w-full border-[#333333] text-white hover:bg-[#2A2A2A] h-14 flex items-center justify-center"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {loading ? "Signing In..." : "Sign in with Google"}
          </Button>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              By signing in, you agree to our{" "}
              <Link href="#" className="text-[#FFD166] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#FFD166] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

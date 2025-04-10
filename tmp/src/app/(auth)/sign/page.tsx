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
import { Input } from "@/components/ui/input";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();

  // Get error message from URL if present
  const errorMessage = searchParams?.get("error");
  const successMessage = searchParams?.get("verified");

  const handleGoogleSignIn = async () => {
    if (loading) return;
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

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Successful login - redirect to home page
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#121212]">
      <Card className="w-full max-w-md bg-[#1A1A1A] border-[#333333] shadow-xl">
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <CardTitle className="text-3xl font-bold text-white">
            Welcome to Lost & Found
          </CardTitle>
          <p className="text-gray-400 text-base">
            Sign in to access your account
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pt-2">
          {(error || errorMessage) && (
            <div className="p-4 rounded-md bg-red-900/30 border border-red-800 text-red-200 text-sm">
              {error ||
                (errorMessage === "AccessDenied"
                  ? "Authentication failed. Please try again."
                  : "Authentication failed. Please try again.")}
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-md bg-green-900/30 border border-green-800 text-green-200 text-sm">
              Your email has been verified successfully! You can now sign in.
            </div>
          )}

          {/* Email & Password Sign-in Form */}
          <div className="space-y-6">
            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-gray-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#252525] border-[#333333] text-white h-12"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm text-gray-300">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs text-[#FFD166] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#252525] border-[#333333] text-white h-12 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.5 8.25a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Zm2.25-1.5a.75.75 0 0 0-.75.75.75.75 0 0 0 1.5 0 .75.75 0 0 0-.75-.75Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FFD166] text-black hover:bg-[#FFCB47] h-12"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Signing In...
                  </>
                ) : (
                  "Sign In with Email"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-[#333333]"></div>
              <span className="flex-shrink mx-4 text-gray-400">or</span>
              <div className="flex-grow border-t border-[#333333]"></div>
            </div>

            {/* Google Sign-In Button */}
            <div>
              <div className="text-center mb-4">
                <p className="text-white mb-1">Sign in with Google</p>
                {/* Removed Thapar email restriction text */}
              </div>
              <Button
                className="w-full border-[#333333] text-white hover:bg-[#2A2A2A] h-12 flex items-center justify-center"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
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
                    Sign in with Google
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col px-8 py-8">
          <div className="mt-4 text-center">
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

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
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

// Simple spinner component in case the import is failing
const Spinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={`inline-block ${sizeClasses[size as keyof typeof sizeClasses]} ${className}`}
    >
      <svg
        className="animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
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
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Brand/Illustration Side */}
      <div className="w-full md:w-1/2 lg:w-[45%] min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#121212] overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#FFD166]/20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-8 py-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="mb-8">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#FFD166"
                  strokeWidth="2"
                />
                <path
                  d="M12 6v6l4 2"
                  stroke="#FFD166"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-6">
              Lost & <span className="text-[#FFD166]">Found</span>
            </h2>
            <p className="text-xl mb-8 max-w-md">
              Reconnect with your lost belongings and help others find theirs.
            </p>

            <div className="space-y-6 mt-12">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD166]/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFD166"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Secure Platform</h3>
                  <p className="text-sm text-gray-400">
                    Your data is encrypted and protected
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD166]/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFD166"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8v4l3 3"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Real-time Updates</h3>
                  <p className="text-sm text-gray-400">
                    Get notified when items match
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD166]/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFD166"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Community Driven</h3>
                  <p className="text-sm text-gray-400">
                    Help others find their items
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 lg:w-[55%] min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-[#121212]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333]/30 rounded-2xl shadow-xl transition-all duration-300 ease-in-out">
            <CardHeader className="space-y-2 text-center pb-6 pt-8">
              <CardTitle className="text-3xl font-bold text-white">
                Welcome Back
              </CardTitle>
              <p className="text-gray-400 text-base">
                Sign in to access your account
              </p>
            </CardHeader>

            <CardContent className="space-y-6 px-8 pt-2">
              {(error || errorMessage) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-900/30 border border-red-800 text-red-200 text-sm"
                >
                  {error ||
                    (errorMessage === "AccessDenied"
                      ? "Authentication failed. Please try again."
                      : "Authentication failed. Please try again.")}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-green-900/30 border border-green-800 text-green-200 text-sm"
                >
                  Your email has been verified successfully! You can now sign
                  in.
                </motion.div>
              )}

              {/* Email & Password Sign-in Form */}
              <div className="space-y-6">
                <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-300"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#252525] border-[#333333] text-white h-12 transition-all duration-300 focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166] rounded-xl"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-300"
                      >
                        Password
                      </label>
                      <Link
                        href="#"
                        className="text-xs text-[#FFD166] hover:underline transition-colors duration-300"
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
                        className="bg-[#252525] border-[#333333] text-white h-12 pr-10 transition-all duration-300 focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166] rounded-xl"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors duration-300"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#FFD166] to-amber-500 text-[#121212] font-semibold hover:opacity-90 transition-all duration-300 rounded-xl shadow-md h-12"
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
                  <motion.div
                    className="text-center mb-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-white mb-1">Sign in with Google</p>
                  </motion.div>
                  <Button
                    className="w-full border border-[#333333] bg-[#252525] hover:bg-[#2A2A2A] text-white h-12 flex items-center justify-center rounded-xl transition-all duration-300 shadow-sm"
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

            <CardFooter className="flex flex-col px-8 py-6">
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="#"
                    className="text-[#FFD166] hover:underline transition-colors duration-300 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  By signing in, you agree to our{" "}
                  <Link
                    href="#"
                    className="text-[#FFD166] hover:underline transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="#"
                    className="text-[#FFD166] hover:underline transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

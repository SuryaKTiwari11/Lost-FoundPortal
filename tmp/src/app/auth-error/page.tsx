"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Translate error codes into readable messages
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied:
      "You do not have permission to sign in. Make sure you're using an approved email domain.",
    Verification: "The verification token expired or has already been used.",
    Default: "Unable to sign in.",
    OAuthSignin: "Error in constructing an authorization URL.",
    OAuthCallback: "Error in handling the response from an OAuth provider.",
    OAuthCreateAccount: "Could not create OAuth provider user in the database.",
    EmailCreateAccount: "Could not create email provider user in the database.",
    Callback: "Error in the OAuth callback handler route.",
    OAuthAccountNotLinked:
      "This email is already associated with another account.",
    EmailSignin: "The e-mail could not be sent.",
    CredentialsSignin:
      "Sign in failed. Check the details you provided are correct.",
    SessionRequired: "Please sign in to access this page.",
  };

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : "Unknown error";
  const detailedError = error || "none";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#121212] p-4 text-white">
      <div className="w-full max-w-md rounded-lg border border-[#333333] bg-[#1A1A1A] p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-[#FFD166]">
          Authentication Error
        </h1>

        <div className="mb-6 rounded-md bg-red-900/30 border border-red-800 p-4">
          <p className="text-red-300 mb-2">{errorMessage}</p>
          <p className="text-xs text-gray-400">Error code: {detailedError}</p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">Common causes and solutions:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
            <li>
              Check that your Google OAuth credentials are correct in the .env
              file
            </li>
            <li>
              Ensure the redirect URI is properly configured in Google Cloud
              Console
            </li>
            <li>
              If you're enforcing email domains, verify you're using an allowed
              email address
            </li>
            <li>Check server logs for more detailed error information</li>
          </ul>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            asChild
            className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-black"
          >
            <Link href="/sign-in">Try Again</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-[#333333] hover:bg-[#2A2A2A]"
          >
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessDeniedMessageProps {
  message?: string;
}

export default function AccessDeniedMessage({
  message,
}: AccessDeniedMessageProps) {
  return (
    <div className="min-h-screen py-16 md:py-24 bg-[#121212] text-white flex items-center justify-center">
      <div className="w-full max-w-md mx-auto text-center p-6">
        <div className="mb-6 flex justify-center">
          <div className="p-3 bg-red-500/20 rounded-full">
            <Shield className="h-12 w-12 text-red-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">Access Denied</h2>

        <p className="text-gray-400 mb-6">
          {message || "You don't have permission to access this page."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="bg-[#FFD166] text-[#121212] hover:bg-amber-400"
          >
            <Link href="/sign">Sign In</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-[#333] text-white hover:bg-[#252525]"
          >
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

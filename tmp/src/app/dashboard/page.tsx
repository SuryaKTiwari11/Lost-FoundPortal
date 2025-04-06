"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to sign in page if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD166]"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="bg-[#121212] text-white min-h-[80vh] py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {session.user?.name}</p>
          </div>

          {session.user?.image && (
            <div className="mt-4 md:mt-0">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#FFD166]">
                <Image
                  src={session.user.image}
                  alt="Profile"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#1A1A1A] border border-[#333333] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-[#FFD166] mb-4">
              My Activity
            </h2>
            <div className="space-y-4">
              <p className="text-gray-300">No recent activity yet.</p>
              <p className="text-sm text-gray-400">
                Your lost or found item reports will appear here.
              </p>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-[#333333] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-[#FFD166] mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-[#2A2A2A] hover:bg-[#333333] p-4 rounded-md transition-colors">
                <span className="block text-white font-medium">
                  Report Lost
                </span>
                <span className="text-xs text-gray-400">
                  File a lost item report
                </span>
              </button>
              <button className="bg-[#2A2A2A] hover:bg-[#333333] p-4 rounded-md transition-colors">
                <span className="block text-white font-medium">
                  Report Found
                </span>
                <span className="text-xs text-gray-400">
                  Report an item you found
                </span>
              </button>
              <button className="bg-[#2A2A2A] hover:bg-[#333333] p-4 rounded-md transition-colors">
                <span className="block text-white font-medium">
                  Browse Lost
                </span>
                <span className="text-xs text-gray-400">
                  View lost item listings
                </span>
              </button>
              <button className="bg-[#2A2A2A] hover:bg-[#333333] p-4 rounded-md transition-colors">
                <span className="block text-white font-medium">
                  Browse Found
                </span>
                <span className="text-xs text-gray-400">
                  View found item listings
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#333333] p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#FFD166] mb-4">
            Recent Listings
          </h2>
          <div className="text-gray-400">
            <p>No recent listings available.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

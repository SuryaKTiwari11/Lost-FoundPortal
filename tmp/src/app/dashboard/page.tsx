"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { itemsAPI } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's items
  useEffect(() => {
    async function fetchUserItems() {
      if (session?.user?.email) {
        setIsLoading(true);

        try {
          // Fetch lost items reported by user
          const lostResponse = await itemsAPI.getLostItems({
            reporter: session.user.email,
            limit: "10",
          });

          if (lostResponse.success) {
            setLostItems(lostResponse.data || []);
          }

          // Fetch found items reported by user
          const foundResponse = await itemsAPI.getFoundItems({
            reporter: session.user.email,
            limit: "10",
          });

          if (foundResponse.success) {
            setFoundItems(foundResponse.data || []);
          }
        } catch (error) {
          console.error("Error fetching user items:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (status === "authenticated") {
      fetchUserItems();
    }
  }, [session, status]);

  // Redirect to sign in page if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign");
    }
  }, [status, router]);

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let badgeClass = "";

    switch (status) {
      case "pending":
        badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
        break;
      case "verified":
        badgeClass = "bg-green-100 text-green-800 border-green-200";
        break;
      case "rejected":
        badgeClass = "bg-red-100 text-red-800 border-red-200";
        break;
      case "claimed":
        badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
        break;
      case "matched":
        badgeClass = "bg-purple-100 text-purple-800 border-purple-200";
        break;
      default:
        badgeClass = "bg-gray-100 text-gray-800 border-gray-200";
    }

    return <Badge className={`capitalize ${badgeClass}`}>{status}</Badge>;
  };

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
              My Items Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <div className="text-3xl font-bold text-[#FFD166]">
                  {lostItems.length}
                </div>
                <div className="text-sm text-gray-400">Lost Items Reported</div>
              </div>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <div className="text-3xl font-bold text-[#FFD166]">
                  {foundItems.length}
                </div>
                <div className="text-sm text-gray-400">
                  Found Items Reported
                </div>
              </div>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <div className="text-3xl font-bold text-[#FFD166]">
                  {
                    lostItems.filter(
                      (item) =>
                        item.status === "matched" || item.status === "claimed"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-400">Items Recovered</div>
              </div>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <div className="text-3xl font-bold text-[#FFD166]">
                  {lostItems.filter((item) => item.status === "pending")
                    .length +
                    foundItems.filter((item) => item.status === "pending")
                      .length}
                </div>
                <div className="text-sm text-gray-400">Pending Items</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-[#333333] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-[#FFD166] mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/report-lost"
                className="bg-[#2A2A2A] hover:bg-[#333333] p-4 rounded-md transition-colors"
              >
                <span className="block text-white font-medium">
                  Report Lost
                </span>
                <span className="text-xs text-gray-400">
                  File a lost item report
                </span>
              </Link>
              <Link
                href="/report-found"
                className="bg-[#2A2A2A] hover:bg-[#333333] p-4 rounded-md transition-colors"
              >
                <span className="block text-white font-medium">
                  Report Found
                </span>
                <span className="text-xs text-gray-400">
                  Report an item you found
                </span>
              </Link>
              <Link
                href="/lost-items"
                className="bg-[#2A2A2A] hover:bg-[#333333] p-4 rounded-md transition-colors"
              >
                <span className="block text-white font-medium">
                  Browse Lost
                </span>
                <span className="text-xs text-gray-400">
                  View lost item listings
                </span>
              </Link>
              <Link
                href="/found-items"
                className="bg-[#2A2A2A] hover:bg-[#333333] p-4 rounded-md transition-colors"
              >
                <span className="block text-white font-medium">
                  Browse Found
                </span>
                <span className="text-xs text-gray-400">
                  View found item listings
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#333333] p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-[#FFD166] mb-4">
            My Reported Items
          </h2>

          <Tabs defaultValue="lost" className="w-full">
            <TabsList className="mb-6 bg-[#2A2A2A]">
              <TabsTrigger
                value="lost"
                className="data-[state=active]:bg-[#FFD166] data-[state=active]:text-black"
              >
                Lost Items
              </TabsTrigger>
              <TabsTrigger
                value="found"
                className="data-[state=active]:bg-[#FFD166] data-[state=active]:text-black"
              >
                Found Items
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lost">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFD166]"></div>
                </div>
              ) : lostItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>You haven't reported any lost items yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-[#333333]">
                        <th className="py-2 px-4">Item Name</th>
                        <th className="py-2 px-4">Category</th>
                        <th className="py-2 px-4">Date Lost</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lostItems.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b border-[#333333] hover:bg-[#1E1E1E]"
                        >
                          <td className="py-2 px-4">{item.itemName}</td>
                          <td className="py-2 px-4">{item.category}</td>
                          <td className="py-2 px-4">
                            {formatDate(item.dateLost || item.createdAt)}
                          </td>
                          <td className="py-2 px-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="py-2 px-4">
                            <Link
                              href={`/lost-items/${item._id}`}
                              className="text-[#FFD166] hover:underline"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="found">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFD166]"></div>
                </div>
              ) : foundItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>You haven't reported any found items yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-[#333333]">
                        <th className="py-2 px-4">Item Name</th>
                        <th className="py-2 px-4">Category</th>
                        <th className="py-2 px-4">Date Found</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foundItems.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b border-[#333333] hover:bg-[#1E1E1E]"
                        >
                          <td className="py-2 px-4">{item.itemName}</td>
                          <td className="py-2 px-4">{item.category}</td>
                          <td className="py-2 px-4">
                            {formatDate(
                              item.dateFound || item.foundDate || item.createdAt
                            )}
                          </td>
                          <td className="py-2 px-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="py-2 px-4">
                            <Link
                              href={`/found-items/${item._id}`}
                              className="text-[#FFD166] hover:underline"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

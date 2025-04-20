import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface DashboardItemsTableProps {
  lostItems: any[];
  foundItems: any[];
  isLoading: boolean;
}

export default function DashboardItemsTable({
  lostItems = [],
  foundItems = [],
  isLoading,
}: DashboardItemsTableProps) {
  const [activeTab, setActiveTab] = useState("lost");

  // Function to format date for better display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let badgeClass = "";

    switch (status) {
      case "pending":
        badgeClass = "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30";
        break;
      case "verified":
        badgeClass = "bg-green-500/20 text-green-300 hover:bg-green-500/30";
        break;
      case "resolved":
        badgeClass = "bg-green-500/20 text-green-300 hover:bg-green-500/30";
        break;
      case "claimed":
        badgeClass = "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30";
        break;
      case "rejected":
        badgeClass = "bg-red-500/20 text-red-300 hover:bg-red-500/30";
        break;
      default:
        badgeClass = "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30";
    }

    return (
      <Badge className={`${badgeClass} capitalize`}>
        {status || "unknown"}
      </Badge>
    );
  };

  // Data display when no items are found
  const NoItems = () => (
    <div className="text-center py-8">
      <p className="text-gray-400 mb-4">No items found</p>
      <Button
        asChild
        variant="outline"
        className="border-[#333] hover:bg-[#252525]"
      >
        <Link href={activeTab === "lost" ? "/report-lost" : "/report-found"}>
          Report {activeTab === "lost" ? "Lost" : "Found"} Item
        </Link>
      </Button>
    </div>
  );

  // Loading state display
  const LoadingState = () => (
    <div className="flex justify-center items-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Items</h2>

      <Tabs defaultValue="lost" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#1E1E1E]">
          <TabsTrigger value="lost">
            Lost Items ({lostItems.length})
          </TabsTrigger>
          <TabsTrigger value="found">
            Found Items ({foundItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lost" className="mt-4">
          {isLoading ? (
            <LoadingState />
          ) : lostItems.length === 0 ? (
            <NoItems />
          ) : (
            <div className="rounded-md border border-[#333] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#1E1E1E]">
                  <TableRow className="hover:bg-[#252525]">
                    <TableHead className="w-[250px]">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Reported</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lostItems.map((item, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-[#1E1E1E] border-[#333]"
                    >
                      <TableCell className="font-medium">
                        {item.title}
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="hover:bg-[#252525]"
                        >
                          <Link href={`/lost-items/${item._id}`}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="found" className="mt-4">
          {isLoading ? (
            <LoadingState />
          ) : foundItems.length === 0 ? (
            <NoItems />
          ) : (
            <div className="rounded-md border border-[#333] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#1E1E1E]">
                  <TableRow className="hover:bg-[#252525]">
                    <TableHead className="w-[250px]">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Reported</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foundItems.map((item, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-[#1E1E1E] border-[#333]"
                    >
                      <TableCell className="font-medium">
                        {item.title}
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="hover:bg-[#252525]"
                        >
                          <Link href={`/found-items/${item._id}`}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

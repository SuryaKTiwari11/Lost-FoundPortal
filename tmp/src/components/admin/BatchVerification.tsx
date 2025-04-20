"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Loader2, RefreshCcw } from "lucide-react";
import { useBatchVerification } from "@/hooks/useBatchVerification";
import {
  EmptyState,
  SearchBar,
  VerificationTable,
} from "@/components/admin/verification";

export default function BatchVerification() {
  const {
    filteredItems,
    selectedItems,
    isSelectAll,
    isLoading,
    isProcessing,
    activeTab,
    searchQuery,
    fetchItems,
    handleTabChange,
    handleSearch,
    handleSelectAll,
    handleSelectItem,
    handleBatchApprove,
    handleBatchReject,
    handleVerifyItem,
  } = useBatchVerification();

  return (
    <Card className="bg-[#1E1E1E] border-[#333333] shadow-lg overflow-hidden">
      <CardHeader className="bg-[#242424] border-b border-[#333333]">
        <div className="flex justify-between items-center">
          <CardTitle>Batch Verification</CardTitle>
          <Button onClick={fetchItems} variant="outline" disabled={isLoading}>
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          Verify or reject multiple items in batch
        </CardDescription>
      </CardHeader>

      {/* Search and action buttons */}
      <SearchBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onBatchApprove={handleBatchApprove}
        onBatchReject={handleBatchReject}
        selectedCount={selectedItems.length}
        isProcessing={isProcessing}
      />

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="border-b border-[#333333] p-2 bg-[#242424]">
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
            <TabsTrigger value="found">Found</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-0">
          <TabsContent value={activeTab} className="m-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyState searchQuery={searchQuery} activeTab={activeTab} />
            ) : (
              <VerificationTable
                items={filteredItems}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onSelectAll={handleSelectAll}
                isSelectAll={isSelectAll}
                onVerifyItem={handleVerifyItem}
              />
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="p-4 border-t border-[#333333] bg-[#242424]">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-400">
            {filteredItems.length} items found
            {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
          </div>
          {selectedItems.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-500 border-green-800"
                onClick={handleBatchApprove}
                disabled={isProcessing}
              >
                <Check className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-800"
                onClick={handleBatchReject}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

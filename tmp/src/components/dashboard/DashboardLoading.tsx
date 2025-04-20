import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-1/2">
            <Skeleton className="h-10 w-36 bg-[#1E1E1E] mb-2" />
            <Skeleton className="h-5 w-72 bg-[#1E1E1E]" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-36 bg-[#1E1E1E]" />
            <Skeleton className="h-10 w-36 bg-[#1E1E1E]" />
          </div>
        </div>

        {/* Summary card skeletons */}
        <div className="mt-8">
          <Skeleton className="h-8 w-24 bg-[#1E1E1E] mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6)
              .fill(null)
              .map((_, index) => (
                <Card key={index} className="border-[#333] bg-[#1E1E1E]">
                  <CardContent className="p-4 flex items-center">
                    <Skeleton className="h-12 w-12 rounded-lg bg-[#252525] mr-4" />
                    <div>
                      <Skeleton className="h-4 w-20 bg-[#252525] mb-2" />
                      <Skeleton className="h-8 w-16 bg-[#252525]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Quick actions skeletons */}
        <div className="mt-8">
          <Skeleton className="h-8 w-32 bg-[#1E1E1E] mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <Card key={index} className="border-[#333] bg-[#1E1E1E]">
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-12 w-12 rounded-full bg-[#252525] mx-auto mb-3" />
                    <Skeleton className="h-5 w-24 bg-[#252525] mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 bg-[#252525] mx-auto" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Items table skeleton */}
        <div className="mt-8">
          <Skeleton className="h-8 w-24 bg-[#1E1E1E] mb-4" />
          <Skeleton className="h-10 w-full bg-[#1E1E1E] mb-4" />
          <div className="rounded-md border border-[#333] overflow-hidden">
            <div className="bg-[#1E1E1E] p-4">
              <div className="flex justify-between border-b border-[#333] pb-3">
                <Skeleton className="h-6 w-40 bg-[#252525]" />
                <Skeleton className="h-6 w-20 bg-[#252525]" />
                <Skeleton className="h-6 w-32 bg-[#252525]" />
                <Skeleton className="h-6 w-24 bg-[#252525]" />
                <Skeleton className="h-6 w-20 bg-[#252525]" />
              </div>

              {Array(5)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-4 border-b border-[#333]"
                  >
                    <Skeleton className="h-5 w-40 bg-[#252525]" />
                    <Skeleton className="h-5 w-20 bg-[#252525]" />
                    <Skeleton className="h-5 w-32 bg-[#252525]" />
                    <Skeleton className="h-5 w-24 bg-[#252525]" />
                    <Skeleton className="h-5 w-20 bg-[#252525]" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

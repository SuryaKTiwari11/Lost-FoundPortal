import { Session } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

interface DashboardHeaderProps {
  session: Session | null;
}

export default function DashboardHeader({ session }: DashboardHeaderProps) {
  const userName = session?.user?.name || "User";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-[#FFD166]">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Welcome back, {userName}! Manage your lost and found items.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          asChild
          className="bg-[#FFD166] text-[#121212] hover:bg-amber-400"
        >
          <Link href="/report-lost">
            <Plus className="mr-2 h-4 w-4" />
            Report Lost Item
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="border-[#333] hover:bg-[#252525]"
        >
          <Link href="/report-found">
            <Plus className="mr-2 h-4 w-4" />
            Report Found Item
          </Link>
        </Button>
      </div>
    </div>
  );
}

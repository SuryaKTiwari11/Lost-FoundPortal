import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, UploadIcon, SearchIcon, UserIcon } from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  iconColor: string;
}

export default function DashboardQuickActions() {
  const quickActions: QuickAction[] = [
    {
      title: "Report Lost Item",
      description: "Report an item you've lost",
      icon: <PlusCircleIcon className="h-6 w-6" />,
      href: "/report-lost",
      iconColor: "text-red-500",
    },
    {
      title: "Report Found Item",
      description: "Report an item you've found",
      icon: <UploadIcon className="h-6 w-6" />,
      href: "/report-found",
      iconColor: "text-green-500",
    },
    {
      title: "Search Items",
      description: "Search for lost or found items",
      icon: <SearchIcon className="h-6 w-6" />,
      href: "/all-items",
      iconColor: "text-blue-500",
    },
    {
      title: "Update Profile",
      description: "Update your profile information",
      icon: <UserIcon className="h-6 w-6" />,
      href: "/profile",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link href={action.href} key={index}>
            <Card className="border border-[#333] bg-[#1E1E1E] hover:bg-[#252525] transition-colors cursor-pointer h-full">
              <CardContent className="p-6 text-center flex flex-col items-center h-full">
                <div
                  className={`p-3 rounded-full bg-opacity-10 mb-3 ${action.iconColor.replace("text", "bg").replace("-500", "-500/10")}`}
                >
                  <div className={action.iconColor}>{action.icon}</div>
                </div>
                <h3 className="font-medium text-lg mb-1">{action.title}</h3>
                <p className="text-sm text-gray-400">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

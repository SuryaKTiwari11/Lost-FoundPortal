"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardAnalytics from "@/components/admin/DashboardAnalytics";
import BatchVerification from "@/components/admin/BatchVerification";
import ItemsManagement from "@/components/admin/ItemsManagement";
import EmailTemplates from "@/components/admin/EmailTemplates";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/sign");
    },
  });

  // Check if user is admin, if not redirect
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs
        defaultValue="overview"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Items</TabsTrigger>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardAnalytics />
        </TabsContent>

        <TabsContent value="pending">
          <ItemsManagement initialStatus="pending" />
        </TabsContent>

        <TabsContent value="all">
          <ItemsManagement initialStatus="" />
        </TabsContent>

        <TabsContent value="templates">
          <Card className="p-6">
            <EmailTemplates className="w-full" />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

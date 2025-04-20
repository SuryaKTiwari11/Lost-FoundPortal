"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import HomeHero from "@/components/home/HomeHero";
import RecentLostItems from "@/components/home/RecentLostItems";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  const { status } = useSession();

  return (
    <main className="min-h-screen pb-16">
      {/* Hero Section */}
      <HomeHero />

      {/* Recent Items Section */}
      <RecentLostItems />

      {/* How It Works Section */}
      <HowItWorks isAuthenticated={status === "authenticated"} />

      {/* Testimonials Section */}
      <Testimonials />
    </main>
  );
}

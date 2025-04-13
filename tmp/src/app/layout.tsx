// Import environment variables at app startup
import "../lib/load-env";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Search } from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { ClientBodyWrapper } from "@/components/ClientBodyWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lost & Found Portal",
  description: "Find your lost items or report found items",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#121212] text-white`}
        suppressHydrationWarning // Add this attribute to suppress hydration warnings
      >
        <Providers>
          <ClientBodyWrapper>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <footer className="py-6 border-t border-[#333333] bg-[#121212] w-full flex ">
                <div className="container mx-auto justify-between px-3 sm:px-6 lg:px-8 max-w-screen-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="rounded-full bg-[#FFD166] p-1">
                      <Search
                        className="h-4 w-4 text-[#121212]"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-base font-bold">
                      Lost<span className="text-[#FFD166]">&</span>Found
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                      <h3 className="font-medium text-white mb-3">Navigation</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            Home
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/lost-items"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            Lost Items
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/found-items"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            Found Items
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium text-white mb-3">Resources</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/about"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            About Us
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/contact"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            Contact
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/faq"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            FAQ
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-3">Account</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/sign"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            Sign In
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/dashboard"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            Dashboard
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-3">Legal</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/privacy"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            Privacy Policy
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/terms"
                            className="text-gray-400 hover:text-[#FFD166] text-sm"
                          >
                            Terms of Service
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#333333] text-center">
                    <div className="text-sm text-gray-400">
                      Lost<span className="text-[#FFD166]">&</span>Found ©{" "}
                      {new Date().getFullYear()} Lost & Found Portal. All rights
                      reserved.
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </ClientBodyWrapper>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}

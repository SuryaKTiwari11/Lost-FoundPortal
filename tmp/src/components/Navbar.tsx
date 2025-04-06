"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  Search,
  ChevronDown,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-[#121212] border-b border-[#333333] sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-full bg-[#FFD166] p-1">
                <Search className="h-4 w-4 text-[#121212]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white">
                Lost<span className="text-[#FFD166]">&</span>Found
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/all-items"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/all-items")
                  ? "text-[#FFD166]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Browse Items
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/report-lost") || isActive("/report-found")
                      ? "text-[#FFD166]"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Report Item
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/report-lost" className="cursor-pointer">
                    Report Lost Item
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/report-found" className="cursor-pointer">
                    Report Found Item
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/about")
                  ? "text-[#FFD166]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              About
            </Link>

            <div className="ml-2">
              {status === "loading" ? (
                <div className="h-8 w-8 rounded-full bg-[#2A2A2A] animate-pulse"></div>
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative rounded-full h-8 w-8 p-0 overflow-hidden"
                    >
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#2A2A2A]">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col">
                      <span>{session.user?.name}</span>
                      <span className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {session.user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-red-500 focus:text-red-500 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" className="ml-2">
                  <Link href="/sign">Sign In</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:hidden border-t border-[#333333]`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/all-items"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/all-items")
                ? "text-[#FFD166]"
                : "text-gray-300 hover:text-white"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Items
          </Link>
          <Link
            href="/report-lost"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/report-lost")
                ? "text-[#FFD166]"
                : "text-gray-300 hover:text-white"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Report Lost Item
          </Link>
          <Link
            href="/report-found"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/report-found")
                ? "text-[#FFD166]"
                : "text-gray-300 hover:text-white"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Report Found Item
          </Link>
          <Link
            href="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/about")
                ? "text-[#FFD166]"
                : "text-gray-300 hover:text-white"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>

          {session ? (
            <>
              <div className="pt-4 pb-3 border-t border-[#333333]">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0 relative h-10 w-10 rounded-full overflow-hidden bg-[#2A2A2A]">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user?.name || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {session.user?.name}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {session.user?.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  {session.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:text-red-400"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="pt-4 pb-3 border-t border-[#333333]">
              <div className="px-2">
                <Link
                  href="/sign"
                  className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-[#FFD166] text-[#121212]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

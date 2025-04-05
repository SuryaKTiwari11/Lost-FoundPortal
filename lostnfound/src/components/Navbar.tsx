"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Search,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Search as SearchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

// Custom navigation menu style without the dark background
const customNavStyle = cn(
  "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
  "text-white hover:text-[#FFD166] transition-colors",
  "focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFD166]"
);

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && session?.user;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isLinkActive = (path: string) => {
    return pathname === path;
  };

  // Get first name from Google profile
  const firstName = session?.user?.name?.split(" ")[0] || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#333333] bg-[#121212]/95 backdrop-blur supports-[backdrop-filter]:bg-[#121212]/80">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 w-full">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-full bg-[#FFD166] p-1.5">
                <SearchIcon
                  className="h-5 w-5 text-[#121212]"
                  strokeWidth={2.5}
                />
              </div>
              <span className="text-xl font-bold text-white">
                Lost<span className="text-[#FFD166]">&</span>Found
              </span>
            </Link>
          </div>

          {/* Nav Links - Center */}
          <div className="hidden md:flex justify-center items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-6">
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        customNavStyle,
                        isLinkActive("/") && "text-[#FFD166]"
                      )}
                    >
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={customNavStyle}>
                    Items
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 bg-[#1A1A1A] border-[#333333]">
                      <Link
                        href="/lost-items"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#2A2A2A] focus:bg-[#2A2A2A]"
                      >
                        <div className="text-sm font-medium leading-none text-white">
                          Lost Items
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-400">
                          Browse all reported lost items
                        </p>
                      </Link>
                      <Link
                        href="/found-items"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#2A2A2A] focus:bg-[#2A2A2A]"
                      >
                        <div className="text-sm font-medium leading-none text-white">
                          Found Items
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-400">
                          Browse items that have been found
                        </p>
                      </Link>
                      <Link
                        href="/report-lost"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#2A2A2A] focus:bg-[#2A2A2A]"
                      >
                        <div className="text-sm font-medium leading-none text-white">
                          Report Lost Item
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-400">
                          File a report for your lost item
                        </p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        customNavStyle,
                        isLinkActive("/about") && "text-[#FFD166]"
                      )}
                    >
                      About
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/contact" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        customNavStyle,
                        isLinkActive("/contact") && "text-[#FFD166]"
                      )}
                    >
                      Contact
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Buttons - Right */}
          <div className="flex items-center justify-end gap-2">
            <div className="hidden md:flex items-center gap-2">
              {isLoading ? (
                <div className="w-24 h-9 bg-[#1A1A1A] animate-pulse rounded-md"></div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#333333] text-white hover:bg-[#2A2A2A] hover:text-white flex gap-2 items-center"
                    >
                      {session.user.image ? (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span>{firstName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#1A1A1A] border-[#333333] text-white"
                  >
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#333333]" />
                    <DropdownMenuItem
                      className="focus:bg-[#2A2A2A] focus:text-white cursor-pointer"
                      asChild
                    >
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-[#2A2A2A] focus:text-white cursor-pointer"
                      asChild
                    >
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#333333]" />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-red-400 focus:bg-[#2A2A2A] focus:text-red-400 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-[#333333] text-white hover:bg-[#2A2A2A] hover:text-white"
                >
                  <Link href="/sign">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute z-50 top-16 left-0 right-0 bg-[#121212] border-b border-[#333333] p-4 space-y-4">
          <Link
            href="/"
            className={`block p-2 text-sm ${isLinkActive("/") ? "text-[#FFD166]" : "text-white"} hover:text-[#FFD166]`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/lost-items"
            className={`block p-2 text-sm ${isLinkActive("/lost-items") ? "text-[#FFD166]" : "text-white"} hover:text-[#FFD166]`}
            onClick={() => setIsMenuOpen(false)}
          >
            Lost Items
          </Link>
          <Link
            href="/found-items"
            className={`block p-2 text-sm ${isLinkActive("/found-items") ? "text-[#FFD166]" : "text-white"} hover:text-[#FFD166]`}
            onClick={() => setIsMenuOpen(false)}
          >
            Found Items
          </Link>
          <Link
            href="/report-lost"
            className={`block p-2 text-sm ${isLinkActive("/report-lost") ? "text-[#FFD166]" : "text-white"} hover:text-[#FFD166]`}
            onClick={() => setIsMenuOpen(false)}
          >
            Report Lost Item
          </Link>
          <Link
            href="/about"
            className={`block p-2 text-sm ${isLinkActive("/about") ? "text-[#FFD166]" : "text-white"} hover:text-[#FFD166]`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`block p-2 text-sm ${isLinkActive("/contact") ? "text-[#FFD166]" : "text-white"} hover:text-[#FFD166]`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>

          <div className="pt-2 border-t border-[#333333]">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2 py-3">
                  {session.user.image ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                  <div className="text-sm font-medium text-white">
                    {firstName}
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="block p-2 text-sm text-white hover:text-[#FFD166]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block p-2 text-sm text-white hover:text-[#FFD166]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#333333] text-red-400 hover:bg-[#2A2A2A] w-full mt-2"
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[#333333] text-white hover:bg-[#2A2A2A] w-full"
              >
                <Link href="/sign">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

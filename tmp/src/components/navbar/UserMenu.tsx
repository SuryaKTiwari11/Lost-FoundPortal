"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, LogOut, PanelRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navbarAnimations } from "@/hooks/useNavbar";
import { Session } from "next-auth";

interface UserMenuProps {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  onSignOut: () => void;
}

export function UserMenu({ session, status, onSignOut }: UserMenuProps) {
  return (
    <motion.div
      variants={navbarAnimations.navItemVariants}
      custom={4}
      className="flex items-center"
    >
      {status === "loading" ? (
        <div className="h-8 w-8 rounded-full bg-[#2A2A2A] animate-pulse"></div>
      ) : session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative rounded-full h-8 w-8 p-0 overflow-hidden border border-[#333] hover:border-[#FFD166] transition-all duration-300 ease-in-out"
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
          <DropdownMenuContent
            align="end"
            className="w-60 bg-[#1A1A1A] border-[#333] rounded-xl shadow-lg"
          >
            <DropdownMenuLabel className="flex flex-col px-4 py-3 border-b border-[#333]">
              <span className="font-medium text-white">
                {session.user?.name}
              </span>
              <span className="text-xs text-gray-400 truncate mt-1">
                {session.user?.email}
              </span>
            </DropdownMenuLabel>

            <div className="p-2">
              <DropdownMenuItem
                asChild
                className="rounded-lg focus:bg-[#2A2A2A] cursor-pointer"
              >
                <Link href="/dashboard" className="flex items-center px-2 py-2">
                  <PanelRight className="mr-2 h-4 w-4 text-[#FFD166]" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-lg focus:bg-[#2A2A2A] cursor-pointer"
              >
                <Link href="/profile" className="flex items-center px-2 py-2">
                  <User className="mr-2 h-4 w-4 text-[#FFD166]" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              {session.user?.role === "admin" && (
                <DropdownMenuItem
                  asChild
                  className="rounded-lg focus:bg-[#2A2A2A] cursor-pointer"
                >
                  <Link href="/admin" className="flex items-center px-2 py-2">
                    <Shield className="mr-2 h-4 w-4 text-[#FFD166]" />
                    <span>Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </div>

            <DropdownMenuSeparator className="bg-[#333]" />
            <div className="p-2">
              <DropdownMenuItem
                onClick={onSignOut}
                className="text-red-400 hover:text-red-300 focus:text-red-300 rounded-lg focus:bg-[#2A2A2A] cursor-pointer px-2 py-2"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-[#FFD166] to-amber-500 text-[#121212] font-medium hover:opacity-90 rounded-xl shadow-md px-4 py-2 transition-all duration-300 ease-in-out"
        >
          <Link href="/sign">Sign In</Link>
        </Button>
      )}
    </motion.div>
  );
}

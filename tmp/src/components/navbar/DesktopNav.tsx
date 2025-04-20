"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, FileText, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navbarAnimations } from "@/hooks/useNavbar";

interface DesktopNavProps {
  isActive: (path: string) => boolean;
}

export function DesktopNav({ isActive }: DesktopNavProps) {
  return (
    <div className="hidden md:flex md:items-center md:space-x-4">
      <motion.div variants={navbarAnimations.navItemVariants} custom={1}>
        <Link
          href="/all-items"
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out hover:bg-[#2A2A2A]/50 ${
            isActive("/all-items")
              ? "text-[#FFD166]"
              : "text-gray-300 hover:text-white"
          }`}
        >
          Browse Items
        </Link>
      </motion.div>

      <motion.div variants={navbarAnimations.navItemVariants} custom={2}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out hover:bg-[#2A2A2A]/50 ${
                isActive("/report-lost") || isActive("/report-found")
                  ? "text-[#FFD166]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Report Item
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#1A1A1A] border-[#333] rounded-xl shadow-lg text-white"
          >
            <DropdownMenuItem
              asChild
              className="rounded-md focus:bg-[#2A2A2A] cursor-pointer text-gray-200 hover:text-white"
            >
              <Link href="/report-lost" className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-[#FFD166]" />
                Report Lost Item
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="rounded-md focus:bg-[#2A2A2A] cursor-pointer text-gray-200 hover:text-white"
            >
              <Link href="/report-found" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-[#FFD166]" />
                Report Found Item
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <motion.div variants={navbarAnimations.navItemVariants} custom={3}>
        <Link
          href="/about"
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out hover:bg-[#2A2A2A]/50 ${
            isActive("/about")
              ? "text-[#FFD166]"
              : "text-gray-300 hover:text-white"
          }`}
        >
          About
        </Link>
      </motion.div>
    </div>
  );
}

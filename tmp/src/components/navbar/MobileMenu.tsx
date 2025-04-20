"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  FileText,
  MapPin,
  PanelRight,
  User,
  Shield,
  LogOut,
} from "lucide-react";
import { Session } from "next-auth";
import { navbarAnimations } from "@/hooks/useNavbar";

interface MobileMenuProps {
  isOpen: boolean;
  session: Session | null;
  isActive: (path: string) => boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
}

export function MobileMenu({
  isOpen,
  session,
  isActive,
  onCloseMobile,
  onSignOut,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={navbarAnimations.mobileMenuVariants}
          className="md:hidden border-t border-[#333333] bg-[#1A1A1A]/90 backdrop-blur-md overflow-hidden"
        >
          <div className="px-3 pt-3 pb-4 space-y-1.5">
            <Link
              href="/all-items"
              className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive("/all-items")
                  ? "bg-[#2A2A2A]/70 text-[#FFD166]"
                  : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]/50"
              }`}
              onClick={onCloseMobile}
            >
              <Home className="h-5 w-5 mr-3 opacity-70" />
              Browse Items
            </Link>
            <Link
              href="/report-lost"
              className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive("/report-lost")
                  ? "bg-[#2A2A2A]/70 text-[#FFD166]"
                  : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]/50"
              }`}
              onClick={onCloseMobile}
            >
              <FileText className="h-5 w-5 mr-3 opacity-70" />
              Report Lost Item
            </Link>
            <Link
              href="/report-found"
              className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive("/report-found")
                  ? "bg-[#2A2A2A]/70 text-[#FFD166]"
                  : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]/50"
              }`}
              onClick={onCloseMobile}
            >
              <MapPin className="h-5 w-5 mr-3 opacity-70" />
              Report Found Item
            </Link>
            <Link
              href="/about"
              className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive("/about")
                  ? "bg-[#2A2A2A]/70 text-[#FFD166]"
                  : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]/50"
              }`}
              onClick={onCloseMobile}
            >
              <FileText className="h-5 w-5 mr-3 opacity-70" />
              About
            </Link>

            {session ? (
              <>
                <div className="pt-4 pb-3 border-t border-[#333333] mt-3">
                  <div className="flex items-center px-3 py-2">
                    <div className="flex-shrink-0 relative h-10 w-10 rounded-full overflow-hidden bg-[#2A2A2A] border border-[#333] shadow-sm">
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
                  <div className="mt-3 px-2 space-y-1.5">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-[#2A2A2A]/50 transition-colors"
                      onClick={onCloseMobile}
                    >
                      <PanelRight className="h-5 w-5 mr-3 opacity-70" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-[#2A2A2A]/50 transition-colors"
                      onClick={onCloseMobile}
                    >
                      <User className="h-5 w-5 mr-3 opacity-70" />
                      Profile Settings
                    </Link>
                    {session.user?.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-[#2A2A2A]/50 transition-colors"
                        onClick={onCloseMobile}
                      >
                        <Shield className="h-5 w-5 mr-3 opacity-70" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      className="w-full text-left flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-red-400 hover:text-red-300 hover:bg-[#2A2A2A]/50 transition-colors"
                      onClick={onSignOut}
                    >
                      <LogOut className="h-5 w-5 mr-3 opacity-70" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-4 pb-3 border-t border-[#333333] mt-3">
                <div className="px-3">
                  <Link
                    href="/sign"
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-base font-medium bg-gradient-to-r from-[#FFD166] to-amber-500 text-[#121212] hover:opacity-90 transition-all duration-300 ease-in-out shadow-md"
                    onClick={onCloseMobile}
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

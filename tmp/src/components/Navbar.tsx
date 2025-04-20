"use client";

import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavbar, navbarAnimations } from "@/hooks/useNavbar";
import { NavLogo, DesktopNav, UserMenu, MobileMenu } from "@/components/navbar";

export default function Navbar() {
  const {
    session,
    status,
    mobileMenuOpen,
    scrolled,
    isActive,
    handleSignOut,
    toggleMobileMenu,
    closeMobileMenu,
  } = useNavbar();

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navbarAnimations.navbarVariants}
      className={`bg-[#121212]/90 backdrop-blur-md border-b ${
        scrolled ? "border-[#333333]" : "border-transparent"
      } sticky top-0 z-40 transition-all duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and brand */}
          <NavLogo />

          {/* Desktop navigation */}
          <DesktopNav isActive={isActive} />

          {/* Sign In or User Profile */}
          <UserMenu
            session={session}
            status={status}
            onSignOut={handleSignOut}
          />

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A2A2A]/50 transition-all duration-300 ease-in-out focus:outline-none"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
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
      <MobileMenu
        isOpen={mobileMenuOpen}
        session={session}
        isActive={isActive}
        onCloseMobile={closeMobileMenu}
        onSignOut={handleSignOut}
      />
    </motion.nav>
  );
}

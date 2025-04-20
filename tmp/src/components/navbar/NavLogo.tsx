"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { navbarAnimations } from "@/hooks/useNavbar";

export function NavLogo() {
  return (
    <motion.div
      variants={navbarAnimations.navItemVariants}
      custom={0}
      className="flex-shrink-0 flex items-center"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="rounded-full bg-gradient-to-r from-[#FFD166] to-amber-500 p-1.5 shadow-md">
          <Search className="h-4 w-4 text-[#121212]" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-white">
          Lost<span className="text-[#FFD166]">&</span>Found
        </span>
      </Link>
    </motion.div>
  );
}

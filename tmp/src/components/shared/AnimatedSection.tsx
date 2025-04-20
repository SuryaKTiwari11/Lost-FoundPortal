import React from "react";
import { motion } from "framer-motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-[#1A1A1A]/60 backdrop-blur-sm p-6 rounded-xl border border-[#333] shadow-md space-y-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

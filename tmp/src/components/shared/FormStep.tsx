"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FormStepProps {
  children: ReactNode;
  isActive: boolean;
  direction: number;
}

export function FormStep({ children, isActive, direction }: FormStepProps) {
  // Skip animation for initial render (direction === 0)
  const variants = {
    enter: (direction: number) => ({
      x: direction === 0 ? 0 : direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction === 0 ? 0 : direction > 0 ? -500 : 500,
      opacity: 0,
    }),
  };

  if (!isActive) {
    return null;
  }

  return (
    <motion.div
      initial="enter"
      animate="center"
      exit="exit"
      variants={variants}
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      custom={direction}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

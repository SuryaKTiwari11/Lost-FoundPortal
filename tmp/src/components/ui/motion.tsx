"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Animation variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const slideDown = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const slideLeft = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

export const slideRight = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleUp = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

// Motion components
interface MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variants?: any;
  [key: string]: any;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUp}
      transition={{ duration, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideDown({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideDown}
      transition={{ duration, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideLeft({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideLeft}
      transition={{ duration, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideRight({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideRight}
      transition={{ duration, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleUp({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleUp}
      transition={{ duration, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  ...props
}: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variants = slideUp,
  duration = 0.5,
  ...props
}: MotionProps) {
  return (
    <motion.div
      variants={variants}
      transition={{ duration }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Export the motion component for custom animations
export { motion };

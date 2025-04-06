"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme="dark" // Set default theme to dark to match your website
      className="toaster group"
      style={
        {
          "--normal-bg": "#1E1E1E", // Darker background for toast
          "--normal-text": "#FFFFFF", // White text
          "--normal-border": "#333333", // Dark border
          "--success-bg": "#0C4A6E", // Dark blue for success
          "--success-text": "#FFFFFF",
          "--error-bg": "#7F1D1D", // Dark red for errors
          "--error-text": "#FFFFFF",
          "--accent": "#FFD166", // Match your header accent color
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

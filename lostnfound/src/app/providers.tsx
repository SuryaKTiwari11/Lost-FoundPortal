"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, createContext, useContext, useState } from "react";
import { theme as appTheme } from "@/lib/theme";

// Create a simple theme context as fallback for next-themes
const ThemeContext = createContext({
  theme: "dark",
  setTheme: (_theme: string) => {},
});

export const useTheme = () => useContext(ThemeContext);

// Simple ThemeProvider fallback
function CustomThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Apply the theme variables to :root using inline style
  const cssVars = {
    "--background": appTheme.colors.background,
    "--foreground": appTheme.colors.foreground,
    "--card": appTheme.colors.card,
    "--card-foreground": appTheme.colors.cardForeground,
    "--popover": appTheme.colors.popover,
    "--popover-foreground": appTheme.colors.popoverForeground,
    "--primary": appTheme.colors.primary,
    "--primary-foreground": appTheme.colors.primaryForeground,
    "--secondary": appTheme.colors.secondary,
    "--secondary-foreground": appTheme.colors.secondaryForeground,
    "--muted": appTheme.colors.muted,
    "--muted-foreground": appTheme.colors.mutedForeground,
    "--accent": appTheme.colors.accent,
    "--accent-foreground": appTheme.colors.accentForeground,
    "--destructive": appTheme.colors.destructive,
    "--destructive-foreground": appTheme.colors.destructiveForeground,
    "--border": appTheme.colors.border,
    "--input": appTheme.colors.input,
    "--ring": appTheme.colors.ring,
  };

  return (
    <>
      {/* Apply theme variables */}
      <style jsx global>{`
        :root {
          --background: ${appTheme.colors.background};
          --foreground: ${appTheme.colors.foreground};
          --card: ${appTheme.colors.card};
          --card-foreground: ${appTheme.colors.cardForeground};
          --popover: ${appTheme.colors.popover};
          --popover-foreground: ${appTheme.colors.popoverForeground};
          --primary: ${appTheme.colors.primary};
          --primary-foreground: ${appTheme.colors.primaryForeground};
          --secondary: ${appTheme.colors.secondary};
          --secondary-foreground: ${appTheme.colors.secondaryForeground};
          --muted: ${appTheme.colors.muted};
          --muted-foreground: ${appTheme.colors.mutedForeground};
          --accent: ${appTheme.colors.accent};
          --accent-foreground: ${appTheme.colors.accentForeground};
          --destructive: ${appTheme.colors.destructive};
          --destructive-foreground: ${appTheme.colors.destructiveForeground};
          --border: ${appTheme.colors.border};
          --input: ${appTheme.colors.input};
          --ring: ${appTheme.colors.ring};
        }
      `}</style>

      <SessionProvider>
        <CustomThemeProvider>{children}</CustomThemeProvider>
      </SessionProvider>
    </>
  );
}

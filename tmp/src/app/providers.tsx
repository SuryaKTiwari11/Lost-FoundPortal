"use client";

import { SessionProvider } from "@/components/SessionProvider";
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
  return <SessionProvider>{children}</SessionProvider>;
}

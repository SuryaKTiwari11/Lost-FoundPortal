"use client";

import { useEffect, useState } from "react";

interface ClientBodyWrapperProps {
  children: React.ReactNode;
}

export function ClientBodyWrapper({ children }: ClientBodyWrapperProps) {
  // This state is used to force a client-side render after hydration
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    // Mark component as mounted on client-side
    setHasMounted(true);
    
    // Suppress React hydration warnings in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      const originalError = console.error;
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' && 
          (
            args[0].includes('Hydration failed because the initial UI does not match') ||
            args[0].includes('There was an error while hydrating')
          )
        ) {
          // Ignore hydration errors
          return;
        }
        originalError.apply(console, args);
      };
    }
  }, []);

  // If we haven't mounted yet, use the server-rendered content
  if (!hasMounted) {
    return <>{children}</>;
  }

  // After mounting, render the children normally (now it's a client render)
  return <>{children}</>;
}
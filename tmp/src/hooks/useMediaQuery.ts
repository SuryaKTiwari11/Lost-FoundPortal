"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook for responsive design with media queries
 * @param query The media query to match
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Avoid running on the server
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query)

      // Set the initial value
      setMatches(media.matches)

      // Define a callback to handle changes
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches)
      }

      // Add the listener
      media.addEventListener("change", listener)

      // Clean up
      return () => {
        media.removeEventListener("change", listener)
      }
    }
  }, [query])

  return matches
}

// Predefined media query hooks
export function useIsMobile() {
  return useMediaQuery("(max-width: 639px)")
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 640px) and (max-width: 1023px)")
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)")
}


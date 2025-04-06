"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { ApiResponse } from "@/types"

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  initialData?: T
  executeOnMount?: boolean
  mountParams?: any[]
}

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseApiReturn<T, P extends any[]> {
  data: T | null
  isLoading: boolean
  error: string | null
  execute: (...params: P) => Promise<ApiResponse<T>>
  reset: () => void
  isExecuted: boolean
}

/**
 * Custom hook for handling API requests with loading and error states
 */
export function useApi<T = any, P extends any[] = any[]>(
  apiFunction: (...params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {},
): UseApiReturn<T, P> {
  // Default options
  const defaultOptions = {
    executeOnMount: false,
    mountParams: [],
    ...options
  }
  
  // Use ref for options to prevent unnecessary re-renders
  const optionsRef = useRef(defaultOptions)
  
  // Keep track of component mounted state
  const isMountedRef = useRef(true)
  
  // Track if the execute function has been called
  const executedRef = useRef(false)
  
  // Use state for component data
  const [state, setState] = useState<UseApiState<T>>({
    data: options.initialData || null,
    isLoading: false,
    error: null,
  })
  
  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = { ...defaultOptions, ...options }
  }, [options, defaultOptions])
  
  // Handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Stable execute function that doesn't change between renders
  const execute = useCallback(
    async (...params: P) => {
      // Set executed flag
      executedRef.current = true
      
      // Only update state if component is mounted
      if (!isMountedRef.current) return { success: false, error: "Component unmounted" } as ApiResponse<T>
      
      // Set loading state
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await apiFunction(...params)
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          if (response.success && response.data !== undefined) {
            setState({ data: response.data, isLoading: false, error: null })
            optionsRef.current.onSuccess?.(response.data)
          } else {
            const errorMsg = response.error || "An unknown error occurred"
            setState(prev => ({ ...prev, isLoading: false, error: errorMsg }))
            optionsRef.current.onError?.(errorMsg)
          }
        }
        
        return response
      } catch (error) {
        // Handle errors
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
          optionsRef.current.onError?.(errorMessage)
        }
        
        return { success: false, error: errorMessage } as ApiResponse<T>
      }
    },
    [apiFunction] // Only depend on the API function, which should be stable
  )
  
  // Execute on mount if option is enabled
  useEffect(() => {
    if (optionsRef.current.executeOnMount && !executedRef.current) {
      execute(...(optionsRef.current.mountParams as P))
    }
  }, [execute])

  // Reset function
  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({
        data: optionsRef.current.initialData || null,
        isLoading: false,
        error: null,
      })
      executedRef.current = false
    }
  }, [])

  return {
    ...state,
    execute,
    reset,
    isExecuted: executedRef.current
  }
}

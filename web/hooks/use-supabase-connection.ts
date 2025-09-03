'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ConnectionStatus {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  lastChecked: Date | null
}

export function useSupabaseConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    lastChecked: null
  })

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simple health check - test basic connectivity
      const { error } = await supabase.auth.getSession()
      
      // If we get here without throwing, the connection works
      // Even if there's no session, the connection to Supabase is working

      setStatus({
        isConnected: true,
        isLoading: false,
        error: null,
        lastChecked: new Date()
      })
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown connection error'
      
      setStatus({
        isConnected: false,
        isLoading: false,
        error: errorMessage,
        lastChecked: new Date()
      })
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return {
    ...status,
    retry: checkConnection
  }
}
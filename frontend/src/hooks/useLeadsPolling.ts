import { useState, useEffect, useRef } from 'react'
import type { Lead } from '../types/lead'

interface UseLeadsPollingOptions {
  pollingInterval?: number // in milliseconds
  enabled?: boolean
  search?: string
  industry?: string
  urgency?: string
  minScore?: number
  tenantId?: string
}

interface UseLeadsPollingReturn {
  leads: Lead[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const useLeadsPolling = (options: UseLeadsPollingOptions = {}): UseLeadsPollingReturn => {
  const {
    pollingInterval = 5000, // Default: alle 5 Sekunden
    enabled = true,
    search,
    industry,
    urgency,
    minScore,
    tenantId
  } = options

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState<boolean>(enabled)
  
  const intervalRef = useRef<number | null>(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (industry) params.append('industry', industry)
      if (urgency) params.append('urgency', urgency)
      if (minScore) params.append('min_score', minScore.toString())

      const url = `${API_BASE_URL}/leads/?${params.toString()}`

      // Build headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId
      }

      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Django REST Framework returns paginated data with 'results' array
      const leadsData = data.results || data
      console.log('Fetched leads:', leadsData)
      setLeads(leadsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
      setError(errorMessage)
      console.error('Fehler beim Laden der Leads:', err)
    } finally {
      setLoading(false)
    }
  }

  const startPolling = () => {
    setIsPolling(true)
  }

  const stopPolling = () => {
    setIsPolling(false)
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    // Initial fetch
    if (isPolling) {
      fetchLeads()
    }

    // Setup polling
    if (isPolling && pollingInterval > 0) {
      intervalRef.current = window.setInterval(() => {
        fetchLeads()
      }, pollingInterval)
    }

    // Cleanup
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPolling, pollingInterval, search, industry, urgency, minScore, tenantId])

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    startPolling,
    stopPolling
  }
}

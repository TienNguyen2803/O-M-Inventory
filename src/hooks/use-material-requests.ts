'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MaterialRequest } from '@/lib/types'

interface MaterialRequestsResponse {
  data: MaterialRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseMaterialRequestsFilters {
  search?: string
  department?: string
  status?: string
  priority?: string
}

interface UseMaterialRequestsResult {
  requests: MaterialRequest[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  // Actions
  fetchRequests: (page?: number) => Promise<void>
  createRequest: (data: Omit<MaterialRequest, 'id' | 'step'>) => Promise<MaterialRequest | null>
  updateRequest: (id: string, data: Partial<MaterialRequest>) => Promise<MaterialRequest | null>
  deleteRequest: (id: string) => Promise<boolean>
  approveRequest: (id: string, approver: string) => Promise<MaterialRequest | null>
  // Search & Filter
  setSearch: (keyword: string) => void
  setFilters: (filters: UseMaterialRequestsFilters) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
}

export function useMaterialRequests(initialLimit: number = 10): UseMaterialRequestsResult {
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFiltersState] = useState<UseMaterialRequestsFilters>({})

  const fetchRequests = useCallback(async (page?: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const currentPage = page ?? pagination.page
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.search) params.set('search', filters.search)
      if (filters.department) params.set('department', filters.department)
      if (filters.status) params.set('status', filters.status)
      if (filters.priority) params.set('priority', filters.priority)

      const response = await fetch(`/api/material-requests?${params.toString()}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch material requests')
      }

      const data: MaterialRequestsResponse = await response.json()
      setRequests(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const createRequest = useCallback(async (
    data: Omit<MaterialRequest, 'id' | 'step'>
  ): Promise<MaterialRequest | null> => {
    try {
      const response = await fetch('/api/material-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterDept: data.requesterDept,
          reason: data.reason,
          requestDate: data.requestDate,
          workOrder: data.workOrder,
          priority: data.priority,
          items: data.items,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create request')
      }

      const result = await response.json()
      // Refetch to update the list
      await fetchRequests()
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request')
      return null
    }
  }, [fetchRequests])

  const updateRequest = useCallback(async (
    id: string,
    data: Partial<MaterialRequest>
  ): Promise<MaterialRequest | null> => {
    try {
      const response = await fetch(`/api/material-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update request')
      }

      const result = await response.json()
      setRequests(prev => prev.map(r => r.id === id ? result.data : r))
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request')
      return null
    }
  }, [])

  const deleteRequest = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/material-requests/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete request')
      }

      // Refetch to update the list after deletion
      await fetchRequests()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete request')
      return false
    }
  }, [fetchRequests])

  const approveRequest = useCallback(async (
    id: string,
    approver: string
  ): Promise<MaterialRequest | null> => {
    try {
      const response = await fetch(`/api/material-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to approve request')
      }

      const result = await response.json()
      setRequests(prev => prev.map(r => r.id === id ? result.data : r))
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request')
      return null
    }
  }, [])

  const setSearch = useCallback((keyword: string) => {
    setFiltersState(prev => ({ ...prev, search: keyword }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  const setFilters = useCallback((newFilters: UseMaterialRequestsFilters) => {
    setFiltersState(newFilters)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  return {
    requests,
    isLoading,
    error,
    pagination,
    fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    approveRequest,
    setSearch,
    setFilters,
    setPage,
    setLimit,
  }
}

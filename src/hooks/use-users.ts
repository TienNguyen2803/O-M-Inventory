'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@/lib/types'

interface UsersResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseUsersFilters {
  search?: string
  department?: string
  role?: string
  status?: string
}

interface UseUsersResult {
  users: User[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  // Actions
  fetchUsers: (page?: number) => Promise<void>
  createUser: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User | null>
  updateUser: (id: string, data: Partial<User>) => Promise<User | null>
  deleteUser: (id: string) => Promise<boolean>
  // Search & Filter
  setSearch: (keyword: string) => void
  setFilters: (filters: UseUsersFilters) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
}

export function useUsers(initialLimit: number = 10): UseUsersResult {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFiltersState] = useState<UseUsersFilters>({})

  const fetchUsers = useCallback(async (page?: number) => {
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
      if (filters.role) params.set('role', filters.role)
      if (filters.status) params.set('status', filters.status)

      const response = await fetch(`/api/users?${params.toString()}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch users')
      }

      const data: UsersResponse = await response.json()
      setUsers(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const createUser = useCallback(async (
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User | null> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create user')
      }

      const newUser = await response.json()
      // Refetch to update the list
      await fetchUsers()
      return newUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      return null
    }
  }, [fetchUsers])

  const updateUser = useCallback(async (
    id: string,
    data: Partial<User>
  ): Promise<User | null> => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update user')
      }

      const updatedUser = await response.json()
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u))
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      return null
    }
  }, [])

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete user')
      }

      // Refetch to update the list after deletion
      await fetchUsers()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      return false
    }
  }, [fetchUsers])

  const setSearch = useCallback((keyword: string) => {
    setFiltersState(prev => ({ ...prev, search: keyword }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  const setFilters = useCallback((newFilters: UseUsersFilters) => {
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
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    setSearch,
    setFilters,
    setPage,
    setLimit,
  }
}

// Simple hook to fetch roles for dropdowns
export function useRoles() {
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch('/api/roles')
        if (response.ok) {
          const data = await response.json()
          setRoles(data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoles()
  }, [])

  return { roles, isLoading }
}

// Simple hook to fetch departments for dropdowns
export function useDepartments() {
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch('/api/departments')
        if (response.ok) {
          const data = await response.json()
          setDepartments(data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDepartments()
  }, [])

  return { departments, isLoading }
}

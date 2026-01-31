'use client'

import { useState, useEffect, useCallback } from 'react'

export interface MasterDataItem {
  id: string
  code: string
  name: string
  color?: string | null
  sortOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface UseMasterDataTableResult {
  items: MasterDataItem[]
  isLoading: boolean
  error: string | null
  tableName: string
  group: string
  refetch: () => Promise<void>
  addItem: (item: Omit<MasterDataItem, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>) => Promise<MasterDataItem | null>
  updateItem: (id: string, item: Partial<MasterDataItem>) => Promise<MasterDataItem | null>
  deleteItem: (id: string) => Promise<boolean>
}

// Hook for fetching a specific master data table by tableId
export function useMasterDataTable(tableId: string): UseMasterDataTableResult {
  const [items, setItems] = useState<MasterDataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableName, setTableName] = useState('')
  const [group, setGroup] = useState('')

  const fetchItems = useCallback(async () => {
    if (!tableId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/master-data/${tableId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch data')
      }

      const data = await response.json()
      setItems(data.items || [])
      setTableName(data.tableName || '')
      setGroup(data.group || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [tableId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = useCallback(async (
    item: Omit<MasterDataItem, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
  ): Promise<MasterDataItem | null> => {
    try {
      const response = await fetch(`/api/master-data/${tableId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create item')
      }

      const newItem = await response.json()
      setItems(prev => [...prev, newItem])
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
      return null
    }
  }, [tableId])

  const updateItem = useCallback(async (
    id: string,
    item: Partial<MasterDataItem>
  ): Promise<MasterDataItem | null> => {
    try {
      const response = await fetch(`/api/master-data/${tableId}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update item')
      }

      const updatedItem = await response.json()
      setItems(prev => prev.map(i => i.id === id ? updatedItem : i))
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
      return null
    }
  }, [tableId])

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/master-data/${tableId}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete item')
      }

      setItems(prev => prev.filter(i => i.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
      return false
    }
  }, [tableId])

  return {
    items,
    isLoading,
    error,
    tableName,
    group,
    refetch: fetchItems,
    addItem,
    updateItem,
    deleteItem
  }
}

// Simple hook to get items for dropdowns/selects
export function useMasterDataItems(tableId: string) {
  const [items, setItems] = useState<MasterDataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch(`/api/master-data/${tableId}`)
        if (response.ok) {
          const data = await response.json()
          setItems(data.items || [])
        }
      } catch (err) {
        console.error('Failed to fetch master data items:', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (tableId) {
      fetchItems()
    }
  }, [tableId])

  return { items, isLoading }
}

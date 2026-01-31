import { useState, useEffect, useCallback } from 'react'

// Types
export interface Action {
  id: string
  code: string
  name: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Feature {
  id: string
  code: string
  name: string
  groupCode: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  actions?: Action[]
}

export interface FeatureAction {
  id: string
  featureId: string
  actionId: string
  feature?: Feature
  action?: Action
}

export interface Role {
  id: string
  name: string
  description: string | null
  userCount: number
  permissions: Record<string, string[]> // { featureCode: [actionCode, ...] }
  createdAt: string
  updatedAt: string
}

// ==================== useActions ====================
export function useActions() {
  const [actions, setActions] = useState<Action[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/actions')
      const data = await response.json()
      if (response.ok) {
        setActions(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch actions')
      }
    } catch (err) {
      setError('Failed to fetch actions')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createAction = useCallback(async (action: Omit<Action, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
      const data = await response.json()
      if (response.ok) {
        await fetchActions()
        return data.data
      }
      setError(data.error)
      return null
    } catch (err) {
      setError('Failed to create action')
      console.error(err)
      return null
    }
  }, [fetchActions])

  const updateAction = useCallback(async (id: string, updates: Partial<Action>) => {
    try {
      const response = await fetch(`/api/actions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()
      if (response.ok) {
        await fetchActions()
        return data.data
      }
      setError(data.error)
      return null
    } catch (err) {
      setError('Failed to update action')
      console.error(err)
      return null
    }
  }, [fetchActions])

  const deleteAction = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/actions/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchActions()
        return true
      }
      const data = await response.json()
      setError(data.error)
      return false
    } catch (err) {
      setError('Failed to delete action')
      console.error(err)
      return false
    }
  }, [fetchActions])

  useEffect(() => {
    fetchActions()
  }, [fetchActions])

  return { actions, isLoading, error, fetchActions, createAction, updateAction, deleteAction }
}

// ==================== useFeatures ====================
export function useFeatures(grouped = false) {
  const [features, setFeatures] = useState<Feature[]>([])
  const [groupedFeatures, setGroupedFeatures] = useState<Record<string, Feature[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeatures = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = grouped ? '/api/features?grouped=true' : '/api/features'
      const response = await fetch(url)
      const data = await response.json()
      if (response.ok) {
        if (grouped) {
          setGroupedFeatures(data.data || {})
        } else {
          setFeatures(data.data || [])
        }
      } else {
        setError(data.error || 'Failed to fetch features')
      }
    } catch (err) {
      setError('Failed to fetch features')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [grouped])

  const createFeature = useCallback(async (feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt' | 'actions'>) => {
    try {
      const response = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feature),
      })
      const data = await response.json()
      if (response.ok) {
        await fetchFeatures()
        return data.data
      }
      setError(data.error)
      return null
    } catch (err) {
      setError('Failed to create feature')
      console.error(err)
      return null
    }
  }, [fetchFeatures])

  const updateFeature = useCallback(async (id: string, updates: Partial<Feature>) => {
    try {
      const response = await fetch(`/api/features/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()
      if (response.ok) {
        await fetchFeatures()
        return data.data
      }
      setError(data.error)
      return null
    } catch (err) {
      setError('Failed to update feature')
      console.error(err)
      return null
    }
  }, [fetchFeatures])

  const deleteFeature = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/features/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchFeatures()
        return true
      }
      const data = await response.json()
      setError(data.error)
      return false
    } catch (err) {
      setError('Failed to delete feature')
      console.error(err)
      return false
    }
  }, [fetchFeatures])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  return { features, groupedFeatures, isLoading, error, fetchFeatures, createFeature, updateFeature, deleteFeature }
}

// ==================== useFeatureActions ====================
export function useFeatureActions() {
  const [featureActions, setFeatureActions] = useState<FeatureAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeatureActions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/feature-actions')
      const data = await response.json()
      if (response.ok) {
        setFeatureActions(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch feature-actions')
      }
    } catch (err) {
      setError('Failed to fetch feature-actions')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addActionToFeature = useCallback(async (featureId: string, actionId: string) => {
    try {
      const response = await fetch('/api/feature-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId, actionId }),
      })
      const data = await response.json()
      if (response.ok) {
        await fetchFeatureActions()
        return data.data
      }
      setError(data.error)
      return null
    } catch (err) {
      setError('Failed to add action to feature')
      console.error(err)
      return null
    }
  }, [fetchFeatureActions])

  const removeActionFromFeature = useCallback(async (featureId: string, actionId: string) => {
    try {
      const response = await fetch(`/api/feature-actions?featureId=${featureId}&actionId=${actionId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchFeatureActions()
        return true
      }
      const data = await response.json()
      setError(data.error)
      return false
    } catch (err) {
      setError('Failed to remove action from feature')
      console.error(err)
      return false
    }
  }, [fetchFeatureActions])

  useEffect(() => {
    fetchFeatureActions()
  }, [fetchFeatureActions])

  return { featureActions, isLoading, error, fetchFeatureActions, addActionToFeature, removeActionFromFeature }
}

// ==================== useRolesManagement ====================
export function useRolesManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      if (response.ok) {
        setRoles(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch roles')
      }
    } catch (err) {
      setError('Failed to fetch roles')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getRole = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/roles/${id}`)
      const data = await response.json()
      if (response.ok) {
        return data.data as Role
      }
      setError(data.error)
      return null
    } catch (err) {
      setError('Failed to fetch role')
      console.error(err)
      return null
    }
  }, [])

  const createRole = useCallback(async (role: { name: string; description?: string; permissions?: Record<string, string[]> }) => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
      })
      const data = await response.json()
      if (response.ok) {
        await fetchRoles()
        return data
      }
      setError(data.error)
      return null
    } catch (err) {
      setError('Failed to create role')
      console.error(err)
      return null
    }
  }, [fetchRoles])

  const updateRole = useCallback(async (id: string, updates: Partial<Role>) => {
    try {
      const response = await fetch(`/api/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()
      if (response.ok) {
        await fetchRoles()
        return data.data
      }
      setError(data.error)
      return null
    } catch (err) {
      setError('Failed to update role')
      console.error(err)
      return null
    }
  }, [fetchRoles])

  const updateRolePermissions = useCallback(async (id: string, permissions: Record<string, string[]>) => {
    return updateRole(id, { permissions })
  }, [updateRole])

  const deleteRole = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/roles/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchRoles()
        return true
      }
      const data = await response.json()
      setError(data.error)
      return false
    } catch (err) {
      setError('Failed to delete role')
      console.error(err)
      return false
    }
  }, [fetchRoles])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  return { roles, isLoading, error, fetchRoles, getRole, createRole, updateRole, updateRolePermissions, deleteRole }
}

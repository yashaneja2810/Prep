import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  getAllCPs,
  getCPsByTopicId,
  getCPById,
  createCP,
  updateCPById,
  deleteCPById,
  CPS_SWR_KEY,
  CPS_BY_TOPIC_SWR_KEY,
  CP_BY_ID_SWR_KEY,
  CP,
  CreateCPDto,
  UpdateCPDto
} from '@/lib/api/cps'
import { useCPsStore } from '@/store/slices/cps'
import { handleError } from '@/helpers/helpers'
import { API_MESSAGES } from '@/helpers/string_const'

// Type for the CPs hook return
interface UseCPsReturn {
  cps: CP[]
  isLoading: boolean
  error: string | null
  mutate: () => Promise<CP[] | undefined>
  // Store state
  filteredCPs: CP[]
  selectedCP: CP | null
  searchTerm: string
  selectedDifficulty: string
  activeTab: string
  // Store actions
  setSearchTerm: (term: string) => void
  setSelectedDifficulty: (difficulty: string) => void
  setActiveTab: (tab: string) => void
  filterCPs: () => void
  resetFilters: () => void
  setCPs: (cps: CP[]) => void
  addCP: (cp: CP) => void
  updateCP: (cpId: string, updates: Partial<CP>) => void
  removeCP: (cpId: string) => void
  setSelectedCP: (cp: CP | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Simple CPs hook for basic listing
export const useCPs = (): UseCPsReturn => {
  const store = useCPsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    CPS_SWR_KEY,
    getAllCPs,
    {
      onSuccess: (data) => {
        console.log('🟢 [useCPs] SWR success, setting CPs in store')
        store.setCPs(data || [])
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useCPs] SWR error:', error)
        // Don't show toast here as handleError already shows it
        // Just extract the message for the store
        let errorMessage = 'Failed to load concept practices'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
        store.setLoading(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state using useEffect to avoid setState during render
  useEffect(() => {
    if (isLoading !== store.isLoading) {
      store.setLoading(isLoading)
    }
  }, [isLoading, store.isLoading, store.setLoading])

  return {
    cps: data || [],
    isLoading,
    error: error ? 'Failed to load concept practices' : null,
    mutate,
    // Store state
    filteredCPs: store.filteredCPs,
    selectedCP: store.selectedCP,
    searchTerm: store.searchTerm,
    selectedDifficulty: store.selectedDifficulty,
    activeTab: store.activeTab,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setSelectedDifficulty: store.setSelectedDifficulty,
    setActiveTab: store.setActiveTab,
    filterCPs: store.filterCPs,
    resetFilters: store.resetFilters,
    setCPs: store.setCPs,
    addCP: store.addCP,
    updateCP: store.updateCP,
    removeCP: store.removeCP,
    setSelectedCP: store.setSelectedCP,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for CPs by topic hook return
interface UseCPsByTopicReturn {
  cps: CP[]
  isLoading: boolean
  error: string | null
  mutate: () => Promise<CP[] | undefined>
  // Store state
  filteredCPs: CP[]
  selectedCP: CP | null
  searchTerm: string
  selectedDifficulty: string
  // Store actions
  setSearchTerm: (term: string) => void
  setSelectedDifficulty: (difficulty: string) => void
  filterCPs: () => void
  resetFilters: () => void
}

// CPs by topic hook
export const useCPsByTopic = (topicId: string | null): UseCPsByTopicReturn => {
  const store = useCPsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    topicId ? CPS_BY_TOPIC_SWR_KEY(topicId) : null,
    topicId ? () => getCPsByTopicId(topicId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useCPsByTopic] SWR success for topic:', topicId)
        if (data) {
          // We only want to set the CPs for this topic, not all CPs
          // This is different from the useCPs hook
          const currentCPs = store.cps.filter(cp => cp.topic_id !== topicId)
          const updatedCPs = [...currentCPs, ...data]
          store.setCPs(updatedCPs)
          
          // Set the active tab to filter by this topic
          if (topicId) {
            store.setActiveTab(topicId)
          }
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useCPsByTopic] SWR error:', error)
        let errorMessage = 'Failed to load concept practices for this topic'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    cps: data || [],
    isLoading,
    error: error ? 'Failed to load concept practices for this topic' : null,
    mutate,
    // Store state
    filteredCPs: store.filteredCPs,
    selectedCP: store.selectedCP,
    searchTerm: store.searchTerm,
    selectedDifficulty: store.selectedDifficulty,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setSelectedDifficulty: store.setSelectedDifficulty,
    filterCPs: store.filterCPs,
    resetFilters: store.resetFilters,
  }
}

// Type for single CP hook return
interface UseCPReturn {
  cp: CP | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<CP | undefined>
}

// Single CP hook
export const useCP = (cpId: string | null): UseCPReturn => {
  const store = useCPsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    cpId ? CP_BY_ID_SWR_KEY(cpId) : null,
    cpId ? () => getCPById(cpId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useCP] SWR success for CP:', cpId)
        if (data) {
          store.setSelectedCP(data)
          
          // Update the CP in the store if it exists
          const existingCP = store.getCPById(data.id)
          if (existingCP) {
            store.updateCP(data.id, data)
          } else {
            store.addCP(data)
          }
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useCP] SWR error:', error)
        let errorMessage = 'Failed to load concept practice'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    cp: data || null,
    isLoading,
    error: error ? 'Failed to load concept practice' : null,
    mutate,
  }
}

// Type for CP mutations hook return
interface UseCPMutationsReturn {
  createCP: (cpData: CreateCPDto) => Promise<CP>
  updateCP: (cpId: string, cpData: UpdateCPDto) => Promise<CP>
  deleteCP: (cpId: string) => Promise<void>
  // Store state
  isSubmitting: boolean
  formErrors: Record<string, string>
  formMode: 'create' | 'edit' | 'view'
  isFormOpen: boolean
  editingCPId: string | null
}

// CP mutations hook
export const useCPMutations = (): UseCPMutationsReturn => {
  const store = useCPsStore()
  
  const createCPMutation = useCallback(async (cpData: CreateCPDto): Promise<CP> => {
    store.setSubmitting(true)
    try {
      const result = await createCP(cpData)
      toast.success('Concept practice created successfully')
      
      // Update store with the new CP
      store.addCP(result)
      
      return result
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const updateCPMutation = useCallback(async (cpId: string, cpData: UpdateCPDto): Promise<CP> => {
    store.setSubmitting(true)
    try {
      const result = await updateCPById(cpId, cpData)
      toast.success('Concept practice updated successfully')
      
      // Update store with the updated CP
      store.updateCP(cpId, result)
      
      return result
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const deleteCPMutation = useCallback(async (cpId: string): Promise<void> => {
    store.setSubmitting(true)
    try {
      await deleteCPById(cpId)
      toast.success('Concept practice deleted successfully')
      
      // Remove the CP from the store
      store.removeCP(cpId)
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  return {
    createCP: createCPMutation,
    updateCP: updateCPMutation,
    deleteCP: deleteCPMutation,
    // Store state
    isSubmitting: store.isSubmitting,
    formErrors: store.formErrors,
    formMode: store.formMode,
    isFormOpen: store.isFormOpen,
    editingCPId: store.editingCPId,
  }
} 
import useSWR from 'swr'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  getAllOrganizations,
  getAllOrganizationsPaginated,
  getOrganizationById,
  createOrganization,
  updateOrganizationById,
  deactivateOrganizationById,
  activateOrganizationById,
  permanentlyDeleteOrganizationById,
  ORGANIZATIONS_SWR_KEY,
  ORGANIZATIONS_PAGINATED_SWR_KEY,
  ORGANIZATION_BY_ID_SWR_KEY,
  Organization,
  CreateOrganizationData,
  UpdateOrganizationData,
  OrganizationQueryParams
} from '@/lib/api/organizations'
import { useOrganizationsStore } from '@/store/slices/organizations'
import { handleError } from '@/helpers/helpers'
import { API_MESSAGES } from '@/helpers/string_const'

// Type for the organizations hook return
interface UseOrganizationsReturn {
  organizations: Organization[]
  isLoading: boolean
  error: string | null
  mutate: () => Promise<Organization[] | undefined>
  // Store state
  filteredOrganizations: Organization[]
  selectedOrganization: Organization | null
  searchTerm: string
  selectedType: string
  selectedIndustry: string
  selectedStatus: string
  activeTab: string
  // Store actions
  setSearchTerm: (term: string) => void
  setSelectedType: (type: string) => void
  setSelectedIndustry: (industry: string) => void
  setSelectedStatus: (status: string) => void
  setActiveTab: (tab: string) => void
  filterOrganizations: () => void
  resetFilters: () => void
  setOrganizations: (organizations: Organization[]) => void
  addOrganization: (organization: Organization) => void
  updateOrganization: (organizationId: string, updates: Partial<Organization>) => void
  removeOrganization: (organizationId: string) => void
  setSelectedOrganization: (organization: Organization | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Simple organizations hook for basic listing
export const useOrganizations = (): UseOrganizationsReturn => {
  const store = useOrganizationsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    ORGANIZATIONS_SWR_KEY,
    getAllOrganizations,
    {
      onSuccess: (data) => {
        console.log('🟢 [useOrganizations] SWR success, setting organizations in store')
        store.setOrganizations(data || [])
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useOrganizations] SWR error:', error)
        // Don't show toast here as handleError already shows it
        // Just extract the message for the store
        let errorMessage = 'Failed to load organizations'
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
    organizations: data || [],
    isLoading,
    error: error ? 'Failed to load organizations' : null,
    mutate,
    // Store state
    filteredOrganizations: store.filteredOrganizations,
    selectedOrganization: store.selectedOrganization,
    searchTerm: store.searchTerm,
    selectedType: store.selectedType,
    selectedIndustry: store.selectedIndustry,
    selectedStatus: store.selectedStatus,
    activeTab: store.activeTab,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setSelectedType: store.setSelectedType,
    setSelectedIndustry: store.setSelectedIndustry,
    setSelectedStatus: store.setSelectedStatus,
    setActiveTab: store.setActiveTab,
    filterOrganizations: store.filterOrganizations,
    resetFilters: store.resetFilters,
    setOrganizations: store.setOrganizations,
    addOrganization: store.addOrganization,
    updateOrganization: store.updateOrganization,
    removeOrganization: store.removeOrganization,
    setSelectedOrganization: store.setSelectedOrganization,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for paginated organizations hook return
interface UseOrganizationsPaginatedReturn {
  data: {
    organizations: Organization[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
  organizations: Organization[]
  isLoading: boolean
  error: string | null
  mutate: () => Promise<any>
  // Store state
  filteredOrganizations: Organization[]
  selectedOrganization: Organization | null
  searchTerm: string
  selectedType: string
  selectedIndustry: string
  selectedStatus: string
  activeTab: string
  // Store actions
  setSearchTerm: (term: string) => void
  setSelectedType: (type: string) => void
  setSelectedIndustry: (industry: string) => void
  setSelectedStatus: (status: string) => void
  setActiveTab: (tab: string) => void
  filterOrganizations: () => void
  resetFilters: () => void
  setOrganizations: (organizations: Organization[]) => void
  addOrganization: (organization: Organization) => void
  updateOrganization: (organizationId: string, updates: Partial<Organization>) => void
  removeOrganization: (organizationId: string) => void
  setSelectedOrganization: (organization: Organization | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Paginated organizations hook
export const useOrganizationsPaginated = (params?: OrganizationQueryParams): UseOrganizationsPaginatedReturn => {
  const store = useOrganizationsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    ORGANIZATIONS_PAGINATED_SWR_KEY(params),
    () => getAllOrganizationsPaginated(params),
    {
      onSuccess: (data) => {
        console.log('🟢 [useOrganizationsPaginated] SWR success')
        if (data?.organizations) {
          store.setOrganizations(data.organizations)
        }
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useOrganizationsPaginated] SWR error:', error)
        let errorMessage = 'Failed to load organizations'
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

  return {
    data: data || { organizations: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    organizations: data?.organizations || [],
    isLoading,
    error: error ? 'Failed to load organizations' : null,
    mutate,
    // Store state
    filteredOrganizations: store.filteredOrganizations,
    selectedOrganization: store.selectedOrganization,
    searchTerm: store.searchTerm,
    selectedType: store.selectedType,
    selectedIndustry: store.selectedIndustry,
    selectedStatus: store.selectedStatus,
    activeTab: store.activeTab,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setSelectedType: store.setSelectedType,
    setSelectedIndustry: store.setSelectedIndustry,
    setSelectedStatus: store.setSelectedStatus,
    setActiveTab: store.setActiveTab,
    filterOrganizations: store.filterOrganizations,
    resetFilters: store.resetFilters,
    setOrganizations: store.setOrganizations,
    addOrganization: store.addOrganization,
    updateOrganization: store.updateOrganization,
    removeOrganization: store.removeOrganization,
    setSelectedOrganization: store.setSelectedOrganization,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for single organization hook return
interface UseOrganizationReturn {
  organization: Organization | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<Organization | undefined>
}

// Single organization hook
export const useOrganization = (organizationId: string | null): UseOrganizationReturn => {
  const store = useOrganizationsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    organizationId ? ORGANIZATION_BY_ID_SWR_KEY(organizationId) : null,
    organizationId ? () => getOrganizationById(organizationId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useOrganization] SWR success for organization:', organizationId)
        if (data) {
          store.setSelectedOrganization(data)
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useOrganization] SWR error:', error)
        let errorMessage = 'Failed to load organization'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
      },
      revalidateOnFocus: false,
    }
  )

  return {
    organization: data || null,
    isLoading,
    error: error ? 'Failed to load organization' : null,
    mutate
  }
}

// Type for mutations hook return
interface UseOrganizationsMutationsReturn {
  createOrganization: (organizationData: CreateOrganizationData) => Promise<Organization>
  updateOrganization: (organizationId: string, organizationData: UpdateOrganizationData) => Promise<Organization>
  deactivateOrganization: (organizationId: string) => Promise<Organization>
  activateOrganization: (organizationId: string) => Promise<Organization>
  deleteOrganization: (organizationId: string) => Promise<void>
  // Store state
  isSubmitting: boolean
  formErrors: Record<string, string>
  formMode: 'create' | 'edit' | 'view'
  isFormOpen: boolean
  editingOrganizationId: string | null
}

// Organizations mutations hook
export const useOrganizationsMutations = (): UseOrganizationsMutationsReturn => {
  const store = useOrganizationsStore()

  const createOrganizationMutation = useCallback(async (organizationData: CreateOrganizationData): Promise<Organization> => {
    try {
      store.setSubmitting(true)
      store.clearFormErrors()
      
      const newOrganization = await createOrganization(organizationData)
      
      // Update store
      store.addOrganization(newOrganization)
      
      // Show success message
      toast.success(API_MESSAGES.ORGANIZATION_CREATED_SUCCESS)
      
      // Close form and reset
      store.toggleForm(false)
      
      return newOrganization
    } catch (error) {
      console.error('🔴 [createOrganizationMutation] Error:', error)
      const errorMessage = handleError(error)
      
      // Handle validation errors
      if (error instanceof Error && error.message.includes('validation')) {
        store.setFormErrors({ general: errorMessage })
      }
      
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const updateOrganizationMutation = useCallback(async (
    organizationId: string, 
    organizationData: UpdateOrganizationData
  ): Promise<Organization> => {
    try {
      store.setSubmitting(true)
      store.clearFormErrors()
      
      const updatedOrganization = await updateOrganizationById(organizationId, organizationData)
      
      // Update store
      store.updateOrganization(organizationId, updatedOrganization)
      
      // Show success message
      toast.success(API_MESSAGES.ORGANIZATION_UPDATED_SUCCESS)
      
      // Close form and reset
      store.toggleForm(false)
      
      return updatedOrganization
    } catch (error) {
      console.error('🔴 [updateOrganizationMutation] Error:', error)
      const errorMessage = handleError(error)
      
      // Handle validation errors
      if (error instanceof Error && error.message.includes('validation')) {
        store.setFormErrors({ general: errorMessage })
      }
      
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const deactivateOrganizationMutation = useCallback(async (organizationId: string): Promise<Organization> => {
    try {
      const deactivatedOrganization = await deactivateOrganizationById(organizationId)
      
      // Update store
      store.updateOrganization(organizationId, { is_active: false })
      
      // Show success message
      toast.success(API_MESSAGES.ORGANIZATION_DEACTIVATED_SUCCESS)
      
      return deactivatedOrganization
    } catch (error) {
      console.error('🔴 [deactivateOrganizationMutation] Error:', error)
      handleError(error)
      throw error
    }
  }, [store])

  const activateOrganizationMutation = useCallback(async (organizationId: string): Promise<Organization> => {
    try {
      const activatedOrganization = await activateOrganizationById(organizationId)
      
      // Update store
      store.updateOrganization(organizationId, { is_active: true })
      
      // Show success message
      toast.success(API_MESSAGES.ORGANIZATION_ACTIVATED_SUCCESS)
      
      return activatedOrganization
    } catch (error) {
      console.error('🔴 [activateOrganizationMutation] Error:', error)
      handleError(error)
      throw error
    }
  }, [store])

  const deleteOrganizationMutation = useCallback(async (organizationId: string): Promise<void> => {
    try {
      await permanentlyDeleteOrganizationById(organizationId)
      
      // Remove from store
      store.removeOrganization(organizationId)
      
      // Show success message
      toast.success(API_MESSAGES.ORGANIZATION_DELETED_SUCCESS)
      
    } catch (error) {
      console.error('🔴 [deleteOrganizationMutation] Error:', error)
      handleError(error)
      throw error
    }
  }, [store])

  return {
    createOrganization: createOrganizationMutation,
    updateOrganization: updateOrganizationMutation,
    deactivateOrganization: deactivateOrganizationMutation,
    activateOrganization: activateOrganizationMutation,
    deleteOrganization: deleteOrganizationMutation,
    // Store state
    isSubmitting: store.isSubmitting,
    formErrors: store.formErrors,
    formMode: store.formMode,
    isFormOpen: store.isFormOpen,
    editingOrganizationId: store.editingOrganizationId
  }
}

// Type for stats hook return
interface UseOrganizationStatsReturn {
  totalOrganizations: number
  activeOrganizations: number
  inactiveOrganizations: number
  hiringOrganizations: number
  trainingOrganizations: number
  currentlyHiring: number
  industries: string[]
  countries: string[]
}

// Helper hook for organization statistics
export const useOrganizationStats = (): UseOrganizationStatsReturn => {
  const { organizations } = useOrganizations()
  
  // Ensure organizations is always an array
  const safeOrganizations = Array.isArray(organizations) ? organizations : []
  
  return {
    totalOrganizations: safeOrganizations.length,
    activeOrganizations: safeOrganizations.filter(org => org.is_active).length,
    inactiveOrganizations: safeOrganizations.filter(org => !org.is_active).length,
    hiringOrganizations: safeOrganizations.filter(org => org.type === 'hiring').length,
    trainingOrganizations: safeOrganizations.filter(org => org.type === 'training').length,
    currentlyHiring: safeOrganizations.filter(org => org.is_currently_hiring === true).length,
    industries: Array.from(new Set(safeOrganizations.map(org => org.industry).filter((industry): industry is string => Boolean(industry)))).sort(),
    countries: Array.from(new Set(safeOrganizations.map(org => org.country).filter((country): country is string => Boolean(country)))).sort()
  }
} 
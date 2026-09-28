import { create } from 'zustand'
import { Cohort } from '@/lib/api/cohorts'

// Extended cohort interface for UI display
export interface ExtendedCohort extends Cohort {
  // Additional UI-specific fields
  completion_percentage?: number
  total_learners?: number
  active_learners?: number
  formatted_status?: string
  formatted_scope?: string
}

// Form modes for cohort management
export type FormMode = 'create' | 'edit' | 'view'

interface CohortsState {
  // Data
  cohorts: Cohort[]
  filteredCohorts: Cohort[]
  selectedCohort: Cohort | null
  
  // Filters
  searchTerm: string
  selectedStatus: string
  selectedScope: string
  activeTab: string
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingCohortId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setCohorts: (cohorts: Cohort[]) => void
  addCohort: (cohort: Cohort) => void
  updateCohort: (cohortId: string, updates: Partial<Cohort>) => void
  removeCohort: (cohortId: string) => void
  setSelectedCohort: (cohort: Cohort | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setSelectedStatus: (status: string) => void
  setSelectedScope: (scope: string) => void
  setActiveTab: (tab: string) => void
  filterCohorts: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingCohortId: (cohortId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getCohortById: (cohortId: string) => Cohort | null
  getActiveCohorts: () => Cohort[]
  getCompletedCohorts: () => Cohort[]
  getUpcomingCohorts: () => Cohort[]
  getCancelledCohorts: () => Cohort[]
  getDirectCohorts: () => Cohort[]
  getOrganizationCohorts: () => Cohort[]
}

export const useCohortsStore = create<CohortsState>((set, get) => ({
  // Initial state
  cohorts: [],
  filteredCohorts: [],
  selectedCohort: null,
  searchTerm: "",
  selectedStatus: "all",
  selectedScope: "all",
  activeTab: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingCohortId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setCohorts: (cohorts) => {
    // Ensure cohorts is always an array
    const safeCohorts = Array.isArray(cohorts) ? cohorts : []
    console.log('🟢 [COHORT_STORE] setCohorts called with', safeCohorts.length, 'cohorts')
    const currentCohorts = get().cohorts
    
    // Only update if data actually changed
    if (JSON.stringify(currentCohorts) !== JSON.stringify(safeCohorts)) {
      console.log('🟢 [COHORT_STORE] Cohorts data changed, updating state')
      set({ cohorts: safeCohorts })
      // Use setTimeout to prevent cascading updates
      setTimeout(() => {
        console.log('🟢 [COHORT_STORE] Applying filters after state update')
        get().filterCohorts()
      }, 0)
    } else {
      console.log('🟢 [COHORT_STORE] Cohorts data unchanged, skipping update')
    }
  },

  addCohort: (cohort) => {
    console.log('🟢 [COHORT_STORE] addCohort called for:', cohort.id)
    const { cohorts } = get()
    const safeCohorts = Array.isArray(cohorts) ? cohorts : []
    const updatedCohorts = [cohort, ...safeCohorts]
    set({ cohorts: updatedCohorts })
    get().filterCohorts()
  },

  updateCohort: (cohortId, updates) => {
    console.log('🟢 [COHORT_STORE] updateCohort called for:', cohortId)
    const { cohorts } = get()
    const safeCohorts = Array.isArray(cohorts) ? cohorts : []
    const updatedCohorts = safeCohorts.map(cohort =>
      cohort.id === cohortId ? { ...cohort, ...updates } : cohort
    )
    set({ cohorts: updatedCohorts })
    get().filterCohorts()
    
    // Update selected cohort if it's the one being updated
    const { selectedCohort } = get()
    if (selectedCohort && selectedCohort.id === cohortId) {
      set({ selectedCohort: { ...selectedCohort, ...updates } })
    }
  },

  removeCohort: (cohortId) => {
    console.log('🟢 [COHORT_STORE] removeCohort called for:', cohortId)
    const { cohorts, selectedCohort } = get()
    const safeCohorts = Array.isArray(cohorts) ? cohorts : []
    const updatedCohorts = safeCohorts.filter(cohort => cohort.id !== cohortId)
    set({ cohorts: updatedCohorts })
    
    // Use setTimeout to prevent cascading updates
    setTimeout(() => {
      console.log('🟢 [COHORT_STORE] Applying filters after cohort removal')
      get().filterCohorts()
    }, 0)
    
    // Clear selected cohort if it's the one being removed
    if (selectedCohort && selectedCohort.id === cohortId) {
      set({ selectedCohort: null })
    }
    
    // Clear editing cohort if it's the one being removed
    const { editingCohortId } = get()
    if (editingCohortId === cohortId) {
      set({ editingCohortId: null })
    }
  },

  setSelectedCohort: (selectedCohort) => set({ selectedCohort }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterCohorts()
  },

  setSelectedStatus: (selectedStatus) => {
    set({ selectedStatus })
    get().filterCohorts()
  },

  setSelectedScope: (selectedScope) => {
    set({ selectedScope })
    get().filterCohorts()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterCohorts()
  },

  filterCohorts: () => {
    const { 
      cohorts, 
      searchTerm, 
      selectedStatus, 
      selectedScope,
      activeTab 
    } = get()
    
    if (!Array.isArray(cohorts)) {
      set({ filteredCohorts: [] })
      return
    }
    
    let filtered = [...cohorts]
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(cohort => 
        cohort.title?.toLowerCase().includes(search) ||
        cohort.cohort_code?.toLowerCase().includes(search) ||
        cohort.description?.toLowerCase().includes(search) ||
        cohort.program?.title?.toLowerCase().includes(search) ||
        cohort.organization?.org_name?.toLowerCase().includes(search)
      )
    }
    
    // Filter by status
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter(cohort => cohort.status === selectedStatus)
    }
    
    // Filter by scope
    if (selectedScope && selectedScope !== 'all') {
      filtered = filtered.filter(cohort => cohort.scope === selectedScope)
    }
    
    // Filter by active tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(cohort => cohort.status === 'upcoming')
    } else if (activeTab === 'active') {
      filtered = filtered.filter(cohort => cohort.status === 'active')
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(cohort => cohort.status === 'completed')
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(cohort => cohort.status === 'cancelled')
    } else if (activeTab === 'direct') {
      filtered = filtered.filter(cohort => cohort.scope === 'direct')
    } else if (activeTab === 'organization') {
      filtered = filtered.filter(cohort => cohort.scope === 'organization')
    }
    
    set({ filteredCohorts: filtered })
  },

  resetFilters: () => {
    set({
      searchTerm: '',
      selectedStatus: 'all',
      selectedScope: 'all',
      activeTab: 'all'
    })
    get().filterCohorts()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),
  
  toggleForm: (open) => set({ isFormOpen: open }),
  
  setFormErrors: (formErrors) => set({ formErrors }),
  
  clearFormErrors: () => set({ formErrors: {} }),
  
  setEditingCohortId: (editingCohortId) => set({ editingCohortId }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // Helper Functions
  getCohortById: (cohortId) => {
    const { cohorts } = get()
    if (!Array.isArray(cohorts)) return null
    return cohorts.find(cohort => cohort.id === cohortId) || null
  },
  
  getActiveCohorts: () => {
    const { cohorts } = get()
    if (!Array.isArray(cohorts)) return []
    return cohorts.filter(cohort => cohort.status === 'active')
  },
  
  getCompletedCohorts: () => {
    const { cohorts } = get()
    if (!Array.isArray(cohorts)) return []
    return cohorts.filter(cohort => cohort.status === 'completed')
  },
  
  getUpcomingCohorts: () => {
    const { cohorts } = get()
    if (!Array.isArray(cohorts)) return []
    return cohorts.filter(cohort => cohort.status === 'upcoming')
  },
  
  getCancelledCohorts: () => {
    const { cohorts } = get()
    if (!Array.isArray(cohorts)) return []
    return cohorts.filter(cohort => cohort.status === 'cancelled')
  },
  
  getDirectCohorts: () => {
    const { cohorts } = get()
    if (!Array.isArray(cohorts)) return []
    return cohorts.filter(cohort => cohort.scope === 'direct')
  },
  
  getOrganizationCohorts: () => {
    const { cohorts } = get()
    if (!Array.isArray(cohorts)) return []
    return cohorts.filter(cohort => cohort.scope === 'organization')
  }
}))

// Selector exports
export const useFilteredCohorts = () => useCohortsStore(state => state.filteredCohorts)
export const useCohortsLoading = () => useCohortsStore(state => state.isLoading)
export const useCohortsError = () => useCohortsStore(state => state.error)
export const useSelectedCohort = () => useCohortsStore(state => state.selectedCohort)
export const useCohortsFormState = () => useCohortsStore(state => ({
  formMode: state.formMode,
  isFormOpen: state.isFormOpen,
  formErrors: state.formErrors,
  editingCohortId: state.editingCohortId,
  isSubmitting: state.isSubmitting,
  setFormMode: state.setFormMode,
  toggleForm: state.toggleForm,
  setFormErrors: state.setFormErrors,
  clearFormErrors: state.clearFormErrors,
  setEditingCohortId: state.setEditingCohortId,
  setSubmitting: state.setSubmitting
})) 
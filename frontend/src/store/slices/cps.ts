import { create } from 'zustand'
import { CP } from '@/lib/api/cps'

// Form modes for CP management
export type FormMode = 'create' | 'edit' | 'view'

interface CPsState {
  // Data
  cps: CP[]
  filteredCPs: CP[]
  selectedCP: CP | null
  
  // Filters
  searchTerm: string
  selectedDifficulty: string
  activeTab: string
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingCPId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setCPs: (cps: CP[]) => void
  addCP: (cp: CP) => void
  updateCP: (cpId: string, updates: Partial<CP>) => void
  removeCP: (cpId: string) => void
  setSelectedCP: (cp: CP | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setSelectedDifficulty: (difficulty: string) => void
  setActiveTab: (tab: string) => void
  filterCPs: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingCPId: (cpId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getCPById: (cpId: string) => CP | null
  getCPsByTopic: (topicId: string) => CP[]
}

export const useCPsStore = create<CPsState>((set, get) => ({
  // Initial state
  cps: [],
  filteredCPs: [],
  selectedCP: null,
  searchTerm: "",
  selectedDifficulty: "all",
  activeTab: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingCPId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setCPs: (cps) => {
    // Ensure cps is always an array
    const safeCPs = Array.isArray(cps) ? cps : []
    console.log('🟢 [CP_STORE] setCPs called with', safeCPs.length, 'concept practices')
    const currentCPs = get().cps
    
    // Only update if data actually changed
    if (JSON.stringify(currentCPs) !== JSON.stringify(safeCPs)) {
      console.log('🟢 [CP_STORE] CPs data changed, updating state')
      set({ cps: safeCPs })
      // Use setTimeout to prevent cascading updates
      setTimeout(() => {
        console.log('🟢 [CP_STORE] Applying filters after state update')
        get().filterCPs()
      }, 0)
    } else {
      console.log('🟢 [CP_STORE] CPs data unchanged, skipping update')
    }
  },

  addCP: (cp) => {
    console.log('🟢 [CP_STORE] addCP called for:', cp.id)
    const { cps } = get()
    const safeCPs = Array.isArray(cps) ? cps : []
    const updatedCPs = [cp, ...safeCPs]
    set({ cps: updatedCPs })
    get().filterCPs()
  },

  updateCP: (cpId, updates) => {
    console.log('🟢 [CP_STORE] updateCP called for:', cpId)
    const { cps } = get()
    const safeCPs = Array.isArray(cps) ? cps : []
    const updatedCPs = safeCPs.map(cp =>
      cp.id === cpId ? { ...cp, ...updates } : cp
    )
    set({ cps: updatedCPs })
    get().filterCPs()
    
    // Update selected CP if it's the one being updated
    const { selectedCP } = get()
    if (selectedCP && selectedCP.id === cpId) {
      set({ selectedCP: { ...selectedCP, ...updates } })
    }
  },

  removeCP: (cpId) => {
    console.log('🟢 [CP_STORE] removeCP called for:', cpId)
    const { cps, selectedCP } = get()
    const safeCPs = Array.isArray(cps) ? cps : []
    const updatedCPs = safeCPs.filter(cp => cp.id !== cpId)
    set({ cps: updatedCPs })
    
    // Use setTimeout to prevent cascading updates
    setTimeout(() => {
      console.log('🟢 [CP_STORE] Applying filters after CP removal')
      get().filterCPs()
    }, 0)
    
    // Clear selected CP if it's the one being removed
    if (selectedCP && selectedCP.id === cpId) {
      set({ selectedCP: null })
    }
    
    // Clear editing CP if it's the one being removed
    const { editingCPId } = get()
    if (editingCPId === cpId) {
      set({ editingCPId: null })
    }
  },

  setSelectedCP: (selectedCP) => set({ selectedCP }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterCPs()
  },

  setSelectedDifficulty: (selectedDifficulty) => {
    set({ selectedDifficulty })
    get().filterCPs()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterCPs()
  },

  filterCPs: () => {
    const { 
      cps, 
      searchTerm, 
      selectedDifficulty,
      activeTab 
    } = get()
    
    console.log('🟢 [CP_STORE] Filtering CPs with filters:', {
      searchTerm,
      selectedDifficulty,
      activeTab,
      total: cps.length
    })
    
    let filtered = Array.isArray(cps) ? [...cps] : []
    
    // Filter by tab
    if (activeTab !== "all") {
      const topicId = activeTab
      filtered = filtered.filter(cp => cp.topic_id === topicId)
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(cp => 
        (cp.title && cp.title.toLowerCase().includes(searchLower)) ||
        (cp.code && cp.code.toLowerCase().includes(searchLower)) ||
        (cp.explanation && cp.explanation.toLowerCase().includes(searchLower))
      )
    }
    
    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(cp => cp.difficulty === selectedDifficulty)
    }
    
    set({ filteredCPs: filtered })
  },

  resetFilters: () => {
    set({ 
      searchTerm: "",
      selectedDifficulty: "all",
      activeTab: "all"
    })
    get().filterCPs()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),
  
  toggleForm: (isFormOpen) => set({ isFormOpen }),
  
  setFormErrors: (formErrors) => set({ formErrors }),
  
  clearFormErrors: () => set({ formErrors: {} }),
  
  setEditingCPId: (editingCPId) => set({ editingCPId }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  // Helper Functions
  getCPById: (cpId) => {
    const { cps } = get()
    const safeCPs = Array.isArray(cps) ? cps : []
    return safeCPs.find(cp => cp.id === cpId) || null
  },
  
  getCPsByTopic: (topicId) => {
    const { cps } = get()
    const safeCPs = Array.isArray(cps) ? cps : []
    return safeCPs.filter(cp => cp.topic_id === topicId)
  }
}))

// Export selectors for common use cases
export const useFilteredCPs = () => useCPsStore(state => state.filteredCPs)
export const useCPsLoading = () => useCPsStore(state => state.isLoading)
export const useCPsError = () => useCPsStore(state => state.error)
export const useSelectedCP = () => useCPsStore(state => state.selectedCP)
export const useCPsFormState = () => useCPsStore(state => ({
  formMode: state.formMode,
  isFormOpen: state.isFormOpen,
  formErrors: state.formErrors,
  isSubmitting: state.isSubmitting,
  editingCPId: state.editingCPId,
  setFormMode: state.setFormMode,
  toggleForm: state.toggleForm,
  setFormErrors: state.setFormErrors,
  clearFormErrors: state.clearFormErrors,
  setEditingCPId: state.setEditingCPId,
  setSubmitting: state.setSubmitting
})) 
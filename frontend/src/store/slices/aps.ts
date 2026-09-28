import { create } from 'zustand'
import { AP } from '@/lib/api/aps'

// Form modes for AP management
export type FormMode = 'create' | 'edit' | 'view'

interface APsState {
  // Data
  aps: AP[]
  filteredAPs: AP[]
  selectedAP: AP | null
  
  // Filters
  searchTerm: string
  selectedDifficulty: string
  activeTab: string
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingAPId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setAPs: (aps: AP[]) => void
  addAP: (ap: AP) => void
  updateAP: (apId: string, updates: Partial<AP>) => void
  removeAP: (apId: string) => void
  setSelectedAP: (ap: AP | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setSelectedDifficulty: (difficulty: string) => void
  setActiveTab: (tab: string) => void
  filterAPs: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingAPId: (apId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getAPById: (apId: string) => AP | null
  getAPsByTopic: (topicId: string) => AP[]
}

export const useAPsStore = create<APsState>((set, get) => ({
  // Initial state
  aps: [],
  filteredAPs: [],
  selectedAP: null,
  searchTerm: "",
  selectedDifficulty: "all",
  activeTab: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingAPId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setAPs: (aps) => {
    // Ensure aps is always an array
    const safeAPs = Array.isArray(aps) ? aps : []
    console.log('🟢 [AP_STORE] setAPs called with', safeAPs.length, 'application problems')
    const currentAPs = get().aps
    
    // Only update if data actually changed
    if (JSON.stringify(currentAPs) !== JSON.stringify(safeAPs)) {
      console.log('🟢 [AP_STORE] APs data changed, updating state')
      set({ aps: safeAPs })
      // Use setTimeout to prevent cascading updates
      setTimeout(() => {
        console.log('🟢 [AP_STORE] Applying filters after state update')
        get().filterAPs()
      }, 0)
    } else {
      console.log('🟢 [AP_STORE] APs data unchanged, skipping update')
    }
  },

  addAP: (ap) => {
    console.log('🟢 [AP_STORE] addAP called for:', ap.id)
    const { aps } = get()
    const safeAPs = Array.isArray(aps) ? aps : []
    const updatedAPs = [ap, ...safeAPs]
    set({ aps: updatedAPs })
    get().filterAPs()
  },

  updateAP: (apId, updates) => {
    console.log('🟢 [AP_STORE] updateAP called for:', apId)
    const { aps } = get()
    const safeAPs = Array.isArray(aps) ? aps : []
    const updatedAPs = safeAPs.map(ap =>
      ap.id === apId ? { ...ap, ...updates } : ap
    )
    set({ aps: updatedAPs })
    get().filterAPs()
    
    // Update selected AP if it's the one being updated
    const { selectedAP } = get()
    if (selectedAP && selectedAP.id === apId) {
      set({ selectedAP: { ...selectedAP, ...updates } })
    }
  },

  removeAP: (apId) => {
    console.log('🟢 [AP_STORE] removeAP called for:', apId)
    const { aps, selectedAP } = get()
    const safeAPs = Array.isArray(aps) ? aps : []
    const updatedAPs = safeAPs.filter(ap => ap.id !== apId)
    set({ aps: updatedAPs })
    
    // Use setTimeout to prevent cascading updates
    setTimeout(() => {
      console.log('🟢 [AP_STORE] Applying filters after AP removal')
      get().filterAPs()
    }, 0)
    
    // Clear selected AP if it's the one being removed
    if (selectedAP && selectedAP.id === apId) {
      set({ selectedAP: null })
    }
    
    // Clear editing AP if it's the one being removed
    const { editingAPId } = get()
    if (editingAPId === apId) {
      set({ editingAPId: null })
    }
  },

  setSelectedAP: (selectedAP) => set({ selectedAP }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterAPs()
  },

  setSelectedDifficulty: (selectedDifficulty) => {
    set({ selectedDifficulty })
    get().filterAPs()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterAPs()
  },

  filterAPs: () => {
    const { 
      aps, 
      searchTerm, 
      selectedDifficulty,
      activeTab 
    } = get()
    
    console.log('🟢 [AP_STORE] Filtering APs with filters:', {
      searchTerm,
      selectedDifficulty,
      activeTab,
      total: aps.length
    })
    
    let filtered = Array.isArray(aps) ? [...aps] : []
    
    // Filter by tab
    if (activeTab !== "all") {
      const topicId = activeTab
      filtered = filtered.filter(ap => ap.topic_id === topicId)
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(ap => 
        (ap.title && ap.title.toLowerCase().includes(searchLower)) ||
        (ap.instruction && ap.instruction.toLowerCase().includes(searchLower)) ||
        (ap.objective && ap.objective.toLowerCase().includes(searchLower))
      )
    }
    
    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(ap => ap.difficulty === selectedDifficulty)
    }
    
    set({ filteredAPs: filtered })
  },

  resetFilters: () => {
    set({ 
      searchTerm: "",
      selectedDifficulty: "all",
      activeTab: "all"
    })
    get().filterAPs()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),
  
  toggleForm: (isFormOpen) => set({ isFormOpen }),
  
  setFormErrors: (formErrors) => set({ formErrors }),
  
  clearFormErrors: () => set({ formErrors: {} }),
  
  setEditingAPId: (editingAPId) => set({ editingAPId }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  // Helper Functions
  getAPById: (apId) => {
    const { aps } = get()
    const safeAPs = Array.isArray(aps) ? aps : []
    return safeAPs.find(ap => ap.id === apId) || null
  },
  
  getAPsByTopic: (topicId) => {
    const { aps } = get()
    const safeAPs = Array.isArray(aps) ? aps : []
    return safeAPs.filter(ap => ap.topic_id === topicId)
  }
}))

// Export selectors for common use cases
export const useFilteredAPs = () => useAPsStore(state => state.filteredAPs)
export const useAPsLoading = () => useAPsStore(state => state.isLoading)
export const useAPsError = () => useAPsStore(state => state.error)
export const useSelectedAP = () => useAPsStore(state => state.selectedAP)
export const useAPsFormState = () => useAPsStore(state => ({
  formMode: state.formMode,
  isFormOpen: state.isFormOpen,
  formErrors: state.formErrors,
  isSubmitting: state.isSubmitting,
  editingAPId: state.editingAPId,
  setFormMode: state.setFormMode,
  toggleForm: state.toggleForm,
  setFormErrors: state.setFormErrors,
  clearFormErrors: state.clearFormErrors,
  setEditingAPId: state.setEditingAPId,
  setSubmitting: state.setSubmitting
})) 
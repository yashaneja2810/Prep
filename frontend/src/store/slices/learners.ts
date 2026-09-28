import { create } from 'zustand'
import { LearnerProfile } from '@/lib/types/learner'

// Form modes for learner profile management
export type FormMode = 'create' | 'edit' | 'view'

// Filter options for UI (includes 'all' for filtering). We now use 'inactive' instead of legacy dropout/graduate values
export type StatusFilter = 'all' | 'active' | 'inactive'
export type TypeFilter = 'all' | LearnerProfile['learner_type']

interface LearnersState {
  // Data
  learners: LearnerProfile[]
  filteredLearners: LearnerProfile[]
  selectedLearner: LearnerProfile | null
  
  // Filters
  searchTerm: string
  statusFilter: StatusFilter
  learnerTypeFilter: TypeFilter
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingLearnerId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setLearners: (learners: LearnerProfile[]) => void
  addLearner: (learner: LearnerProfile) => void
  updateLearner: (learnerId: string, updates: Partial<LearnerProfile>) => void
  removeLearner: (learnerId: string) => void
  setSelectedLearner: (learner: LearnerProfile | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: StatusFilter) => void
  setLearnerTypeFilter: (type: TypeFilter) => void
  filterLearners: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingLearnerId: (learnerId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getLearnerById: (learnerId: string) => LearnerProfile | null
}

export const useLearnersStore = create<LearnersState>((set, get) => ({
  // Initial state
  learners: [],
  filteredLearners: [],
  selectedLearner: null,
  searchTerm: "",
  statusFilter: "all",
  learnerTypeFilter: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingLearnerId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setLearners: (learners) => {
    console.log('🟢 [LEARNERS_STORE] setLearners called with', learners.length, 'learners')
    const currentLearners = get().learners
    
    // Only update if data actually changed
    if (JSON.stringify(currentLearners) !== JSON.stringify(learners)) {
      console.log('🟢 [LEARNERS_STORE] Learners data changed, updating state')
      set({ learners })
      // Use setTimeout to prevent cascading updates
      setTimeout(() => {
        console.log('🟢 [LEARNERS_STORE] Applying filters after state update')
        get().filterLearners()
      }, 0)
    } else {
      console.log('🟢 [LEARNERS_STORE] Learners data unchanged, skipping update')
    }
  },

  addLearner: (learner) => {
    console.log('🟢 [LEARNERS_STORE] addLearner called for:', learner.id)
    const { learners } = get()
    const updatedLearners = [learner, ...learners]
    set({ learners: updatedLearners })
    get().filterLearners()
  },

  updateLearner: (learnerId, updates) => {
    console.log('🟢 [LEARNERS_STORE] updateLearner called for:', learnerId)
    const { learners } = get()
    const updatedLearners = learners.map(learner =>
      learner.id === learnerId ? { ...learner, ...updates } : learner
    )
    set({ learners: updatedLearners })
    get().filterLearners()
    
    // Update selected learner if it's the one being updated
    const { selectedLearner } = get()
    if (selectedLearner && selectedLearner.id === learnerId) {
      set({ selectedLearner: { ...selectedLearner, ...updates } })
    }
  },

  removeLearner: (learnerId) => {
    console.log('🟢 [LEARNERS_STORE] removeLearner called for:', learnerId)
    const { learners, selectedLearner } = get()
    const updatedLearners = learners.filter(learner => learner.id !== learnerId)
    set({ learners: updatedLearners })
    
    // Use setTimeout to prevent cascading updates
    setTimeout(() => {
      console.log('🟢 [LEARNERS_STORE] Applying filters after learner removal')
      get().filterLearners()
    }, 0)
    
    // Clear selected learner if it's the one being removed
    if (selectedLearner && selectedLearner.id === learnerId) {
      set({ selectedLearner: null })
    }
    
    // Clear editing learner if it's the one being removed
    const { editingLearnerId } = get()
    if (editingLearnerId === learnerId) {
      set({ editingLearnerId: null })
    }
  },

  setSelectedLearner: (selectedLearner) => set({ selectedLearner }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterLearners()
  },

  setStatusFilter: (statusFilter) => {
    set({ statusFilter })
    get().filterLearners()
  },

  setLearnerTypeFilter: (learnerTypeFilter) => {
    set({ learnerTypeFilter })
    get().filterLearners()
  },

  filterLearners: () => {
    console.log('🟢 [LEARNERS_STORE] filterLearners called')
    const { learners, searchTerm, statusFilter, learnerTypeFilter } = get()
    
    let filtered = [...learners]
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(learner => {
        // Safely access user properties with null checks - using 'users' field from API
        const firstName = learner.users?.first_name?.toLowerCase() || learner.user?.first_name?.toLowerCase() || ''
        const lastName = learner.users?.last_name?.toLowerCase() || learner.user?.last_name?.toLowerCase() || ''
        const email = learner.users?.email?.toLowerCase() || learner.user?.email?.toLowerCase() || ''
        const goals = learner.goals_text?.toLowerCase() || ''
        
        return firstName.includes(searchLower) ||
               lastName.includes(searchLower) ||
               email.includes(searchLower) ||
               goals.includes(searchLower)
      })
    }
    
    // Apply status filter (active / inactive)
    if (statusFilter !== 'all') {
      const isActiveFn = (lr: LearnerProfile) => {
        const flag = (lr as any).is_active ?? lr.users?.is_active;
        return flag === true;
      };
      if (statusFilter === 'active') {
        filtered = filtered.filter(isActiveFn);
      } else {
        // inactive
        filtered = filtered.filter((lr) => !isActiveFn(lr));
      }
    }
    
    // Apply learner type filter
    if (learnerTypeFilter !== 'all') {
      filtered = filtered.filter(learner => learner.learner_type === learnerTypeFilter)
    }
    
    console.log('🟢 [LEARNERS_STORE] Filtered', filtered.length, 'learners from', learners.length, 'total')
    set({ filteredLearners: filtered })
  },

  resetFilters: () => {
    console.log('🟢 [LEARNERS_STORE] resetFilters called')
    set({
      searchTerm: "",
      statusFilter: "all",
      learnerTypeFilter: "all"
    })
    get().filterLearners()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),

  toggleForm: (isFormOpen) => {
    set({ isFormOpen })
    if (!isFormOpen) {
      // Clear form state when closing
      set({
        formErrors: {},
        editingLearnerId: null,
        formMode: "create"
      })
    }
  },

  setFormErrors: (formErrors) => set({ formErrors }),

  clearFormErrors: () => set({ formErrors: {} }),

  setEditingLearnerId: (editingLearnerId) => set({ editingLearnerId }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Helper Functions
  getLearnerById: (learnerId) => {
    const { learners } = get()
    return learners.find(learner => learner.id === learnerId) || null
  }
})) 
import { create } from 'zustand'

// Speciality interface for the new API structure
export interface Speciality {
  id: number
  name: string
}

// Trainer Profile interface based on updated API response
export interface TrainerProfile {
  id: string
  user_id: string
  first_name?: string
  email?: string
  specialities: Speciality[]
  is_active: boolean
  total_years_teaching?: number
  bio?: string
  linkedin_url?: string
  expertise?: string
  profile_image?: string
  website?: string
  social_links?: Record<string, string>
}

// Extended trainer interface for UI display (combining profile with user data)
export interface ExtendedTrainer extends TrainerProfile {
  // User details (these would come from user data if available)
  name?: string
  phone?: string
  avatar?: string
  status?: 'active' | 'onleave' | 'former'
  rating?: number
  courses?: Array<{
    id: string
    name: string
    students: number
  }>
  availability?: string[]
}

// Form modes for trainer profile management
export type FormMode = 'create' | 'edit' | 'view'

interface TrainersState {
  // Data
  trainers: TrainerProfile[]
  filteredTrainers: TrainerProfile[]
  selectedTrainer: TrainerProfile | null
  
  // Filters
  searchTerm: string
  selectedStatus: string
  selectedSpecialty: string
  activeTab: string
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingProfileId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setTrainers: (trainers: TrainerProfile[]) => void
  addTrainer: (trainer: TrainerProfile) => void
  updateTrainer: (profileId: string, updates: Partial<TrainerProfile>) => void
  removeTrainer: (profileId: string) => void
  setSelectedTrainer: (trainer: TrainerProfile | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setSelectedStatus: (status: string) => void
  setSelectedSpecialty: (specialty: string) => void
  setActiveTab: (tab: string) => void
  filterTrainers: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingProfileId: (profileId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getTrainerByProfileId: (profileId: string) => TrainerProfile | null
}

export const useTrainersStore = create<TrainersState>((set, get) => ({
  // Initial state
  trainers: [],
  filteredTrainers: [],
  selectedTrainer: null,
  searchTerm: "",
  selectedStatus: "all",
  selectedSpecialty: "all",
  activeTab: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingProfileId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setTrainers: (trainers) => {
    // Ensure trainers is always an array
    const safeTrainers = Array.isArray(trainers) ? trainers : []
    console.log('🟢 [STORE] setTrainers called with', safeTrainers.length, 'trainers')
    
    if (safeTrainers.length > 0) {
      console.log('🟢 [STORE] Sample trainer data:', {
        first: {
          id: safeTrainers[0].id,
          is_active: safeTrainers[0].is_active,
          first_name: safeTrainers[0].first_name,
          email: safeTrainers[0].email,
          specialitiesCount: safeTrainers[0].specialities?.length || 0
        }
      })
    }
    
    const currentTrainers = get().trainers
    
    // Always update and filter if we have new data, even if JSON is same (to handle initial load)
    const isInitialLoad = currentTrainers.length === 0 && safeTrainers.length > 0
    const hasDataChanged = JSON.stringify(currentTrainers) !== JSON.stringify(safeTrainers)
    
    if (hasDataChanged || isInitialLoad) {
      console.log('🟢 [STORE] Trainers data changed, updating state and filtering')
      set({ trainers: safeTrainers })
      // Immediate filtering without setTimeout for initial load
      if (isInitialLoad) {
        console.log('🟢 [STORE] Initial load - filtering immediately')
        get().filterTrainers()
      } else {
        // Use setTimeout to prevent cascading updates for subsequent loads
        setTimeout(() => {
          console.log('🟢 [STORE] Applying filters after state update')
          get().filterTrainers()
        }, 0)
      }
    } else {
      console.log('🟢 [STORE] Trainers data unchanged, skipping update')
    }
  },

  addTrainer: (trainer) => {
    console.log('🟢 [STORE] addTrainer called for:', trainer.id)
    const { trainers } = get()
    const safeTrainers = Array.isArray(trainers) ? trainers : []
    const updatedTrainers = [trainer, ...safeTrainers]
    set({ trainers: updatedTrainers })
    get().filterTrainers()
  },

  updateTrainer: (profileId, updates) => {
    console.log('🟢 [STORE] updateTrainer called for:', profileId)
    const { trainers } = get()
    const safeTrainers = Array.isArray(trainers) ? trainers : []
    const updatedTrainers = safeTrainers.map(trainer =>
      trainer.id === profileId ? { ...trainer, ...updates } : trainer
    )
    set({ trainers: updatedTrainers })
    get().filterTrainers()
    
    // Update selected trainer if it's the one being updated
    const { selectedTrainer } = get()
    if (selectedTrainer && selectedTrainer.id === profileId) {
      set({ selectedTrainer: { ...selectedTrainer, ...updates } })
    }
  },

  removeTrainer: (profileId) => {
    console.log('🟢 [STORE] removeTrainer called for:', profileId)
    const { trainers, selectedTrainer } = get()
    const safeTrainers = Array.isArray(trainers) ? trainers : []
    const updatedTrainers = safeTrainers.filter(trainer => trainer.id !== profileId)
    set({ trainers: updatedTrainers })
    
    // Use setTimeout to prevent cascading updates
    setTimeout(() => {
      console.log('🟢 [STORE] Applying filters after trainer removal')
      get().filterTrainers()
    }, 0)
    
    // Clear selected trainer if it's the one being removed
    if (selectedTrainer && selectedTrainer.id === profileId) {
      set({ selectedTrainer: null })
    }
    
    // Clear editing profile if it's the one being removed
    const { editingProfileId } = get()
    if (editingProfileId === profileId) {
      set({ editingProfileId: null })
    }
  },

  setSelectedTrainer: (selectedTrainer) => set({ selectedTrainer }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterTrainers()
  },

  setSelectedStatus: (selectedStatus) => {
    set({ selectedStatus })
    get().filterTrainers()
  },

  setSelectedSpecialty: (selectedSpecialty) => {
    set({ selectedSpecialty })
    get().filterTrainers()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterTrainers()
  },

  filterTrainers: () => {
    console.log('🟡 [FILTER] filterTrainers called')
    const { trainers, searchTerm, selectedSpecialty, activeTab, filteredTrainers: currentFiltered } = get()
    
    // Ensure trainers is an array before filtering
    if (!Array.isArray(trainers)) {
      console.warn('🟡 [FILTER] trainers is not an array:', trainers)
      set({ filteredTrainers: [] })
      return
    }
    
    console.log('🟡 [FILTER] Filter state:', {
      trainersCount: trainers.length,
      searchTerm,
      selectedSpecialty,
      activeTab,
      sampleTrainer: trainers[0] ? {
        id: trainers[0].id,
        is_active: trainers[0].is_active,
        first_name: trainers[0].first_name,
        specialitiesCount: trainers[0].specialities?.length || 0
      } : 'NO_TRAINERS'
    })
    
    let filtered = trainers.filter(trainer => {
      // Filter by active tab (status)
      if (activeTab === 'active' && !trainer.is_active) return false
      if (activeTab === 'inactive' && trainer.is_active) return false
      // 'all' tab shows both active and inactive
      
      // Filter by search term (bio, expertise, specialities, name, email)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const specialitiesText = trainer.specialities.map(s => s.name).join(' ').toLowerCase()
        const matchesSearch = 
          trainer.bio?.toLowerCase().includes(searchLower) ||
          trainer.expertise?.toLowerCase().includes(searchLower) ||
          specialitiesText.includes(searchLower) ||
          trainer.first_name?.toLowerCase().includes(searchLower) ||
          trainer.email?.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }
      
      // Filter by specialty
      if (selectedSpecialty !== "all") {
        const hasSpecialty = trainer.specialities.some(spec => spec.name === selectedSpecialty)
        if (!hasSpecialty) return false
      }
      
      return true
    })
    
    console.log('🟡 [FILTER] Filter results:', {
      originalCount: trainers.length,
      filteredCount: filtered.length,
      activeTab,
      sampleFilteredTrainer: filtered[0] ? {
        id: filtered[0].id,
        is_active: filtered[0].is_active,
        first_name: filtered[0].first_name
      } : 'NO_FILTERED_TRAINERS'
    })
    
    // Only update if filtered results actually changed
    if (JSON.stringify(currentFiltered) !== JSON.stringify(filtered)) {
      console.log('🟡 [FILTER] Filtered results changed:', currentFiltered.length, '->', filtered.length)
      set({ filteredTrainers: filtered })
    } else {
      console.log('🟡 [FILTER] Filtered results unchanged, skipping update')
    }
  },

  resetFilters: () => {
    set({
      searchTerm: "",
      selectedStatus: "all",
      selectedSpecialty: "all",
      activeTab: "active"
    })
    get().filterTrainers()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),

  toggleForm: (isFormOpen) => set({ isFormOpen }),

  setFormErrors: (formErrors) => set({ formErrors }),

  clearFormErrors: () => set({ formErrors: {} }),

  setEditingProfileId: (editingProfileId) => set({ editingProfileId }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Helper Functions
  getTrainerByProfileId: (profileId) => {
    const { trainers } = get()
    const safeTrainers = Array.isArray(trainers) ? trainers : []
    return safeTrainers.find(trainer => trainer.id === profileId) || null
  }
})) 
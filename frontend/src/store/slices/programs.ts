import { create } from 'zustand'
import { Program } from '@/lib/api/programs'
import { Module } from '@/lib/api/modules'

// Extended program interface for UI display
export interface ExtendedProgram extends Program {
  // Additional UI-specific fields
  completion_percentage?: number
  total_modules?: number
  completed_modules?: number
  formatted_status?: string
  formatted_level?: string
}

// Form modes for program management
export type FormMode = 'create' | 'edit' | 'view'

interface ProgramsState {
  // Data
  programs: Program[]
  filteredPrograms: Program[]
  selectedProgram: Program | null
  
  // Filters
  searchTerm: string
  selectedStatus: string
  selectedLevel: string
  activeTab: string
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingProgramId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setPrograms: (programs: Program[]) => void
  addProgram: (program: Program) => void
  updateProgram: (programId: string, updates: Partial<Program>) => void
  removeProgram: (programId: string) => void
  setSelectedProgram: (program: Program | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setSelectedStatus: (status: string) => void
  setSelectedLevel: (level: string) => void
  setActiveTab: (tab: string) => void
  filterPrograms: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingProgramId: (programId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getProgramById: (programId: string) => Program | null
  getActivePrograms: () => Program[]
  getInactivePrograms: () => Program[]
  getProgramModules: (programId: string) => Module[]
  isProgramCompleted: (programId: string, completedModuleIds: string[]) => boolean
}

export const useProgramsStore = create<ProgramsState>((set, get) => ({
  // Initial state
  programs: [],
  filteredPrograms: [],
  selectedProgram: null,
  searchTerm: "",
  selectedStatus: "published",
  selectedLevel: "all",
  activeTab: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingProgramId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setPrograms: (programs) => {
    // Ensure programs is always an array
    const safePrograms = Array.isArray(programs) ? programs : []
    console.log('🟢 [PROGRAM_STORE] setPrograms called with', safePrograms.length, 'programs')
    const currentPrograms = get().programs
    
    // Only update if data actually changed
    if (JSON.stringify(currentPrograms) !== JSON.stringify(safePrograms)) {
      console.log('🟢 [PROGRAM_STORE] Programs data changed, updating state')
      set({ programs: safePrograms })
      // Use setTimeout to prevent cascading updates
      setTimeout(() => {
        console.log('🟢 [PROGRAM_STORE] Applying filters after state update')
        get().filterPrograms()
      }, 0)
    } else {
      console.log('🟢 [PROGRAM_STORE] Programs data unchanged, skipping update')
    }
  },

  addProgram: (program) => {
    console.log('🟢 [PROGRAM_STORE] addProgram called for:', program.id)
    const { programs } = get()
    const safePrograms = Array.isArray(programs) ? programs : []
    const updatedPrograms = [program, ...safePrograms]
    set({ programs: updatedPrograms })
    get().filterPrograms()
  },

  updateProgram: (programId, updates) => {
    console.log('🟢 [PROGRAM_STORE] updateProgram called for:', programId)
    const { programs } = get()
    const safePrograms = Array.isArray(programs) ? programs : []
    const updatedPrograms = safePrograms.map(prog =>
      prog.id === programId ? { ...prog, ...updates } : prog
    )
    set({ programs: updatedPrograms })
    get().filterPrograms()
    
    // Update selected program if it's the one being updated
    const { selectedProgram } = get()
    if (selectedProgram && selectedProgram.id === programId) {
      set({ selectedProgram: { ...selectedProgram, ...updates } })
    }
  },

  removeProgram: (programId) => {
    console.log('🟢 [PROGRAM_STORE] removeProgram called for:', programId)
    const { programs, selectedProgram } = get()
    const safePrograms = Array.isArray(programs) ? programs : []
    const updatedPrograms = safePrograms.filter(prog => prog.id !== programId)
    set({ programs: updatedPrograms })
    
    // Use setTimeout to prevent cascading updates
    setTimeout(() => {
      console.log('🟢 [PROGRAM_STORE] Applying filters after program removal')
      get().filterPrograms()
    }, 0)
    
    // Clear selected program if it's the one being removed
    if (selectedProgram && selectedProgram.id === programId) {
      set({ selectedProgram: null })
    }
    
    // Clear editing program if it's the one being removed
    const { editingProgramId } = get()
    if (editingProgramId === programId) {
      set({ editingProgramId: null })
    }
  },

  setSelectedProgram: (selectedProgram) => set({ selectedProgram }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterPrograms()
  },

  setSelectedStatus: (selectedStatus) => {
    set({ selectedStatus })
    get().filterPrograms()
  },

  setSelectedLevel: (selectedLevel) => {
    set({ selectedLevel })
    get().filterPrograms()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterPrograms()
  },

  filterPrograms: () => {
    const { 
      programs, 
      searchTerm, 
      selectedStatus, 
      selectedLevel,
      activeTab 
    } = get()
    
    if (!Array.isArray(programs)) {
      set({ filteredPrograms: [] })
      return
    }
    
    let filtered = [...programs]
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(prog => 
        prog.title?.toLowerCase().includes(search) ||
        prog.program_code?.toLowerCase().includes(search) ||
        prog.description?.toLowerCase().includes(search) ||
        prog.prerequisites?.toLowerCase().includes(search)
      )
    }
    
    // Filter by status
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter(prog => prog.status === selectedStatus)
    }
    
    // Filter by level
    if (selectedLevel && selectedLevel !== 'all') {
      filtered = filtered.filter(prog => prog.level === selectedLevel)
    }
    
    // Filter by active tab
    if (activeTab === 'published') {
      filtered = filtered.filter(prog => prog.status === 'published')
    } else if (activeTab === 'draft') {
      filtered = filtered.filter(prog => prog.status === 'draft')
    } else if (activeTab === 'archived') {
      filtered = filtered.filter(prog => prog.status === 'archived')
    }
    
    set({ filteredPrograms: filtered })
  },

  resetFilters: () => {
    set({
      searchTerm: '',
      selectedStatus: 'published',
      selectedLevel: 'all',
      activeTab: 'all'
    })
    get().filterPrograms()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),
  
  toggleForm: (open) => set({ isFormOpen: open }),
  
  setFormErrors: (formErrors) => set({ formErrors }),
  
  clearFormErrors: () => set({ formErrors: {} }),
  
  setEditingProgramId: (editingProgramId) => set({ editingProgramId }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // Helper Functions
  getProgramById: (programId) => {
    const { programs } = get()
    if (!Array.isArray(programs)) return null
    return programs.find(prog => prog.id === programId) || null
  },
  
  getActivePrograms: () => {
    const { programs } = get()
    if (!Array.isArray(programs)) return []
    return programs.filter(prog => prog.status === 'published')
  },
  
  getInactivePrograms: () => {
    const { programs } = get()
    if (!Array.isArray(programs)) return []
    return programs.filter(prog => prog.status !== 'published')
  },
  
  getProgramModules: (programId) => {
    const program = get().getProgramById(programId)
    return program?.modules || []
  },
  
  isProgramCompleted: (programId, completedModuleIds) => {
    const program = get().getProgramById(programId)
    if (!program || !program.modules || program.modules.length === 0) {
      return false
    }
    
    return program.modules.every(module => 
      completedModuleIds.includes(module.id)
    )
  }
}))

// Selector exports
export const useFilteredPrograms = () => useProgramsStore(state => state.filteredPrograms)
export const useProgramsLoading = () => useProgramsStore(state => state.isLoading)
export const useProgramsError = () => useProgramsStore(state => state.error)
export const useSelectedProgram = () => useProgramsStore(state => state.selectedProgram)
export const useProgramsFormState = () => useProgramsStore(state => ({
  formMode: state.formMode,
  isFormOpen: state.isFormOpen,
  formErrors: state.formErrors,
  editingProgramId: state.editingProgramId,
  isSubmitting: state.isSubmitting,
  setFormMode: state.setFormMode,
  toggleForm: state.toggleForm,
  setFormErrors: state.setFormErrors,
  clearFormErrors: state.clearFormErrors,
  setEditingProgramId: state.setEditingProgramId,
  setSubmitting: state.setSubmitting
})) 
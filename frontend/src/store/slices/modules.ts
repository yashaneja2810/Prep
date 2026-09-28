import { create } from 'zustand'
import { Module, ModuleTopic } from '@/lib/api/modules'

// Extended module interface for UI display
export interface ExtendedModule extends Module {
  // Additional UI-specific fields
  completion_percentage?: number
  total_topics?: number
  completed_topics?: number
  formatted_status?: string
}

// Form modes for module management
export type FormMode = 'create' | 'edit' | 'view'

interface ModulesState {
  // Data
  modules: Module[]
  filteredModules: Module[]
  selectedModule: Module | null
  
  // Filters
  searchTerm: string
  selectedStatus: string
  activeTab: string
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingModuleId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setModules: (modules: Module[]) => void
  addModule: (module: Module) => void
  updateModule: (moduleId: string, updates: Partial<Module>) => void
  removeModule: (moduleId: string) => void
  setSelectedModule: (module: Module | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setSelectedStatus: (status: string) => void
  setActiveTab: (tab: string) => void
  filterModules: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingModuleId: (moduleId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getModuleById: (moduleId: string) => Module | null
  getActiveModules: () => Module[]
  getInactiveModules: () => Module[]
  getModuleTopics: (moduleId: string) => ModuleTopic[]
  isModuleCompleted: (moduleId: string, completedTopicIds: string[]) => boolean
}

export const useModulesStore = create<ModulesState>((set, get) => ({
  // Initial state
  modules: [],
  filteredModules: [],
  selectedModule: null,
  searchTerm: "",
  selectedStatus: "published",
  activeTab: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingModuleId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setModules: (modules) => {
    // Ensure modules is always an array
    const safeModules = Array.isArray(modules) ? modules : []
    console.log('🟢 [MODULE_STORE] setModules called with', safeModules.length, 'modules')
    const currentModules = get().modules
    
    // Only update if data actually changed
    if (JSON.stringify(currentModules) !== JSON.stringify(safeModules)) {
      console.log('🟢 [MODULE_STORE] Modules data changed, updating state')
      set({ modules: safeModules })
      // Use setTimeout to prevent cascading updates
      setTimeout(() => {
        console.log('🟢 [MODULE_STORE] Applying filters after state update')
        get().filterModules()
      }, 0)
    } else {
      console.log('🟢 [MODULE_STORE] Modules data unchanged, skipping update')
    }
  },

  addModule: (module) => {
    console.log('🟢 [MODULE_STORE] addModule called for:', module.id)
    const { modules } = get()
    const safeModules = Array.isArray(modules) ? modules : []
    const updatedModules = [module, ...safeModules]
    set({ modules: updatedModules })
    get().filterModules()
  },

  updateModule: (moduleId, updates) => {
    console.log('🟢 [MODULE_STORE] updateModule called for:', moduleId)
    const { modules } = get()
    const safeModules = Array.isArray(modules) ? modules : []
    const updatedModules = safeModules.map(mod =>
      mod.id === moduleId ? { ...mod, ...updates } : mod
    )
    set({ modules: updatedModules })
    get().filterModules()
    
    // Update selected module if it's the one being updated
    const { selectedModule } = get()
    if (selectedModule && selectedModule.id === moduleId) {
      set({ selectedModule: { ...selectedModule, ...updates } })
    }
  },

  removeModule: (moduleId) => {
    console.log('🟢 [MODULE_STORE] removeModule called for:', moduleId)
    const { modules, selectedModule } = get()
    const safeModules = Array.isArray(modules) ? modules : []
    const updatedModules = safeModules.filter(mod => mod.id !== moduleId)
    set({ modules: updatedModules })
    
    // Use setTimeout to prevent cascading updates
    setTimeout(() => {
      console.log('🟢 [MODULE_STORE] Applying filters after module removal')
      get().filterModules()
    }, 0)
    
    // Clear selected module if it's the one being removed
    if (selectedModule && selectedModule.id === moduleId) {
      set({ selectedModule: null })
    }
    
    // Clear editing module if it's the one being removed
    const { editingModuleId } = get()
    if (editingModuleId === moduleId) {
      set({ editingModuleId: null })
    }
  },

  setSelectedModule: (selectedModule) => set({ selectedModule }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterModules()
  },

  setSelectedStatus: (selectedStatus) => {
    set({ selectedStatus })
    get().filterModules()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterModules()
  },

  filterModules: () => {
    const { 
      modules, 
      searchTerm, 
      selectedStatus, 
      activeTab 
    } = get()
    
    if (!Array.isArray(modules)) {
      set({ filteredModules: [] })
      return
    }
    
    let filtered = [...modules]
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(mod => 
        mod.module_title?.toLowerCase().includes(search) ||
        mod.module_name?.toLowerCase().includes(search) ||
        mod.module_code?.toLowerCase().includes(search) ||
        mod.description?.toLowerCase().includes(search)
      )
    }
    
    // Filter by status
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter(mod => mod.status === selectedStatus)
    }
    
    // Filter by active tab
    if (activeTab === 'published') {
      filtered = filtered.filter(mod => mod.status === 'published')
    } else if (activeTab === 'draft') {
      filtered = filtered.filter(mod => mod.status === 'draft')
    } else if (activeTab === 'archived') {
      filtered = filtered.filter(mod => mod.status === 'archived')
    }
    
    set({ filteredModules: filtered })
  },

  resetFilters: () => {
    set({
      searchTerm: '',
      selectedStatus: 'published',
      activeTab: 'all'
    })
    get().filterModules()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),
  
  toggleForm: (open) => set({ isFormOpen: open }),
  
  setFormErrors: (formErrors) => set({ formErrors }),
  
  clearFormErrors: () => set({ formErrors: {} }),
  
  setEditingModuleId: (editingModuleId) => set({ editingModuleId }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // Helper Functions
  getModuleById: (moduleId) => {
    const { modules } = get()
    if (!Array.isArray(modules)) return null
    return modules.find(mod => mod.id === moduleId) || null
  },
  
  getActiveModules: () => {
    const { modules } = get()
    if (!Array.isArray(modules)) return []
    return modules.filter(mod => mod.status === 'published')
  },
  
  getInactiveModules: () => {
    const { modules } = get()
    if (!Array.isArray(modules)) return []
    return modules.filter(mod => mod.status !== 'published')
  },
  
  getModuleTopics: (moduleId) => {
    const module = get().getModuleById(moduleId)
    return module?.topics || []
  },
  
  isModuleCompleted: (moduleId, completedTopicIds) => {
    const module = get().getModuleById(moduleId)
    if (!module || !module.topics || module.topics.length === 0) {
      return false
    }
    
    return module.topics.every(topic => 
      completedTopicIds.includes(topic.topic_id)
    )
  }
}))

// Selector exports
export const useFilteredModules = () => useModulesStore(state => state.filteredModules)
export const useModulesLoading = () => useModulesStore(state => state.isLoading)
export const useModulesError = () => useModulesStore(state => state.error)
export const useSelectedModule = () => useModulesStore(state => state.selectedModule)
export const useModulesFormState = () => useModulesStore(state => ({
  formMode: state.formMode,
  isFormOpen: state.isFormOpen,
  formErrors: state.formErrors,
  editingModuleId: state.editingModuleId,
  isSubmitting: state.isSubmitting,
  setFormMode: state.setFormMode,
  toggleForm: state.toggleForm,
  setFormErrors: state.setFormErrors,
  clearFormErrors: state.clearFormErrors,
  setEditingModuleId: state.setEditingModuleId,
  setSubmitting: state.setSubmitting
})) 
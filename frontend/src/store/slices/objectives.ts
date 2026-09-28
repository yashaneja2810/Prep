import { create } from 'zustand'
import { ObjectiveResponse, ObjectiveHeading, ObjectiveItem } from '@/lib/api/objectives'

// Form modes for objective management
export type FormMode = 'create' | 'edit' | 'view'

interface ObjectivesState {
  // Data
  objectives: ObjectiveResponse[] | null
  selectedObjective: ObjectiveResponse | null
  
  // Filters
  searchTerm: string
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingObjectiveId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setObjectives: (objectives: ObjectiveResponse[] | null) => void
  addObjective: (objective: ObjectiveResponse) => void
  updateObjective: (objectiveId: string, updates: Partial<ObjectiveResponse>) => void
  removeObjective: (objectiveId: string) => void
  setSelectedObjective: (objective: ObjectiveResponse | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingObjectiveId: (objectiveId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getObjectiveById: (objectiveId: string) => ObjectiveResponse | null
  getHeadingById: (headingId: string) => ObjectiveHeading | null
  getItemById: (itemId: string) => ObjectiveItem | null
  addHeadingToObjective: (objectiveId: string, heading: ObjectiveHeading) => void
  updateHeadingInObjective: (headingId: string, updates: Partial<ObjectiveHeading>) => void
  removeHeadingFromObjective: (headingId: string) => void
  addItemToHeading: (headingId: string, item: ObjectiveItem) => void
  updateItemInHeading: (itemId: string, updates: Partial<ObjectiveItem>) => void
  removeItemFromHeading: (itemId: string) => void
}

export const useObjectivesStore = create<ObjectivesState>((set, get) => ({
  // Initial state
  objectives: null,
  selectedObjective: null,
  searchTerm: "",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingObjectiveId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setObjectives: (objectives) => {
    console.log('🟢 [OBJ_STORE] setObjectives called with', objectives?.length || 0, 'objectives')
    set({ objectives })
  },

  addObjective: (objective) => {
    console.log('🟢 [OBJ_STORE] addObjective called for:', objective.id)
    const { objectives } = get()
    const updatedObjectives = objectives ? [objective, ...objectives] : [objective]
    set({ objectives: updatedObjectives })
  },

  updateObjective: (objectiveId, updates) => {
    console.log('🟢 [OBJ_STORE] updateObjective called for:', objectiveId)
    const { objectives } = get()
    
    if (!objectives) return
    
    const updatedObjectives = objectives.map(obj =>
      obj.id === objectiveId ? { ...obj, ...updates } : obj
    )
    set({ objectives: updatedObjectives })
    
    // Update selected objective if it's the one being updated
    const { selectedObjective } = get()
    if (selectedObjective && selectedObjective.id === objectiveId) {
      set({ selectedObjective: { ...selectedObjective, ...updates } })
    }
  },

  removeObjective: (objectiveId) => {
    console.log('🟢 [OBJ_STORE] removeObjective called for:', objectiveId)
    const { objectives, selectedObjective } = get()
    
    if (!objectives) return
    
    const updatedObjectives = objectives.filter(obj => obj.id !== objectiveId)
    set({ objectives: updatedObjectives })
    
    // Clear selected objective if it's the one being removed
    if (selectedObjective && selectedObjective.id === objectiveId) {
      set({ selectedObjective: null })
    }
    
    // Clear editing objective if it's the one being removed
    const { editingObjectiveId } = get()
    if (editingObjectiveId === objectiveId) {
      set({ editingObjectiveId: null })
    }
  },

  setSelectedObjective: (selectedObjective) => set({ selectedObjective }),

  // Filter Actions
  setSearchTerm: (searchTerm) => set({ searchTerm }),

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),
  
  toggleForm: (isFormOpen) => set({ isFormOpen }),
  
  setFormErrors: (formErrors) => set({ formErrors }),
  
  clearFormErrors: () => set({ formErrors: {} }),
  
  setEditingObjectiveId: (editingObjectiveId) => set({ editingObjectiveId }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  // Helper Functions
  getObjectiveById: (objectiveId) => {
    const { objectives } = get()
    if (!objectives) return null
    return objectives.find(obj => obj.id === objectiveId) || null
  },
  
  getHeadingById: (headingId) => {
    const { objectives } = get()
    if (!objectives) return null
    
    for (const objective of objectives) {
      const heading = objective.headings.find(h => h.id === headingId)
      if (heading) return heading
    }
    
    return null
  },
  
  getItemById: (itemId) => {
    const { objectives } = get()
    if (!objectives) return null
    
    for (const objective of objectives) {
      for (const heading of objective.headings) {
        const item = heading.items.find(i => i.id === itemId)
        if (item) return item
      }
    }
    
    return null
  },
  
  addHeadingToObjective: (objectiveId, heading) => {
    console.log('🟢 [OBJ_STORE] addHeadingToObjective called for objective:', objectiveId)
    const { objectives } = get()
    
    if (!objectives) return
    
    const updatedObjectives = objectives.map(obj => {
      if (obj.id === objectiveId) {
        return {
          ...obj,
          headings: [...obj.headings, heading]
        }
      }
      return obj
    })
    
    set({ objectives: updatedObjectives })
    
    // Update selected objective if it's the one being modified
    const { selectedObjective } = get()
    if (selectedObjective && selectedObjective.id === objectiveId) {
      set({
        selectedObjective: {
          ...selectedObjective,
          headings: [...selectedObjective.headings, heading]
        }
      })
    }
  },
  
  updateHeadingInObjective: (headingId, updates) => {
    console.log('🟢 [OBJ_STORE] updateHeadingInObjective called for heading:', headingId)
    const { objectives } = get()
    
    if (!objectives) return
    
    const updatedObjectives = objectives.map(obj => {
      const headingIndex = obj.headings.findIndex(h => h.id === headingId)
      
      if (headingIndex !== -1) {
        const updatedHeadings = [...obj.headings]
        updatedHeadings[headingIndex] = {
          ...updatedHeadings[headingIndex],
          ...updates
        }
        
        return {
          ...obj,
          headings: updatedHeadings
        }
      }
      
      return obj
    })
    
    set({ objectives: updatedObjectives })
    
    // Update selected objective if it contains the heading
    const { selectedObjective } = get()
    if (selectedObjective) {
      const headingIndex = selectedObjective.headings.findIndex(h => h.id === headingId)
      
      if (headingIndex !== -1) {
        const updatedHeadings = [...selectedObjective.headings]
        updatedHeadings[headingIndex] = {
          ...updatedHeadings[headingIndex],
          ...updates
        }
        
        set({
          selectedObjective: {
            ...selectedObjective,
            headings: updatedHeadings
          }
        })
      }
    }
  },
  
  removeHeadingFromObjective: (headingId) => {
    console.log('🟢 [OBJ_STORE] removeHeadingFromObjective called for heading:', headingId)
    const { objectives } = get()
    
    if (!objectives) return
    
    const updatedObjectives = objectives.map(obj => {
      const headingIndex = obj.headings.findIndex(h => h.id === headingId)
      
      if (headingIndex !== -1) {
        const updatedHeadings = obj.headings.filter(h => h.id !== headingId)
        
        return {
          ...obj,
          headings: updatedHeadings
        }
      }
      
      return obj
    })
    
    set({ objectives: updatedObjectives })
    
    // Update selected objective if it contains the heading
    const { selectedObjective } = get()
    if (selectedObjective) {
      const headingIndex = selectedObjective.headings.findIndex(h => h.id === headingId)
      
      if (headingIndex !== -1) {
        const updatedHeadings = selectedObjective.headings.filter(h => h.id !== headingId)
        
        set({
          selectedObjective: {
            ...selectedObjective,
            headings: updatedHeadings
          }
        })
      }
    }
  },
  
  addItemToHeading: (headingId, item) => {
    console.log('🟢 [OBJ_STORE] addItemToHeading called for heading:', headingId)
    const { objectives } = get()
    
    if (!objectives) return
    
    const updatedObjectives = objectives.map(obj => {
      const headingIndex = obj.headings.findIndex(h => h.id === headingId)
      
      if (headingIndex !== -1) {
        const updatedHeadings = [...obj.headings]
        updatedHeadings[headingIndex] = {
          ...updatedHeadings[headingIndex],
          items: [...updatedHeadings[headingIndex].items, item]
        }
        
        return {
          ...obj,
          headings: updatedHeadings
        }
      }
      
      return obj
    })
    
    set({ objectives: updatedObjectives })
    
    // Update selected objective if it contains the heading
    const { selectedObjective } = get()
    if (selectedObjective) {
      const headingIndex = selectedObjective.headings.findIndex(h => h.id === headingId)
      
      if (headingIndex !== -1) {
        const updatedHeadings = [...selectedObjective.headings]
        updatedHeadings[headingIndex] = {
          ...updatedHeadings[headingIndex],
          items: [...updatedHeadings[headingIndex].items, item]
        }
        
        set({
          selectedObjective: {
            ...selectedObjective,
            headings: updatedHeadings
          }
        })
      }
    }
  },
  
  updateItemInHeading: (itemId, updates) => {
    console.log('🟢 [OBJ_STORE] updateItemInHeading called for item:', itemId)
    const { objectives } = get()
    
    if (!objectives) return
    
    const updatedObjectives = objectives.map(obj => {
      let objectiveUpdated = false
      
      const updatedHeadings = obj.headings.map(heading => {
        const itemIndex = heading.items.findIndex(i => i.id === itemId)
        
        if (itemIndex !== -1) {
          objectiveUpdated = true
          const updatedItems = [...heading.items]
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            ...updates
          }
          
          return {
            ...heading,
            items: updatedItems
          }
        }
        
        return heading
      })
      
      if (objectiveUpdated) {
        return {
          ...obj,
          headings: updatedHeadings
        }
      }
      
      return obj
    })
    
    set({ objectives: updatedObjectives })
    
    // Update selected objective if it contains the item
    const { selectedObjective } = get()
    if (selectedObjective) {
      let objectiveUpdated = false
      
      const updatedHeadings = selectedObjective.headings.map(heading => {
        const itemIndex = heading.items.findIndex(i => i.id === itemId)
        
        if (itemIndex !== -1) {
          objectiveUpdated = true
          const updatedItems = [...heading.items]
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            ...updates
          }
          
          return {
            ...heading,
            items: updatedItems
          }
        }
        
        return heading
      })
      
      if (objectiveUpdated) {
        set({
          selectedObjective: {
            ...selectedObjective,
            headings: updatedHeadings
          }
        })
      }
    }
  },
  
  removeItemFromHeading: (itemId) => {
    console.log('🟢 [OBJ_STORE] removeItemFromHeading called for item:', itemId)
    const { objectives } = get()
    
    if (!objectives) return
    
    const updatedObjectives = objectives.map(obj => {
      let objectiveUpdated = false
      
      const updatedHeadings = obj.headings.map(heading => {
        const itemIndex = heading.items.findIndex(i => i.id === itemId)
        
        if (itemIndex !== -1) {
          objectiveUpdated = true
          return {
            ...heading,
            items: heading.items.filter(i => i.id !== itemId)
          }
        }
        
        return heading
      })
      
      if (objectiveUpdated) {
        return {
          ...obj,
          headings: updatedHeadings
        }
      }
      
      return obj
    })
    
    set({ objectives: updatedObjectives })
    
    // Update selected objective if it contains the item
    const { selectedObjective } = get()
    if (selectedObjective) {
      let objectiveUpdated = false
      
      const updatedHeadings = selectedObjective.headings.map(heading => {
        const itemIndex = heading.items.findIndex(i => i.id === itemId)
        
        if (itemIndex !== -1) {
          objectiveUpdated = true
          return {
            ...heading,
            items: heading.items.filter(i => i.id !== itemId)
          }
        }
        
        return heading
      })
      
      if (objectiveUpdated) {
        set({
          selectedObjective: {
            ...selectedObjective,
            headings: updatedHeadings
          }
        })
      }
    }
  }
}))

// Selector hooks for easy access to specific parts of the state
export const useSelectedObjective = () => useObjectivesStore(state => state.selectedObjective)
export const useObjectivesLoading = () => useObjectivesStore(state => state.isLoading)
export const useObjectivesError = () => useObjectivesStore(state => state.error)
export const useObjectivesFormState = () => useObjectivesStore(state => ({
  formMode: state.formMode,
  isFormOpen: state.isFormOpen,
  formErrors: state.formErrors,
  editingObjectiveId: state.editingObjectiveId,
  isSubmitting: state.isSubmitting,
  setFormMode: state.setFormMode,
  toggleForm: state.toggleForm,
  setFormErrors: state.setFormErrors,
  clearFormErrors: state.clearFormErrors,
  setEditingObjectiveId: state.setEditingObjectiveId,
  setSubmitting: state.setSubmitting
})) 
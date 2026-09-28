import { create } from 'zustand'
import { Note } from '@/lib/api/notes'

// Extended Note interface with UI-specific fields
export interface ExtendedNote extends Note {
  is_loading?: boolean
  is_error?: boolean
  error_message?: string
}

// Form mode type
export type FormMode = 'create' | 'edit' | 'view'

interface NotesState {
  // Data
  notes: ExtendedNote[]
  filteredNotes: ExtendedNote[]
  selectedNote: ExtendedNote | null
  
  // Filters
  searchTerm: string
  topicFilter: string | null
  activeTab: 'all' | 'recent' | 'favorites'
  
  // Form state
  formMode: FormMode
  isFormOpen: boolean
  formData: Partial<Note>
  formErrors: Record<string, string>
  editingNoteId: string | null
  isSubmitting: boolean
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (noteId: string, updates: Partial<Note>) => void
  removeNote: (noteId: string) => void
  setSelectedNote: (note: Note | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setTopicFilter: (topicId: string | null) => void
  setActiveTab: (tab: 'all' | 'recent' | 'favorites') => void
  filterNotes: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormData: (data: Partial<Note>) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearForm: () => void
  setEditingNoteId: (noteId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  // Initial state
  notes: [],
  filteredNotes: [],
  selectedNote: null,
  searchTerm: '',
  topicFilter: null,
  activeTab: 'all',
  formMode: 'view',
  isFormOpen: false,
  formData: {},
  formErrors: {},
  editingNoteId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setNotes: (notes) => {
    const safeNotes = Array.isArray(notes) ? notes : []
    console.log('🟢 [NOTE_STORE] setNotes called with', safeNotes.length, 'notes')
    
    set({ notes: safeNotes })
    get().filterNotes()
  },

  addNote: (note) => {
    console.log('🟢 [NOTE_STORE] addNote called for:', note.id)
    set(state => ({ 
      notes: [note, ...state.notes]
    }))
    get().filterNotes()
  },

  updateNote: (noteId, updates) => {
    console.log('🟢 [NOTE_STORE] updateNote called for:', noteId)
    set(state => ({
      notes: state.notes.map(note =>
        note.id === noteId
          ? { ...note, ...updates }
          : note
      )
    }))
    get().filterNotes()
  },

  removeNote: (noteId) => {
    console.log('🟢 [NOTE_STORE] removeNote called for:', noteId)
    set(state => ({
      notes: state.notes.filter(note => note.id !== noteId),
      selectedNote: state.selectedNote?.id === noteId ? null : state.selectedNote
    }))
    get().filterNotes()
  },

  setSelectedNote: (note) => set({ selectedNote: note }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterNotes()
  },

  setTopicFilter: (topicFilter) => {
    set({ topicFilter })
    get().filterNotes()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterNotes()
  },

  filterNotes: () => {
    const { notes, searchTerm, topicFilter, activeTab } = get()
    let filtered = [...notes]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(note => 
        note.content?.toLowerCase().includes(searchLower)
      )
    }

    // Apply topic filter
    if (topicFilter) {
      filtered = filtered.filter(note => note.topic_id === topicFilter)
    }

    // Apply tab filter
    switch (activeTab) {
      case 'recent':
        filtered = filtered.sort((a, b) => 
          new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime()
        )
        break
      case 'favorites':
        // Implement favorites logic if needed
        break
    }

    set({ filteredNotes: filtered })
  },

  resetFilters: () => {
    set({
      searchTerm: '',
      topicFilter: null,
      activeTab: 'all'
    })
    get().filterNotes()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),
  toggleForm: (isFormOpen) => set({ isFormOpen }),
  setFormData: (formData) => set({ formData }),
  setFormErrors: (formErrors) => set({ formErrors }),
  clearForm: () => set({ formData: {}, formErrors: {} }),
  setEditingNoteId: (editingNoteId) => set({ editingNoteId }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}))

// Export hooks for accessing specific parts of state
export const useNotesData = () => useNotesStore(state => ({
  notes: state.notes,
  filteredNotes: state.filteredNotes,
  selectedNote: state.selectedNote
}))

export const useNotesFilters = () => useNotesStore(state => ({
  searchTerm: state.searchTerm,
  topicFilter: state.topicFilter,
  activeTab: state.activeTab,
  setSearchTerm: state.setSearchTerm,
  setTopicFilter: state.setTopicFilter,
  setActiveTab: state.setActiveTab,
  resetFilters: state.resetFilters
}))

export const useNotesForm = () => useNotesStore(state => ({
  formMode: state.formMode,
  isFormOpen: state.isFormOpen,
  formData: state.formData,
  formErrors: state.formErrors,
  editingNoteId: state.editingNoteId,
  isSubmitting: state.isSubmitting,
  setFormMode: state.setFormMode,
  toggleForm: state.toggleForm,
  setFormData: state.setFormData,
  setFormErrors: state.setFormErrors,
  clearForm: state.clearForm,
  setEditingNoteId: state.setEditingNoteId,
  setSubmitting: state.setSubmitting
}))

export const useNotesLoading = () => useNotesStore(state => ({
  isLoading: state.isLoading,
  error: state.error
})) 
import { create } from 'zustand'
import { Document, DocumentMetadata } from '@/lib/api/documents'

// Extended Document interface with UI-specific fields
export interface ExtendedDocument extends Document {
  formatted_content?: DocumentMetadata
  is_loading?: boolean
  is_error?: boolean
  error_message?: string
}

// Form mode type
export type FormMode = 'create' | 'edit' | 'view'

interface DocumentsState {
  // Data
  documents: ExtendedDocument[]
  filteredDocuments: ExtendedDocument[]
  selectedDocument: ExtendedDocument | null
  
  // Filters
  searchTerm: string
  topicFilter: string | null
  activeTab: 'all' | 'recent' | 'favorites'
  
  // Form state
  formMode: FormMode
  isFormOpen: boolean
  formData: Partial<Document>
  formErrors: Record<string, string>
  editingDocumentId: string | null
  isSubmitting: boolean
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  updateDocument: (documentId: string, updates: Partial<Document>) => void
  removeDocument: (documentId: string) => void
  setSelectedDocument: (document: Document | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setTopicFilter: (topicId: string | null) => void
  setActiveTab: (tab: 'all' | 'recent' | 'favorites') => void
  filterDocuments: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormData: (data: Partial<Document>) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearForm: () => void
  setEditingDocumentId: (documentId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  // Initial state
  documents: [],
  filteredDocuments: [],
  selectedDocument: null,
  searchTerm: '',
  topicFilter: null,
  activeTab: 'all',
  formMode: 'view',
  isFormOpen: false,
  formData: {},
  formErrors: {},
  editingDocumentId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setDocuments: (documents) => {
    const safeDocuments = Array.isArray(documents) ? documents : []
    console.log('🟢 [DOC_STORE] setDocuments called with', safeDocuments.length, 'documents')
    
    const formattedDocuments = safeDocuments.map(doc => ({
      ...doc,
      formatted_content: doc.content ? JSON.parse(doc.content) : null
    }))
    
    set({ documents: formattedDocuments })
    get().filterDocuments()
  },

  addDocument: (document) => {
    console.log('🟢 [DOC_STORE] addDocument called for:', document.id)
    const formattedDoc = {
      ...document,
      formatted_content: document.content ? JSON.parse(document.content) : null
    }
    set(state => ({ 
      documents: [formattedDoc, ...state.documents]
    }))
    get().filterDocuments()
  },

  updateDocument: (documentId, updates) => {
    console.log('🟢 [DOC_STORE] updateDocument called for:', documentId)
    set(state => ({
      documents: state.documents.map(doc =>
        doc.id === documentId
          ? {
              ...doc,
              ...updates,
              formatted_content: updates.content ? JSON.parse(updates.content) : doc.formatted_content
            }
          : doc
      )
    }))
    get().filterDocuments()
  },

  removeDocument: (documentId) => {
    console.log('🟢 [DOC_STORE] removeDocument called for:', documentId)
    set(state => ({
      documents: state.documents.filter(doc => doc.id !== documentId),
      selectedDocument: state.selectedDocument?.id === documentId ? null : state.selectedDocument
    }))
    get().filterDocuments()
  },

  setSelectedDocument: (document) => set({ 
    selectedDocument: document ? {
      ...document,
      formatted_content: document.content ? JSON.parse(document.content) : null
    } : null 
  }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterDocuments()
  },

  setTopicFilter: (topicFilter) => {
    set({ topicFilter })
    get().filterDocuments()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterDocuments()
  },

  filterDocuments: () => {
    const { documents, searchTerm, topicFilter, activeTab } = get()
    let filtered = [...documents]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.content?.toLowerCase().includes(searchLower) ||
        doc.formatted_content?.title?.toLowerCase().includes(searchLower)
      )
    }

    // Apply topic filter
    if (topicFilter) {
      filtered = filtered.filter(doc => doc.topic_id === topicFilter)
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

    set({ filteredDocuments: filtered })
  },

  resetFilters: () => {
    set({
      searchTerm: '',
      topicFilter: null,
      activeTab: 'all'
    })
    get().filterDocuments()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),
  toggleForm: (isFormOpen) => set({ isFormOpen }),
  setFormData: (formData) => set({ formData }),
  setFormErrors: (formErrors) => set({ formErrors }),
  clearForm: () => set({ formData: {}, formErrors: {} }),
  setEditingDocumentId: (editingDocumentId) => set({ editingDocumentId }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}))

// Export hooks for accessing specific parts of state
export const useDocumentsData = () => useDocumentsStore(state => ({
  documents: state.documents,
  filteredDocuments: state.filteredDocuments,
  selectedDocument: state.selectedDocument
}))

export const useDocumentsFilters = () => useDocumentsStore(state => ({
  searchTerm: state.searchTerm,
  topicFilter: state.topicFilter,
  activeTab: state.activeTab,
  setSearchTerm: state.setSearchTerm,
  setTopicFilter: state.setTopicFilter,
  setActiveTab: state.setActiveTab,
  resetFilters: state.resetFilters
}))

export const useDocumentsForm = () => useDocumentsStore(state => ({
  formMode: state.formMode,
  isFormOpen: state.isFormOpen,
  formData: state.formData,
  formErrors: state.formErrors,
  editingDocumentId: state.editingDocumentId,
  isSubmitting: state.isSubmitting,
  setFormMode: state.setFormMode,
  toggleForm: state.toggleForm,
  setFormData: state.setFormData,
  setFormErrors: state.setFormErrors,
  clearForm: state.clearForm,
  setEditingDocumentId: state.setEditingDocumentId,
  setSubmitting: state.setSubmitting
}))

export const useDocumentsLoading = () => useDocumentsStore(state => ({
  isLoading: state.isLoading,
  error: state.error
})) 
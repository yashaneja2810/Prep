import useSWR from 'swr'
import { useCallback } from 'react'
import { toast } from 'sonner'
import * as documentsApi from '@/lib/api/documents'
import { handleError } from '@/helpers/helpers'
import { DOCUMENTS_SWR_KEY, DOCUMENT_BY_ID_SWR_KEY, DOCUMENTS_BY_TOPIC_SWR_KEY } from '@/lib/api/documents'
import { useDocumentsStore } from '@/store/slices/documents'

// Type for the documents hook return
interface UseDocumentsReturn {
  documents: documentsApi.Document[]
  isLoading: boolean
  error: string | null
  mutate: () => void
  // Store state
  filteredDocuments: documentsApi.Document[]
  selectedDocument: documentsApi.Document | null
  searchTerm: string
  topicFilter: string | null
  activeTab: 'all' | 'recent' | 'favorites'
  // Store actions
  setSearchTerm: (term: string) => void
  setTopicFilter: (topicId: string | null) => void
  setActiveTab: (tab: 'all' | 'recent' | 'favorites') => void
  filterDocuments: () => void
  resetFilters: () => void
  setDocuments: (documents: documentsApi.Document[]) => void
  addDocument: (document: documentsApi.Document) => void
  updateDocument: (documentId: string, updates: Partial<documentsApi.Document>) => void
  removeDocument: (documentId: string) => void
  setSelectedDocument: (document: documentsApi.Document | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Main documents hook for basic listing
export const useDocuments = (): UseDocumentsReturn => {
  const store = useDocumentsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    DOCUMENTS_SWR_KEY,
    documentsApi.getAllDocuments,
    {
      onSuccess: (data) => {
        console.log('🟢 [useDocuments] SWR success, setting documents in store')
        store.setDocuments(data || [])
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useDocuments] SWR error:', error)
        let errorMessage = 'Failed to load documents'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
        store.setLoading(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    documents: data || [],
    isLoading,
    error: error ? 'Failed to load documents' : null,
    mutate,
    // Store state
    filteredDocuments: store.filteredDocuments,
    selectedDocument: store.selectedDocument,
    searchTerm: store.searchTerm,
    topicFilter: store.topicFilter,
    activeTab: store.activeTab,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setTopicFilter: store.setTopicFilter,
    setActiveTab: store.setActiveTab,
    filterDocuments: store.filterDocuments,
    resetFilters: store.resetFilters,
    setDocuments: store.setDocuments,
    addDocument: store.addDocument,
    updateDocument: store.updateDocument,
    removeDocument: store.removeDocument,
    setSelectedDocument: store.setSelectedDocument,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for single document hook return
interface UseDocumentReturn {
  document: documentsApi.Document | null
  isLoading: boolean
  error: string | null
  mutate: () => void
}

// Hook for fetching a single document
export const useDocument = (documentId: string | null): UseDocumentReturn => {
  const store = useDocumentsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    documentId ? DOCUMENT_BY_ID_SWR_KEY(documentId) : null,
    () => documentId ? documentsApi.getDocumentById(documentId) : null,
    {
      onSuccess: (data) => {
        if (data) {
          store.setSelectedDocument(data)
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useDocument] Error fetching document:', error)
        handleError(error)
      }
    }
  )

  return {
    document: data || null,
    isLoading,
    error: error ? 'Failed to load document' : null,
    mutate
  }
}

// Type for documents by topic hook return
interface UseDocumentsByTopicReturn {
  documents: documentsApi.Document[]
  isLoading: boolean
  error: string | null
  mutate: () => void
}

// Hook for fetching documents by topic
export const useDocumentsByTopic = (topicId: string | null): UseDocumentsByTopicReturn => {
  const store = useDocumentsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    topicId ? DOCUMENTS_BY_TOPIC_SWR_KEY(topicId) : null,
    () => topicId ? documentsApi.getDocumentsByTopicId(topicId) : null,
    {
      onSuccess: (data) => {
        if (data) {
          store.setDocuments(data)
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useDocumentsByTopic] Error fetching documents:', error)
        handleError(error)
      }
    }
  )

  return {
    documents: data || [],
    isLoading,
    error: error ? 'Failed to load documents' : null,
    mutate
  }
}

// Type for documents mutations hook return
interface UseDocumentsMutationsReturn {
  createDocument: (documentData: documentsApi.CreateDocumentDto) => Promise<documentsApi.Document>
  updateDocument: (documentId: string, documentData: documentsApi.UpdateDocumentDto) => Promise<documentsApi.Document>
  deleteDocument: (documentId: string) => Promise<void>
  // Store state
  isSubmitting: boolean
  formErrors: Record<string, string>
  formMode: 'create' | 'edit' | 'view'
  isFormOpen: boolean
  editingDocumentId: string | null
}

// Hook for document mutations (create, update, delete)
export const useDocumentsMutations = (): UseDocumentsMutationsReturn => {
  const store = useDocumentsStore()
  
  const createDocument = useCallback(async (documentData: documentsApi.CreateDocumentDto) => {
    try {
      store.setSubmitting(true)
      store.setFormErrors({})
      
      const validationErrors = documentsApi.validateDocument(documentData, false)
      if (validationErrors) {
        store.setFormErrors(validationErrors)
        throw new Error('Validation failed')
      }
      
      const newDocument = await documentsApi.createDocument(documentData)
      store.addDocument(newDocument)
      toast.success('Document created successfully')
      return newDocument
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const updateDocument = useCallback(async (
    documentId: string,
    documentData: documentsApi.UpdateDocumentDto
  ) => {
    try {
      store.setSubmitting(true)
      store.setFormErrors({})
      
      const validationErrors = documentsApi.validateDocument(documentData, true)
      if (validationErrors) {
        store.setFormErrors(validationErrors)
        throw new Error('Validation failed')
      }
      
      const updatedDocument = await documentsApi.updateDocument(documentId, documentData)
      store.updateDocument(documentId, updatedDocument)
      toast.success('Document updated successfully')
      return updatedDocument
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      store.setSubmitting(true)
      await documentsApi.deleteDocument(documentId)
      store.removeDocument(documentId)
      toast.success('Document deleted successfully')
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  return {
    createDocument,
    updateDocument,
    deleteDocument,
    // Store state
    isSubmitting: store.isSubmitting,
    formErrors: store.formErrors,
    formMode: store.formMode,
    isFormOpen: store.isFormOpen,
    editingDocumentId: store.editingDocumentId
  }
} 
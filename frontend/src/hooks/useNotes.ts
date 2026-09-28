import useSWR from 'swr'
import { useCallback } from 'react'
import { toast } from 'sonner'
import * as notesApi from '@/lib/api/notes'
import { handleError } from '@/helpers/helpers'
import { useNotesStore } from '@/store/slices/notes'

// Type for the notes hook return
interface UseNotesReturn {
  notes: notesApi.Note[]
  isLoading: boolean
  error: string | null
  mutate: () => void
  // Store state
  filteredNotes: notesApi.Note[]
  selectedNote: notesApi.Note | null
  searchTerm: string
  topicFilter: string | null
  activeTab: 'all' | 'recent' | 'favorites'
  // Store actions
  setSearchTerm: (term: string) => void
  setTopicFilter: (topicId: string | null) => void
  setActiveTab: (tab: 'all' | 'recent' | 'favorites') => void
  filterNotes: () => void
  resetFilters: () => void
  setNotes: (notes: notesApi.Note[]) => void
  addNote: (note: notesApi.Note) => void
  updateNote: (noteId: string, updates: Partial<notesApi.Note>) => void
  removeNote: (noteId: string) => void
  setSelectedNote: (note: notesApi.Note | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Main notes hook for basic listing
export const useNotes = (): UseNotesReturn => {
  const store = useNotesStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    notesApi.NOTES_SWR_KEY,
    notesApi.getAllNotes,
    {
      onSuccess: (data) => {
        console.log('🟢 [useNotes] SWR success, setting notes in store')
        store.setNotes(data || [])
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useNotes] SWR error:', error)
        let errorMessage = 'Failed to load notes'
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
    notes: data || [],
    isLoading,
    error: error ? 'Failed to load notes' : null,
    mutate,
    // Store state
    filteredNotes: store.filteredNotes,
    selectedNote: store.selectedNote,
    searchTerm: store.searchTerm,
    topicFilter: store.topicFilter,
    activeTab: store.activeTab,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setTopicFilter: store.setTopicFilter,
    setActiveTab: store.setActiveTab,
    filterNotes: store.filterNotes,
    resetFilters: store.resetFilters,
    setNotes: store.setNotes,
    addNote: store.addNote,
    updateNote: store.updateNote,
    removeNote: store.removeNote,
    setSelectedNote: store.setSelectedNote,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for single note hook return
interface UseNoteReturn {
  note: notesApi.Note | null
  isLoading: boolean
  error: string | null
  mutate: () => void
}

// Hook for fetching a single note
export const useNote = (noteId: string | null): UseNoteReturn => {
  const store = useNotesStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    noteId ? notesApi.NOTE_BY_ID_SWR_KEY(noteId) : null,
    () => noteId ? notesApi.getNoteById(noteId) : null,
    {
      onSuccess: (data) => {
        if (data) {
          store.setSelectedNote(data)
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useNote] Error fetching note:', error)
        handleError(error)
      }
    }
  )

  return {
    note: data || null,
    isLoading,
    error: error ? 'Failed to load note' : null,
    mutate
  }
}

// Type for notes by topic hook return
interface UseNotesByTopicReturn {
  notes: notesApi.Note[]
  isLoading: boolean
  error: string | null
  mutate: () => void
}

// Hook for fetching notes by topic
export const useNotesByTopic = (topicId: string | null): UseNotesByTopicReturn => {
  const store = useNotesStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    topicId ? notesApi.NOTES_BY_TOPIC_SWR_KEY(topicId) : null,
    () => topicId ? notesApi.getNotesByTopicId(topicId) : null,
    {
      onSuccess: (data) => {
        if (data) {
          store.setNotes(data)
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useNotesByTopic] Error fetching notes:', error)
        handleError(error)
      }
    }
  )

  return {
    notes: data || [],
    isLoading,
    error: error ? 'Failed to load notes' : null,
    mutate
  }
}

// Type for notes mutations hook return
interface UseNotesMutationsReturn {
  createNote: (noteData: notesApi.CreateNoteDto) => Promise<notesApi.Note>
  updateNote: (noteId: string, noteData: notesApi.UpdateNoteDto) => Promise<notesApi.Note>
  deleteNote: (noteId: string) => Promise<void>
  uploadImage: (file: File) => Promise<notesApi.UploadImageResponse>
  uploadTopicImage: (topicId: string, file: File) => Promise<notesApi.UploadImageResponse>
  deleteImage: (fileName: string) => Promise<void>
  // Store state
  isSubmitting: boolean
  formErrors: Record<string, string>
  formMode: 'create' | 'edit' | 'view'
  isFormOpen: boolean
  editingNoteId: string | null
}

// Hook for note mutations (create, update, delete)
export const useNotesMutations = (): UseNotesMutationsReturn => {
  const store = useNotesStore()
  
  const createNote = useCallback(async (noteData: notesApi.CreateNoteDto) => {
    try {
      store.setSubmitting(true)
      store.setFormErrors({})
      
      const validationErrors = notesApi.validateNote(noteData, false)
      if (validationErrors) {
        store.setFormErrors(validationErrors)
        throw new Error('Validation failed')
      }
      
      const newNote = await notesApi.createNote(noteData)
      store.addNote(newNote)
      toast.success('Note created successfully')
      return newNote
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const updateNote = useCallback(async (
    noteId: string,
    noteData: notesApi.UpdateNoteDto
  ) => {
    try {
      store.setSubmitting(true)
      store.setFormErrors({})
      
      const validationErrors = notesApi.validateNote(noteData, true)
      if (validationErrors) {
        store.setFormErrors(validationErrors)
        throw new Error('Validation failed')
      }
      
      const updatedNote = await notesApi.updateNote(noteId, noteData)
      store.updateNote(noteId, updatedNote)
      toast.success('Note updated successfully')
      return updatedNote
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      store.setSubmitting(true)
      await notesApi.deleteNote(noteId)
      store.removeNote(noteId)
      toast.success('Note deleted successfully')
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const uploadImage = useCallback(async (file: File) => {
    try {
      if (!notesApi.isValidImageFile(file)) {
        throw new Error('Invalid image file type')
      }
      
      const fileSize = notesApi.getImageFileSize(file)
      if (fileSize > 5) { // 5MB limit
        throw new Error('Image file is too large (max 5MB)')
      }
      
      return await notesApi.uploadNoteImage(file)
    } catch (error) {
      handleError(error)
      throw error
    }
  }, [])

  const uploadTopicImage = useCallback(async (topicId: string, file: File) => {
    try {
      if (!notesApi.isValidImageFile(file)) {
        throw new Error('Invalid image file type')
      }
      
      const fileSize = notesApi.getImageFileSize(file)
      if (fileSize > 5) { // 5MB limit
        throw new Error('Image file is too large (max 5MB)')
      }
      
      return await notesApi.uploadTopicNoteImage(topicId, file)
    } catch (error) {
      handleError(error)
      throw error
    }
  }, [])

  const deleteImage = useCallback(async (fileName: string) => {
    try {
      await notesApi.deleteNoteImage(fileName)
    } catch (error) {
      handleError(error)
      throw error
    }
  }, [])

  return {
    createNote,
    updateNote,
    deleteNote,
    uploadImage,
    uploadTopicImage,
    deleteImage,
    // Store state
    isSubmitting: store.isSubmitting,
    formErrors: store.formErrors,
    formMode: store.formMode,
    isFormOpen: store.isFormOpen,
    editingNoteId: store.editingNoteId
  }
} 
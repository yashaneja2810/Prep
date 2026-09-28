import { create } from 'zustand'
import { ApSubmission } from '@/lib/api/submissions'

interface SubmissionsState {
  // Data
  submissions: ApSubmission[]
  filteredSubmissions: ApSubmission[]
  selectedSubmission: ApSubmission | null
  
  // Filters
  searchTerm: string
  apFilter: string | null
  statusFilter: 'all' | 'correct' | 'incorrect'
  
  // Loading states
  isLoading: boolean
  error: string | null
  isSubmitting: boolean
  
  // Data Actions
  setSubmissions: (submissions: ApSubmission[]) => void
  addSubmission: (submission: ApSubmission) => void
  setSelectedSubmission: (submission: ApSubmission | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setApFilter: (apId: string | null) => void
  setStatusFilter: (status: 'all' | 'correct' | 'incorrect') => void
  filterSubmissions: () => void
  resetFilters: () => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSubmitting: (submitting: boolean) => void
}

export const useSubmissionsStore = create<SubmissionsState>((set, get) => ({
  // Initial state
  submissions: [],
  filteredSubmissions: [],
  selectedSubmission: null,
  searchTerm: '',
  apFilter: null,
  statusFilter: 'all',
  isLoading: false,
  error: null,
  isSubmitting: false,

  // Data Actions
  setSubmissions: (submissions) => {
    const safeSubmissions = Array.isArray(submissions) ? submissions : []
    console.log('🟢 [SUBMISSIONS_STORE] setSubmissions called with', safeSubmissions.length, 'submissions')
    
    set({ submissions: safeSubmissions })
    get().filterSubmissions()
  },

  addSubmission: (submission) => {
    console.log('🟢 [SUBMISSIONS_STORE] addSubmission called for:', submission.id)
    set(state => ({ 
      submissions: [submission, ...state.submissions]
    }))
    get().filterSubmissions()
  },

  setSelectedSubmission: (submission) => set({ selectedSubmission: submission }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterSubmissions()
  },

  setApFilter: (apFilter) => {
    set({ apFilter })
    get().filterSubmissions()
  },

  setStatusFilter: (statusFilter) => {
    set({ statusFilter })
    get().filterSubmissions()
  },

  filterSubmissions: () => {
    const { submissions, searchTerm, apFilter, statusFilter } = get()
    let filtered = [...submissions]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(sub => 
        sub.submission_code?.toLowerCase().includes(searchLower) ||
        sub.aps?.title?.toLowerCase().includes(searchLower)
      )
    }

    // Apply AP filter
    if (apFilter) {
      filtered = filtered.filter(sub => sub.ap_id === apFilter)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isCorrect = statusFilter === 'correct'
      filtered = filtered.filter(sub => sub.is_correct === isCorrect)
    }

    // Sort by submission date (newest first)
    filtered = filtered.sort((a, b) => {
      const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
      const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
      return dateB - dateA
    })

    set({ filteredSubmissions: filtered })
  },

  resetFilters: () => {
    set({
      searchTerm: '',
      apFilter: null,
      statusFilter: 'all'
    })
    get().filterSubmissions()
  },

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSubmitting: (isSubmitting) => set({ isSubmitting })
}))

// Export hooks for accessing specific parts of state
export const useSubmissionsData = () => useSubmissionsStore(state => ({
  submissions: state.submissions,
  filteredSubmissions: state.filteredSubmissions,
  selectedSubmission: state.selectedSubmission
}))

export const useSubmissionsFilters = () => useSubmissionsStore(state => ({
  searchTerm: state.searchTerm,
  apFilter: state.apFilter,
  statusFilter: state.statusFilter,
  setSearchTerm: state.setSearchTerm,
  setApFilter: state.setApFilter,
  setStatusFilter: state.setStatusFilter,
  resetFilters: state.resetFilters
}))

export const useSubmissionsLoading = () => useSubmissionsStore(state => ({
  isLoading: state.isLoading,
  error: state.error,
  isSubmitting: state.isSubmitting
})) 
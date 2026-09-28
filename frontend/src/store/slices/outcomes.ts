import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { OutcomeResponse } from '@/lib/api/outcomes'

interface OutcomesState {
  // Data
  outcomes: OutcomeResponse[] | null
  selectedOutcome: OutcomeResponse | null
  searchTerm: string
  // UI state
  isLoading: boolean
  error: string | null
  isSubmitting: boolean
  formErrors: Record<string, string>
  formMode: 'create' | 'edit' | 'view'
  isFormOpen: boolean
  editingOutcomeId: string | null
  // Actions
  setOutcomes: (outcomes: OutcomeResponse[] | null) => void
  addOutcome: (outcome: OutcomeResponse) => void
  updateOutcome: (outcomeId: string, updates: Partial<OutcomeResponse>) => void
  removeOutcome: (outcomeId: string) => void
  setSelectedOutcome: (outcome: OutcomeResponse | null) => void
  setSearchTerm: (term: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSubmitting: (submitting: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setFormMode: (mode: 'create' | 'edit' | 'view') => void
  setIsFormOpen: (isOpen: boolean) => void
  setEditingOutcomeId: (id: string | null) => void
  openCreateForm: () => void
  openEditForm: (outcomeId: string) => void
  closeForm: () => void
  resetState: () => void
}

export const useOutcomesStore = create<OutcomesState>()(
  devtools(
    (set) => ({
      // Initial state
      outcomes: null,
      selectedOutcome: null,
      searchTerm: '',
      isLoading: false,
      error: null,
      isSubmitting: false,
      formErrors: {},
      formMode: 'view',
      isFormOpen: false,
      editingOutcomeId: null,

      // Actions
      setOutcomes: (outcomes) => set({ outcomes }),
      
      addOutcome: (outcome) =>
        set((state) => ({
          outcomes: state.outcomes ? [...state.outcomes, outcome] : [outcome],
        })),
      
      updateOutcome: (outcomeId, updates) =>
        set((state) => ({
          outcomes: state.outcomes
            ? state.outcomes.map((outcome) =>
                outcome.id === outcomeId
                  ? { ...outcome, ...updates }
                  : outcome
              )
            : null,
          selectedOutcome:
            state.selectedOutcome && state.selectedOutcome.id === outcomeId
              ? { ...state.selectedOutcome, ...updates }
              : state.selectedOutcome,
        })),
      
      removeOutcome: (outcomeId) =>
        set((state) => ({
          outcomes: state.outcomes
            ? state.outcomes.filter((outcome) => outcome.id !== outcomeId)
            : null,
          selectedOutcome:
            state.selectedOutcome && state.selectedOutcome.id === outcomeId
              ? null
              : state.selectedOutcome,
        })),
      
      setSelectedOutcome: (outcome) => set({ selectedOutcome: outcome }),
      
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),
      
      setFormErrors: (errors) => set({ formErrors: errors }),
      
      clearFormErrors: () => set({ formErrors: {} }),
      
      setFormMode: (mode) => set({ formMode: mode }),
      
      setIsFormOpen: (isOpen) => set({ isFormOpen: isOpen }),
      
      setEditingOutcomeId: (id) => set({ editingOutcomeId: id }),
      
      openCreateForm: () =>
        set({
          formMode: 'create',
          isFormOpen: true,
          editingOutcomeId: null,
          formErrors: {},
        }),
      
      openEditForm: (outcomeId) =>
        set({
          formMode: 'edit',
          isFormOpen: true,
          editingOutcomeId: outcomeId,
          formErrors: {},
        }),
      
      closeForm: () =>
        set({
          isFormOpen: false,
          formErrors: {},
        }),
      
      resetState: () =>
        set({
          outcomes: null,
          selectedOutcome: null,
          searchTerm: '',
          isLoading: false,
          error: null,
          isSubmitting: false,
          formErrors: {},
          formMode: 'view',
          isFormOpen: false,
          editingOutcomeId: null,
        }),
    }),
    { name: 'outcomes-store' }
  )
) 
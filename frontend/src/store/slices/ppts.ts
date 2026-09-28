import { create } from 'zustand'
import { PPT } from '@/lib/api/ppt'

interface PPTsState {
  // Form state
  isSubmitting: boolean
  setIsSubmitting: (isSubmitting: boolean) => void
  formErrors: Record<string, string> | null
  setFormErrors: (errors: Record<string, string> | null) => void

  // Filtered PPTs state
  filteredPPTs: PPT[]
  setFilteredPPTs: (ppts: PPT[]) => void
  filterPPTs: (searchTerm: string) => void
  clearFilters: () => void

  // Selected PPT state
  selectedPPT: PPT | null
  setSelectedPPT: (ppt: PPT | null) => void
}

export const usePPTsStore = create<PPTsState>((set) => ({
  // Form state
  isSubmitting: false,
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  formErrors: null,
  setFormErrors: (errors) => set({ formErrors: errors }),

  // Filtered PPTs state
  filteredPPTs: [],
  setFilteredPPTs: (ppts) => set({ filteredPPTs: ppts }),
  filterPPTs: (searchTerm) =>
    set((state) => ({
      filteredPPTs: state.filteredPPTs.filter((ppt) =>
        ppt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ppt.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    })),
  clearFilters: () => set({ filteredPPTs: [] }),

  // Selected PPT state
  selectedPPT: null,
  setSelectedPPT: (ppt) => set({ selectedPPT: ppt })
}))

// Helper hooks for accessing specific parts of the state
export const useFormState = () => {
  const isSubmitting = usePPTsStore((state) => state.isSubmitting)
  const formErrors = usePPTsStore((state) => state.formErrors)
  return { isSubmitting, formErrors }
}

export const useFilteredPPTs = () => {
  const filteredPPTs = usePPTsStore((state) => state.filteredPPTs)
  const filterPPTs = usePPTsStore((state) => state.filterPPTs)
  const clearFilters = usePPTsStore((state) => state.clearFilters)
  return { filteredPPTs, filterPPTs, clearFilters }
}

export const useSelectedPPT = () => {
  const selectedPPT = usePPTsStore((state) => state.selectedPPT)
  const setSelectedPPT = usePPTsStore((state) => state.setSelectedPPT)
  return { selectedPPT, setSelectedPPT }
} 
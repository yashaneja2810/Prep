import { create } from 'zustand'
import { PointBreakdown, POINT_ACTIONS } from '@/lib/api/points'

interface PointsState {
  // Data
  pointsBreakdown: PointBreakdown | null
  
  // Filters
  actionTypeFilter: string | null
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setPointsBreakdown: (pointsBreakdown: PointBreakdown) => void
  
  // Filter Actions
  setActionTypeFilter: (actionType: string | null) => void
  resetFilters: () => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Initial empty points breakdown structure
const emptyPointsBreakdown: PointBreakdown = {
  total: 0,
  breakdown: {}
}

export const usePointsStore = create<PointsState>((set) => ({
  // Initial state
  pointsBreakdown: null,
  actionTypeFilter: null,
  isLoading: false,
  error: null,

  // Data Actions
  setPointsBreakdown: (pointsBreakdown) => {
    console.log('🟢 [POINTS_STORE] setPointsBreakdown called with total:', pointsBreakdown?.total || 0)
    set({ pointsBreakdown: pointsBreakdown || emptyPointsBreakdown })
  },

  // Filter Actions
  setActionTypeFilter: (actionType) => set({ actionTypeFilter }),
  resetFilters: () => set({ actionTypeFilter: null }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}))

// Export hooks for accessing specific parts of state
export const usePointsData = () => usePointsStore(state => ({
  pointsBreakdown: state.pointsBreakdown,
  total: state.pointsBreakdown?.total || 0,
  actionTypes: state.pointsBreakdown ? Object.keys(state.pointsBreakdown.breakdown) : []
}))

export const usePointsFilters = () => usePointsStore(state => ({
  actionTypeFilter: state.actionTypeFilter,
  setActionTypeFilter: state.setActionTypeFilter,
  resetFilters: state.resetFilters
}))

export const usePointsLoading = () => usePointsStore(state => ({
  isLoading: state.isLoading,
  error: state.error
}))

// Helper selectors
export const usePointsByActionType = (actionType: POINT_ACTIONS) => usePointsStore(state => ({
  total: state.pointsBreakdown?.breakdown?.[actionType]?.total || 0,
  activities: state.pointsBreakdown?.breakdown?.[actionType]?.activities || []
})) 
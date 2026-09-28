import useSWR from 'swr'
import * as pointsApi from '@/lib/api/points'
import { USER_POINTS_SWR_KEY, USER_POINTS_BY_ID_SWR_KEY } from '@/lib/api/points'
import { usePointsStore } from '@/store/slices/points'
import { calculateLevel, calculateNextLevelProgress } from '@/lib/api/points'

// Type for the points hook return
interface UsePointsReturn {
  pointsBreakdown: pointsApi.PointBreakdown | null
  isLoading: boolean
  error: string | null
  mutate: () => void
  // Calculated values
  totalPoints: number
  level: number
  nextLevelProgress: number
  // Store state
  actionTypeFilter: string | null
  // Store actions
  setPointsBreakdown: (pointsBreakdown: pointsApi.PointBreakdown) => void
  setActionTypeFilter: (actionType: string | null) => void
  resetFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Main points hook for current authenticated user
export const useUserPoints = (): UsePointsReturn => {
  const store = usePointsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    USER_POINTS_SWR_KEY,
    () => pointsApi.getUserPointsBreakdown(),
    {
      onSuccess: (data) => {
        console.log('🟢 [useUserPoints] SWR success, setting points breakdown in store')
        store.setPointsBreakdown(data || { total: 0, breakdown: {} })
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useUserPoints] SWR error:', error)
        let errorMessage = 'Failed to load points'
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

  // Calculate derived values
  const totalPoints = data?.total || 0
  const level = calculateLevel(totalPoints)
  const nextLevelProgress = calculateNextLevelProgress(totalPoints)

  return {
    pointsBreakdown: data || null,
    isLoading,
    error: error ? 'Failed to load points' : null,
    mutate,
    // Calculated values
    totalPoints,
    level,
    nextLevelProgress,
    // Store state
    actionTypeFilter: store.actionTypeFilter,
    // Store actions
    setPointsBreakdown: store.setPointsBreakdown,
    setActionTypeFilter: store.setActionTypeFilter,
    resetFilters: store.resetFilters,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Hook for getting points for a specific user (admin only)
export const useUserPointsById = (userId: string | null): UsePointsReturn => {
  const store = usePointsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    userId ? USER_POINTS_BY_ID_SWR_KEY(userId) : null,
    () => userId ? pointsApi.getUserPointsBreakdownById(userId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useUserPointsById] SWR success, setting points breakdown in store')
        store.setPointsBreakdown(data || { total: 0, breakdown: {} })
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useUserPointsById] SWR error:', error)
        let errorMessage = 'Failed to load points'
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

  // Calculate derived values
  const totalPoints = data?.total || 0
  const level = calculateLevel(totalPoints)
  const nextLevelProgress = calculateNextLevelProgress(totalPoints)

  return {
    pointsBreakdown: data || null,
    isLoading,
    error: error ? 'Failed to load points' : null,
    mutate,
    // Calculated values
    totalPoints,
    level,
    nextLevelProgress,
    // Store state
    actionTypeFilter: store.actionTypeFilter,
    // Store actions
    setPointsBreakdown: store.setPointsBreakdown,
    setActionTypeFilter: store.setActionTypeFilter,
    resetFilters: store.resetFilters,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Hook for getting points by action type
interface UsePointsByActionTypeReturn {
  total: number
  activities: {
    id: string
    reference_id: string
    points: number
    earned_at: string
  }[]
  isLoading: boolean
}

export const usePointsByActionType = (
  actionType: pointsApi.POINT_ACTIONS
): UsePointsByActionTypeReturn => {
  const { pointsBreakdown, isLoading } = useUserPoints()
  
  const activities = pointsBreakdown?.breakdown?.[actionType]?.activities || []
  const total = pointsBreakdown?.breakdown?.[actionType]?.total || 0
  
  return {
    total,
    activities,
    isLoading
  }
}

// Hook for getting points by action type for a specific user (admin only)
export const usePointsByActionTypeForUser = (
  userId: string | null,
  actionType: pointsApi.POINT_ACTIONS
): UsePointsByActionTypeReturn => {
  const { pointsBreakdown, isLoading } = useUserPointsById(userId)
  
  const activities = pointsBreakdown?.breakdown?.[actionType]?.activities || []
  const total = pointsBreakdown?.breakdown?.[actionType]?.total || 0
  
  return {
    total,
    activities,
    isLoading
  }
} 
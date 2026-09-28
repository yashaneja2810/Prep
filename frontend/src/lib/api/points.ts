import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS } from '@/helpers/string_const'

// Define the main point interface
export interface UserPoint {
  id: string
  user_id: string
  action_type: string
  reference_id: string
  points: number
  earned_at: string
}

// Define point breakdown interface
export interface PointBreakdown {
  total: number
  breakdown: {
    [key: string]: {
      total: number
      activities: {
        id: string
        reference_id: string
        points: number
        earned_at: string
      }[]
    }
  }
}

// Point action types
export enum POINT_ACTIONS {
  TOPIC_COMPLETION = 'topic_completion',
  CP_COMPLETION = 'cp_completion',
  AP_SUBMISSION = 'ap_submission',
  NOTES_SUBMISSION = 'notes_submission',
  OBJECTIVE_COMPLETION = 'objective_completion',
  OUTCOME_COMPLETION = 'outcome_completion'
}

// Point values for different activities
export enum POINT_VALUES {
  TOPIC_COMPLETION = 15,
  CP_COMPLETION = 5,
  AP_SUBMISSION = 10,
  NOTES_SUBMISSION = 5,
  OBJECTIVE_COMPLETION = 1,
  OUTCOME_COMPLETION = 1
}

// Point rules description
export const POINT_RULES_DESCRIPTION = {
  [POINT_ACTIONS.TOPIC_COMPLETION]: 'Topic completion',
  [POINT_ACTIONS.CP_COMPLETION]: 'Concept practice completion',
  [POINT_ACTIONS.AP_SUBMISSION]: 'Application problem submission',
  [POINT_ACTIONS.NOTES_SUBMISSION]: 'Session notes submission',
  [POINT_ACTIONS.OBJECTIVE_COMPLETION]: 'Learning objective completion',
  [POINT_ACTIONS.OUTCOME_COMPLETION]: 'Learning outcome completion'
}

// API endpoints using constants
const ENDPOINTS = {
  USER_POINTS: API_ENDPOINTS.USER_POINTS,
  USER_POINTS_BY_ID: (userId: string) => `${API_ENDPOINTS.USER_POINTS_BY_ID}/${userId}`
}

// SWR keys for caching
export const USER_POINTS_SWR_KEY = '/api/points/me'
export const USER_POINTS_BY_ID_SWR_KEY = (userId: string): string => `/api/points/user/${userId}`

// Get authenticated user points breakdown
export const getUserPointsBreakdown = async (): Promise<PointBreakdown> => {
  return await apiRequest.get<PointBreakdown>(ENDPOINTS.USER_POINTS)
}

// Get points breakdown for a specific user (admin only)
export const getUserPointsBreakdownById = async (userId: string): Promise<PointBreakdown> => {
  return await apiRequest.get<PointBreakdown>(ENDPOINTS.USER_POINTS_BY_ID(userId))
}

// Helper function to format points date
export const formatPointsDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper function to get action type display name
export const getActionTypeDisplayName = (actionType: string): string => {
  return POINT_RULES_DESCRIPTION[actionType as keyof typeof POINT_RULES_DESCRIPTION] || actionType
}

// Helper function to calculate level based on points
export const calculateLevel = (totalPoints: number): number => {
  // Simple level calculation: 1 level per 100 points, minimum level 1
  return Math.max(1, Math.floor(totalPoints / 100) + 1)
}

// Helper function to calculate progress to next level
export const calculateNextLevelProgress = (totalPoints: number): number => {
  const currentLevel = calculateLevel(totalPoints)
  const pointsForCurrentLevel = (currentLevel - 1) * 100
  const pointsForNextLevel = currentLevel * 100
  const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel
  const pointsGained = totalPoints - pointsForCurrentLevel
  
  // Return percentage progress to next level
  return Math.min(100, Math.round((pointsGained / pointsNeeded) * 100))
} 
import { apiRequest } from '@/helpers/request'
import { SWR_KEYS } from '@/helpers/string_const'

// Export SWR keys for use in hooks
export const OUTCOMES_SWR_KEY = SWR_KEYS.OUTCOMES
export const OUTCOME_BY_ID_SWR_KEY = SWR_KEYS.OUTCOME_BY_ID
export const OUTCOMES_BY_TOPIC_SWR_KEY = SWR_KEYS.OUTCOMES_BY_TOPIC

// Types
export interface OutcomeItem {
  id: string
  text: string
  createdAt: string
  updatedAt: string
}

export interface OutcomeHeading {
  id: string
  heading: string
  items: OutcomeItem[]
  createdAt: string
  updatedAt: string
}

export interface OutcomeResponse {
  id: string
  title: string
  description: string
  topicId: string
  organizationId: string
  headings: OutcomeHeading[]
  createdAt: string
  updatedAt: string
}

export interface CreateOutcomeDto {
  id?: string
  title: string
  description: string
  topicId: string
  organizationId: string
  headings: {
    id?: string
    heading: string
    items: {
      id?: string
      text: string
    }[]
  }[]
}

// API Functions
export const getOutcomeById = async (id: string): Promise<OutcomeResponse> => {
  return apiRequest.get<OutcomeResponse>(OUTCOME_BY_ID_SWR_KEY(id))
}

export const getOutcomesByTopicId = async (topicId: string): Promise<OutcomeResponse[]> => {
  return apiRequest.get<OutcomeResponse[]>(OUTCOMES_BY_TOPIC_SWR_KEY(topicId))
}

export const createOutcome = async (data: CreateOutcomeDto): Promise<OutcomeResponse> => {
  return apiRequest.post<OutcomeResponse>(OUTCOMES_SWR_KEY, data)
}

export const createOrUpdateOutcome = async (data: CreateOutcomeDto): Promise<OutcomeResponse> => {
  if (data.id) {
    return apiRequest.put<OutcomeResponse>(`${OUTCOMES_SWR_KEY}/${data.id}`, data)
  } else {
    return createOutcome(data)
  }
}

export const updateHeading = async (headingId: string, heading: string): Promise<any> => {
  return apiRequest.put<any>(`${OUTCOMES_SWR_KEY}/heading/${headingId}`, { heading })
}

export const deleteHeading = async (headingId: string): Promise<any> => {
  return apiRequest.delete<any>(`${OUTCOMES_SWR_KEY}/heading/${headingId}`)
}

export const updateItem = async (itemId: string, text: string): Promise<any> => {
  return apiRequest.put<any>(`${OUTCOMES_SWR_KEY}/item/${itemId}`, { text })
}

export const deleteItem = async (itemId: string): Promise<any> => {
  return apiRequest.delete<any>(`${OUTCOMES_SWR_KEY}/item/${itemId}`)
}

// Validation function
export const validateOutcome = (data: CreateOutcomeDto): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.title) {
    errors.title = 'Title is required'
  }

  if (!data.topicId) {
    errors.topicId = 'Topic ID is required'
  }

  if (!data.organizationId) {
    errors.organizationId = 'Organization ID is required'
  }

  if (!data.headings || data.headings.length === 0) {
    errors.headings = 'At least one heading is required'
  } else {
    data.headings.forEach((heading, index) => {
      if (!heading.heading) {
        errors[`headings[${index}].heading`] = 'Heading text is required'
      }
      
      if (!heading.items || heading.items.length === 0) {
        errors[`headings[${index}].items`] = 'At least one item is required for each heading'
    } else {
        heading.items.forEach((item, itemIndex) => {
          if (!item.text) {
            errors[`headings[${index}].items[${itemIndex}].text`] = 'Item text is required'
          }
        })
    }
    })
  }

  return errors
} 
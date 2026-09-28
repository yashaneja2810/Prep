/**
 * Events utility module
 */

import { generateId } from './utils'

export type EventStatus = 'upcoming' | 'active' | 'past'
export type EventType = 'hackathon' | 'workshop' | 'webinar' | 'competition'

export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  status: EventStatus
  startDate: Date | null
  endDate: Date | null
  location: string
  maxParticipants: number
  currentParticipants: number
  image?: string
  tags: string[]
}

// Mock data for future use - empty for now
export const events: Event[] = []

/**
 * Add a new event to the events array
 */
export function addEvent(event: Omit<Event, 'id'>): Event {
  const newEvent = {
    ...event,
    id: generateId(),
  }
  events.push(newEvent)
  return newEvent
}

/**
 * Get all events
 */
export function getAllEvents(): Event[] {
  return [...events]
}

/**
 * Get events by type
 */
export function getEventsByType(type: EventType): Event[] {
  return events.filter(event => event.type === type)
}

/**
 * Get events by status
 */
export function getEventsByStatus(status: EventStatus): Event[] {
  return events.filter(event => event.status === status)
}

/**
 * Get event by ID
 */
export function getEventById(id: string): Event | undefined {
  return events.find(event => event.id === id)
}

/**
 * Register participant for an event
 */
export function registerForEvent(eventId: string): boolean {
  const event = events.find(e => e.id === eventId)
  if (!event) return false
  if (event.currentParticipants >= event.maxParticipants) return false
  
  event.currentParticipants += 1
  return true
}

/**
 * Update event details
 */
export function updateEvent(id: string, updates: Partial<Omit<Event, 'id'>>): Event | null {
  const eventIndex = events.findIndex(e => e.id === id)
  if (eventIndex === -1) return null
  
  events[eventIndex] = { ...events[eventIndex], ...updates }
  return events[eventIndex]
} 
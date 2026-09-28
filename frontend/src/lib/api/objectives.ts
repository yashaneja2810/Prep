import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const'

export interface ObjectiveItem {
  id: string;
  text: string;
  order_index: number;
  heading_id?: string;
  updated_at?: string;
}

export interface ObjectiveHeading {
  id: string;
  heading: string;
  order_index: number;
  objective_id?: string;
  items: ObjectiveItem[];
  updated_at?: string;
}

export interface ObjectiveResponse {
  id: string;
  topic_id: string;
  topic?: {
    id: string;
    title: string;
    topic_code: string;
  };
  headings: ObjectiveHeading[];
}

// DTO for creating a new objective item
export interface CreateObjectiveItemDto {
  text: string;
}

// DTO for creating a new objective heading
export interface CreateObjectiveHeadingDto {
  heading: string;
  items: CreateObjectiveItemDto[];
}

// DTO for creating a new objective
export interface CreateObjectiveDto {
  topic_id: string;
  objectives: CreateObjectiveHeadingDto[];
}

// DTO for creating a new item for an existing heading
export interface AddItemDto {
  text: string;
  heading_id: string;
  order_index?: number;
}

// SWR keys for data fetching
export const OBJECTIVES_SWR_KEY = SWR_KEYS.OBJECTIVES;
export const OBJECTIVE_BY_ID_SWR_KEY = (id: string) => `${SWR_KEYS.OBJECTIVE_BY_ID(id)}`;
export const OBJECTIVES_BY_TOPIC_SWR_KEY = (topicId: string) => `${SWR_KEYS.OBJECTIVES_BY_TOPIC(topicId)}`;

// API endpoints using constants
const ENDPOINTS = {
  OBJECTIVES: API_ENDPOINTS.OBJECTIVES,
  OBJECTIVE_BY_ID: (id: string) => `${API_ENDPOINTS.OBJECTIVE_BY_ID}/${id}`,
  OBJECTIVES_BY_TOPIC: (topicId: string) => `${API_ENDPOINTS.OBJECTIVES_BY_TOPIC}/${topicId}`,
  OBJECTIVE_HEADINGS: (headingId: string) => `${API_ENDPOINTS.OBJECTIVE_HEADINGS}/${headingId}`,
  OBJECTIVE_ITEMS: (itemId: string) => `${API_ENDPOINTS.OBJECTIVE_ITEMS}/${itemId}`,
};

// Create a new objective with headings and items
export async function createObjective(createDto: CreateObjectiveDto): Promise<ObjectiveResponse> {
  console.log("Creating objective with data:", JSON.stringify(createDto));
  try {
    const result = await apiRequest.post<ObjectiveResponse>(ENDPOINTS.OBJECTIVES, createDto);
    console.log("Objective creation response:", result);
    return result;
  } catch (error) {
    console.error("Error in createObjective API call:", error);
    throw error;
  }
}

// Get an objective by its ID
export async function getObjectiveById(id: string): Promise<ObjectiveResponse> {
  return await apiRequest.get<ObjectiveResponse>(ENDPOINTS.OBJECTIVE_BY_ID(id));
}

// Get objectives by topic ID
export async function getObjectivesByTopicId(topicId: string): Promise<ObjectiveResponse[] | null> {
  try {
    const objectives = await apiRequest.get<ObjectiveResponse[]>(ENDPOINTS.OBJECTIVES_BY_TOPIC(topicId));
    
    // If no objectives found, return null to trigger creation of a new objective
    if (!objectives || objectives.length === 0) {
      return null;
    }
    
    return objectives;
  } catch (error) {
    console.error("Failed to get objectives by topic ID:", error);
    return null;
  }
}

// Create a new heading for an existing objective
export async function createHeadingForObjective(
  objectiveId: string, 
  heading: string, 
  items: CreateObjectiveItemDto[] = []
): Promise<ObjectiveHeading | null> {
  // Since we don't have a direct API for this, we'd need to either:
  // 1. Delete the objective and recreate it with the new heading
  // 2. Use a workaround by directly accessing the database
  
  // For now, we'll just return a temporary heading that the UI can use
  const tempHeading: ObjectiveHeading = {
    id: `temp-${Date.now()}`,
    heading,
    order_index: 999, // We don't know what the next order should be
    objective_id: objectiveId,
    items: items.map((item, idx) => ({
      id: `temp-item-${Date.now()}-${idx}`,
      text: item.text,
      order_index: idx + 1
    }))
  };
  
  return tempHeading;
}

// Create a new item for an existing heading
export async function createItem(headingId: string, text: string): Promise<ObjectiveItem> {
  // Workaround: Since there's no API endpoint to add an item to a heading,
  // create a temporary item for the UI
  const tempItem: ObjectiveItem = {
    id: `temp-item-${Date.now()}`,
    text,
    order_index: 9999,
    heading_id: headingId,
    updated_at: new Date().toISOString()
  };
  
  return tempItem;
}

// Update a heading
export async function updateHeading(headingId: string, heading: string): Promise<any> {
  return await apiRequest.put(ENDPOINTS.OBJECTIVE_HEADINGS(headingId), { heading });
}

// Delete a heading
export async function deleteHeading(headingId: string): Promise<any> {
  return await apiRequest.delete(ENDPOINTS.OBJECTIVE_HEADINGS(headingId));
}

// Update an item
export async function updateItem(itemId: string, text: string): Promise<any> {
  return await apiRequest.put(ENDPOINTS.OBJECTIVE_ITEMS(itemId), { text });
}

// Delete an item
export async function deleteItem(itemId: string): Promise<any> {
  return await apiRequest.delete(ENDPOINTS.OBJECTIVE_ITEMS(itemId));
}

// Create or update objectives for a topic
export async function createOrUpdateObjective(createDto: CreateObjectiveDto): Promise<ObjectiveResponse> {
  console.log("Creating or updating objective with data:", JSON.stringify(createDto));
  try {
    // First check if objectives already exist for this topic
    const existingObjectives = await getObjectivesByTopicId(createDto.topic_id);
    
    if (existingObjectives && existingObjectives.length > 0) {
      console.log("Found existing objectives for topic, using PUT endpoint to update");
      // If objectives exist, we'll use the PUT endpoint to update
      const existingObjectiveId = existingObjectives[0].id;
      
      // Use PUT to update the existing objective
      const result = await apiRequest.put<ObjectiveResponse>(
        ENDPOINTS.OBJECTIVE_BY_ID(existingObjectiveId), 
        createDto
      );
      console.log("Objective update response:", result);
      return result;
    } else {
      // No existing objectives, create new
      console.log("No existing objectives found, creating new");
      const result = await apiRequest.post<ObjectiveResponse>(ENDPOINTS.OBJECTIVES, createDto);
      console.log("Objective creation response:", result);
      return result;
    }
  } catch (error) {
    console.error("Error in createOrUpdateObjective API call:", error);
    throw error;
  }
} 

// Validation function for objective data
export const validateObjective = (objectiveData: CreateObjectiveDto): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validate topic_id
  if (!objectiveData.topic_id) {
    errors.topic_id = 'Topic ID is required';
  }

  // Validate objectives array
  if (!objectiveData.objectives || !Array.isArray(objectiveData.objectives) || objectiveData.objectives.length === 0) {
    errors.objectives = 'At least one objective heading is required';
    return errors; // Early return if no objectives
  }

  // Validate each heading
  objectiveData.objectives.forEach((heading, idx) => {
    if (!heading.heading || heading.heading.trim() === '') {
      errors[`objectives[${idx}].heading`] = 'Heading text is required';
    }

    // Validate items within each heading
    if (!heading.items || !Array.isArray(heading.items) || heading.items.length === 0) {
      errors[`objectives[${idx}].items`] = 'At least one item is required for each heading';
    } else {
      heading.items.forEach((item, itemIdx) => {
        if (!item.text || item.text.trim() === '') {
          errors[`objectives[${idx}].items[${itemIdx}].text`] = 'Item text is required';
        }
      });
    }
  });

  return errors;
}; 
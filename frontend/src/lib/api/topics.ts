import { apiRequest } from "@/helpers/request";
import { API_ENDPOINTS } from "@/helpers/string_const";

export interface TopicResponse {
  id: string;
  topic_code: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export interface CreateTopicDto {
  topic_code: string;
  title: string;
  description: string;
  status?: "draft" | "published" | "archived";
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// API endpoints using constants
const ENDPOINTS = {
  TOPICS: API_ENDPOINTS.TOPICS,
  TOPIC_BY_ID: (id: string) => `${API_ENDPOINTS.TOPIC_BY_ID}/${id}`,
}

// SWR keys for caching and revalidation
export const TOPICS_SWR_KEY = 'topics';
export const TOPIC_BY_ID_SWR_KEY = (id: string) => `topics/${id}`;

// Get all topics
export const getAllTopics = async (): Promise<TopicResponse[]> => {
  return await apiRequest.get<TopicResponse[]>(ENDPOINTS.TOPICS);
}

// Create a new topic
export const createTopic = async (data: CreateTopicDto): Promise<TopicResponse> => {
  return await apiRequest.post<TopicResponse>(
    ENDPOINTS.TOPICS,
    {
      ...data,
      status: data.status || "draft"
    }
  );
}

// Get topic by ID
export const getTopicById = async (id: string): Promise<TopicResponse> => {
  return await apiRequest.get<TopicResponse>(ENDPOINTS.TOPIC_BY_ID(id));
}

// Update topic by ID
export const updateTopic = async (id: string, data: Partial<CreateTopicDto>): Promise<TopicResponse> => {
  return await apiRequest.patch<TopicResponse>(ENDPOINTS.TOPIC_BY_ID(id), data);
}

// Delete topic by ID
export const deleteTopic = async (id: string): Promise<void> => {
  await apiRequest.delete<void>(ENDPOINTS.TOPIC_BY_ID(id));
} 
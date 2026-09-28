import useSWR, { KeyedMutator } from 'swr';
import { useCallback } from 'react';
import { toast } from 'sonner';
import {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic as updateTopicApi,
  deleteTopic,
  TopicResponse,
  CreateTopicDto,
  TOPICS_SWR_KEY,
  TOPIC_BY_ID_SWR_KEY
} from '@/lib/api/topics';
import { useTopicsStore } from '@/store/slices/topics';
import { handleError } from '@/helpers/helpers';

// Import TopicStatus from the store
import type { TopicStatus } from '@/store/slices/topics';

// Type for the topics hook return
interface UseTopicsReturn {
  topics: TopicResponse[];
  isLoading: boolean;
  error: string | null;
  mutate: KeyedMutator<TopicResponse[]>;
  // Store state
  filteredTopics: TopicResponse[];
  selectedTopic: TopicResponse | null;
  searchTerm: string;
  selectedStatus: TopicStatus;
  // Store actions
  setSearchTerm: (term: string) => void;
  setSelectedStatus: (status: TopicStatus) => void;
  filterTopics: () => void;
  resetFilters: () => void;
  setTopics: (topics: TopicResponse[]) => void;
  addTopic: (topic: TopicResponse) => void;
  updateTopic: (topicId: string, updates: Partial<TopicResponse>) => void;
  removeTopic: (topicId: string) => void;
  setSelectedTopic: (topic: TopicResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Hook for fetching and managing topics
export const useTopics = (): UseTopicsReturn => {
  const store = useTopicsStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    TOPICS_SWR_KEY,
    getAllTopics,
    {
      onSuccess: (data) => {
        console.log('🟢 [useTopics] SWR success, setting topics in store:', data);
        store.setTopics(data || []);
        store.setLoading(false);
        store.setError(null);
      },
      onError: (error) => {
        console.error('🔴 [useTopics] SWR error:', {
          error,
          response: error?.response,
          data: error?.response?.data,
          status: error?.response?.status,
          message: error?.message
        });
        let errorMessage = 'Failed to load topics';
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        store.setError(errorMessage);
        store.setLoading(false);
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  // Update store loading state
  if (isLoading !== store.isLoading) {
    store.setLoading(isLoading);
  }

  return {
    topics: data || [],
    isLoading,
    error: error ? 'Failed to load topics' : null,
    mutate,
    // Store state
    filteredTopics: store.filteredTopics,
    selectedTopic: store.selectedTopic,
    searchTerm: store.searchTerm,
    selectedStatus: store.selectedStatus,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setSelectedStatus: store.setSelectedStatus,
    filterTopics: store.filterTopics,
    resetFilters: store.resetFilters,
    setTopics: store.setTopics,
    addTopic: store.addTopic,
    updateTopic: store.updateTopic,
    removeTopic: store.removeTopic,
    setSelectedTopic: store.setSelectedTopic,
    setLoading: store.setLoading,
    setError: store.setError,
  };
};

// Type for single topic hook return
interface UseTopicReturn {
  topic: TopicResponse | null;
  isLoading: boolean;
  error: string | null;
  mutate: KeyedMutator<TopicResponse | null>;
}

// Hook for fetching a single topic by ID
export const useTopic = (topicId: string | null): UseTopicReturn => {
  const store = useTopicsStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    topicId ? TOPIC_BY_ID_SWR_KEY(topicId) : null,
    () => topicId ? getTopicById(topicId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useTopic] SWR success for topic:', topicId);
        if (data) {
          store.setSelectedTopic(data);
        }
        store.setError(null);
      },
      onError: (error) => {
        console.error('🔴 [useTopic] SWR error:', error);
        let errorMessage = `Failed to load topic ${topicId}`;
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        store.setError(errorMessage);
      },
      revalidateOnFocus: false,
    }
  );

  return {
    topic: data || null,
    isLoading,
    error: error ? `Failed to load topic ${topicId}` : null,
    mutate,
  };
};

// Type for topic mutations hook return
interface UseTopicMutationsReturn {
  createTopic: (topicData: CreateTopicDto) => Promise<TopicResponse>;
  updateTopic: (topicId: string, topicData: Partial<CreateTopicDto>) => Promise<TopicResponse>;
  deleteTopic: (topicId: string) => Promise<void>;
  // Store state
  isSubmitting: boolean;
  formErrors: Record<string, string>;
  formMode: 'create' | 'edit' | 'view';
  isFormOpen: boolean;
  editingTopicId: string | null;
}

// Hook for topic mutations (create, update, delete)
export const useTopicMutations = (): UseTopicMutationsReturn => {
  const store = useTopicsStore();
  const { mutate } = useSWR(TOPICS_SWR_KEY);
  
  // Create a new topic
  const createTopicMutation = async (topicData: CreateTopicDto): Promise<TopicResponse> => {
    try {
      store.setSubmitting(true);
      store.clearFormErrors();
      
      const response = await createTopic(topicData);
      
      // Add the new topic to the store
      store.addTopic(response);
      toast.success('Topic created successfully');
      
      // Revalidate the topics list
      mutate();
      
      return response;
    } catch (error) {
      const errorMessage = handleError(error);
      store.setFormErrors({ general: errorMessage });
      throw error;
    } finally {
      store.setSubmitting(false);
    }
  };
  
  // Update an existing topic
  const updateTopicMutation = async (
    topicId: string, 
    topicData: Partial<CreateTopicDto>
  ): Promise<TopicResponse> => {
    try {
      store.setSubmitting(true);
      store.clearFormErrors();
      
      const response = await updateTopicApi(topicId, topicData);
      
      // Update the topic in the store
      store.updateTopic(topicId, response);
      toast.success('Topic updated successfully');
      
      // Revalidate the topics list
      mutate();
      
      return response;
    } catch (error) {
      const errorMessage = handleError(error);
      store.setFormErrors({ general: errorMessage });
      throw error;
    } finally {
      store.setSubmitting(false);
    }
  };
  
  // Delete a topic
  const deleteTopicMutation = async (topicId: string): Promise<void> => {
    try {
      store.setSubmitting(true);
      
      await deleteTopic(topicId);
      
      // Remove the topic from the store
      store.removeTopic(topicId);
      toast.success('Topic deleted successfully');
      
      // Revalidate the topics list
      mutate();
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      store.setSubmitting(false);
    }
  };
  
  return {
    createTopic: createTopicMutation,
    updateTopic: updateTopicMutation,
    deleteTopic: deleteTopicMutation,
    isSubmitting: store.isSubmitting,
    formErrors: store.formErrors,
    formMode: store.formMode,
    isFormOpen: store.isFormOpen,
    editingTopicId: store.editingTopicId,
  };
}; 
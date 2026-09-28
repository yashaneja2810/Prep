import { create } from 'zustand';
import { TopicResponse } from '@/lib/api/topics';

export type TopicStatus = 'draft' | 'published' | 'archived' | 'all';
type FormMode = 'create' | 'edit' | 'view';

interface TopicsState {
  // Data
  topics: TopicResponse[];
  filteredTopics: TopicResponse[];
  selectedTopic: TopicResponse | null;
  
  // Filters
  searchTerm: string;
  selectedStatus: TopicStatus;
  
  // Form State
  formMode: FormMode;
  isFormOpen: boolean;
  formErrors: Record<string, string>;
  editingTopicId: string | null;
  isSubmitting: boolean;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Data Actions
  setTopics: (topics: TopicResponse[]) => void;
  addTopic: (topic: TopicResponse) => void;
  updateTopic: (topicId: string, updates: Partial<TopicResponse>) => void;
  removeTopic: (topicId: string) => void;
  setSelectedTopic: (topic: TopicResponse | null) => void;
  
  // Filter Actions
  setSearchTerm: (term: string) => void;
  setSelectedStatus: (status: TopicStatus) => void;
  filterTopics: () => void;
  resetFilters: () => void;
  
  // Form Actions
  setFormMode: (mode: FormMode) => void;
  toggleForm: (open: boolean) => void;
  setFormErrors: (errors: Record<string, string>) => void;
  clearFormErrors: () => void;
  setEditingTopicId: (topicId: string | null) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // Loading Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Helper Functions
  getTopicById: (topicId: string) => TopicResponse | null;
  getDraftTopics: () => TopicResponse[];
  getPublishedTopics: () => TopicResponse[];
  getArchivedTopics: () => TopicResponse[];
}

export const useTopicsStore = create<TopicsState>((set, get) => ({
  // Initial state
  topics: [],
  filteredTopics: [],
  selectedTopic: null,
  searchTerm: "",
  selectedStatus: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingTopicId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setTopics: (topics) => {
    // Ensure topics is always an array
    const safeTopics = Array.isArray(topics) ? topics : [];
    console.log('🟢 [TOPIC_STORE] setTopics called with', safeTopics.length, 'topics');
    const currentTopics = get().topics;
    
    // Only update if data actually changed
    if (JSON.stringify(currentTopics) !== JSON.stringify(safeTopics)) {
      console.log('🟢 [TOPIC_STORE] Topics data changed, updating state');
      set({ topics: safeTopics });
      // Use setTimeout to prevent cascading updates
      setTimeout(() => {
        console.log('🟢 [TOPIC_STORE] Applying filters after state update');
        get().filterTopics();
      }, 0);
    } else {
      console.log('🟢 [TOPIC_STORE] Topics data unchanged, skipping update');
    }
  },

  addTopic: (topic) => {
    console.log('🟢 [TOPIC_STORE] addTopic called for:', topic.id);
    const { topics } = get();
    const safeTopics = Array.isArray(topics) ? topics : [];
    const updatedTopics = [topic, ...safeTopics];
    set({ topics: updatedTopics });
    get().filterTopics();
  },

  updateTopic: (topicId, updates) => {
    console.log('🟢 [TOPIC_STORE] updateTopic called for:', topicId);
    const { topics } = get();
    const safeTopics = Array.isArray(topics) ? topics : [];
    const updatedTopics = safeTopics.map(topic => 
      topic.id === topicId ? { ...topic, ...updates } : topic
    );
    set({ topics: updatedTopics });
    get().filterTopics();
  },

  removeTopic: (topicId) => {
    console.log('🟢 [TOPIC_STORE] removeTopic called for:', topicId);
    const { topics } = get();
    const safeTopics = Array.isArray(topics) ? topics : [];
    const updatedTopics = safeTopics.filter(topic => topic.id !== topicId);
    set({ topics: updatedTopics });
    get().filterTopics();
  },

  setSelectedTopic: (topic) => {
    set({ selectedTopic: topic });
  },

  // Filter Actions
  setSearchTerm: (term) => {
    set({ searchTerm: term });
    get().filterTopics();
  },

  setSelectedStatus: (status) => {
    set({ selectedStatus: status });
    get().filterTopics();
  },

  filterTopics: () => {
    const { topics, searchTerm, selectedStatus } = get();
    const safeTopics = Array.isArray(topics) ? topics : [];
    
    // Apply filters
    const filtered = safeTopics.filter(topic => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.topic_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = selectedStatus === "all" || topic.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    set({ filteredTopics: filtered });
  },

  resetFilters: () => {
    set({ 
      searchTerm: "",
      selectedStatus: "all"
    });
    get().filterTopics();
  },

  // Form Actions
  setFormMode: (mode) => {
    set({ formMode: mode });
  },

  toggleForm: (open) => {
    set({ isFormOpen: open });
    if (!open) {
      get().clearFormErrors();
    }
  },

  setFormErrors: (errors) => {
    set({ formErrors: errors });
  },

  clearFormErrors: () => {
    set({ formErrors: {} });
  },

  setEditingTopicId: (topicId) => {
    set({ editingTopicId: topicId });
  },

  setSubmitting: (submitting) => {
    set({ isSubmitting: submitting });
  },

  // Loading Actions
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  // Helper Functions
  getTopicById: (topicId) => {
    const { topics } = get();
    const safeTopics = Array.isArray(topics) ? topics : [];
    return safeTopics.find(topic => topic.id === topicId) || null;
  },

  getDraftTopics: () => {
    const { topics } = get();
    const safeTopics = Array.isArray(topics) ? topics : [];
    return safeTopics.filter(topic => topic.status === "draft");
  },

  getPublishedTopics: () => {
    const { topics } = get();
    const safeTopics = Array.isArray(topics) ? topics : [];
    return safeTopics.filter(topic => topic.status === "published");
  },

  getArchivedTopics: () => {
    const { topics } = get();
    const safeTopics = Array.isArray(topics) ? topics : [];
    return safeTopics.filter(topic => topic.status === "archived");
  }
})); 
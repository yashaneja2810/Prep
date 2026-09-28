import { create } from 'zustand'

interface UIState {
  // Modal states
  isModalOpen: boolean
  modalType: string | null
  modalData: any
  
  // Sidebar states
  isSidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Loading states
  isGlobalLoading: boolean
  loadingMessage: string
  
  // Notification states
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: number
  }>
  
  // Actions
  openModal: (type: string, data?: any) => void
  closeModal: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setGlobalLoading: (loading: boolean, message?: string) => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  modalType: null,
  modalData: null,
  isSidebarOpen: true,
  sidebarCollapsed: false,
  isGlobalLoading: false,
  loadingMessage: '',
  notifications: [],

  // Actions
  openModal: (type, data = null) =>
    set({
      isModalOpen: true,
      modalType: type,
      modalData: data,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      modalType: null,
      modalData: null,
    }),

  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  setGlobalLoading: (loading, message = '') =>
    set({
      isGlobalLoading: loading,
      loadingMessage: message,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () =>
    set({ notifications: [] }),
})) 
import { create } from 'zustand';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Navigation
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Modals
  modals: {
    login: boolean;
    register: boolean;
    createWork: boolean;
    editProfile: boolean;
    confirmDialog: boolean;
  };
  
  // Loading states
  loading: {
    global: boolean;
    works: boolean;
    comments: boolean;
    profile: boolean;
  };
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>;
  
  // Search
  searchQuery: string;
  searchFilters: {
    genre: string;
    author: string;
    sortBy: 'created_at' | 'views' | 'likes' | 'title';
    sortOrder: 'asc' | 'desc';
  };
}

interface UIActions {
  // Theme actions
  setTheme: (theme: UIState['theme']) => void;
  
  // Navigation actions
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Modal actions
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // Loading actions
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchFilter: <K extends keyof UIState['searchFilters']>(
    key: K,
    value: UIState['searchFilters'][K]
  ) => void;
  clearSearchFilters: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  theme: 'system',
  sidebarOpen: false,
  mobileMenuOpen: false,
  modals: {
    login: false,
    register: false,
    createWork: false,
    editProfile: false,
    confirmDialog: false,
  },
  loading: {
    global: false,
    works: false,
    comments: false,
    profile: false,
  },
  notifications: [],
  searchQuery: '',
  searchFilters: {
    genre: '',
    author: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  },

  // Actions
  setTheme: (theme) => set({ theme }),
  
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  
  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true }
  })),
  
  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false }
  })),
  
  closeAllModals: () => set((state) => ({
    modals: Object.keys(state.modals).reduce((acc, key) => ({
      ...acc,
      [key]: false
    }), {} as UIState['modals'])
  })),
  
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  
  setGlobalLoading: (loading) => set((state) => ({
    loading: { ...state.loading, global: loading }
  })),
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Auto remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  setSearchFilter: (key, value) => set((state) => ({
    searchFilters: { ...state.searchFilters, [key]: value }
  })),
  
  clearSearchFilters: () => set({
    searchQuery: '',
    searchFilters: {
      genre: '',
      author: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    }
  }),
}));

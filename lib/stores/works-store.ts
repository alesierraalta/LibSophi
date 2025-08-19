import { create } from 'zustand';
import { WorkType, CreateWorkType, UpdateWorkType } from '../validations';

interface WorksState {
  works: WorkType[];
  currentWork: WorkType | null;
  favorites: string[]; // Work IDs
  userWorks: WorkType[];
  searchResults: WorkType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  filters: {
    genre: string;
    author: string;
    tags: string[];
    published: boolean | null;
  };
  loading: boolean;
  error: string | null;
}

interface WorksActions {
  // Work management
  setWorks: (works: WorkType[]) => void;
  addWork: (work: WorkType) => void;
  updateWork: (id: string, updates: Partial<WorkType>) => void;
  removeWork: (id: string) => void;
  setCurrentWork: (work: WorkType | null) => void;
  
  // User works
  setUserWorks: (works: WorkType[]) => void;
  addUserWork: (work: WorkType) => void;
  updateUserWork: (id: string, updates: Partial<WorkType>) => void;
  removeUserWork: (id: string) => void;
  
  // Favorites
  setFavorites: (favorites: string[]) => void;
  addFavorite: (workId: string) => void;
  removeFavorite: (workId: string) => void;
  isFavorite: (workId: string) => boolean;
  
  // Search and filters
  setSearchResults: (results: WorkType[]) => void;
  setFilters: (filters: Partial<WorksState['filters']>) => void;
  clearFilters: () => void;
  
  // Pagination
  setPagination: (pagination: Partial<WorksState['pagination']>) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  
  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Work interactions
  incrementViews: (workId: string) => void;
  incrementLikes: (workId: string) => void;
  decrementLikes: (workId: string) => void;
  
  // Utility functions
  getWorkById: (id: string) => WorkType | undefined;
  getWorksByAuthor: (authorId: string) => WorkType[];
  getWorksByGenre: (genre: string) => WorkType[];
  searchWorks: (query: string) => WorkType[];
}

type WorksStore = WorksState & WorksActions;

export const useWorksStore = create<WorksStore>((set, get) => ({
  // Initial state
  works: [],
  currentWork: null,
  favorites: [],
  userWorks: [],
  searchResults: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },
  filters: {
    genre: '',
    author: '',
    tags: [],
    published: null,
  },
  loading: false,
  error: null,

  // Actions
  setWorks: (works) => set({ works }),
  
  addWork: (work) => set((state) => ({ 
    works: [work, ...state.works] 
  })),
  
  updateWork: (id, updates) => set((state) => ({
    works: state.works.map(work => 
      work.id === id ? { ...work, ...updates } : work
    ),
    currentWork: state.currentWork?.id === id 
      ? { ...state.currentWork, ...updates } 
      : state.currentWork,
  })),
  
  removeWork: (id) => set((state) => ({
    works: state.works.filter(work => work.id !== id),
    currentWork: state.currentWork?.id === id ? null : state.currentWork,
  })),
  
  setCurrentWork: (currentWork) => set({ currentWork }),
  
  setUserWorks: (userWorks) => set({ userWorks }),
  
  addUserWork: (work) => set((state) => ({ 
    userWorks: [work, ...state.userWorks] 
  })),
  
  updateUserWork: (id, updates) => set((state) => ({
    userWorks: state.userWorks.map(work => 
      work.id === id ? { ...work, ...updates } : work
    ),
  })),
  
  removeUserWork: (id) => set((state) => ({
    userWorks: state.userWorks.filter(work => work.id !== id),
  })),
  
  setFavorites: (favorites) => set({ favorites }),
  
  addFavorite: (workId) => set((state) => ({
    favorites: [...state.favorites, workId]
  })),
  
  removeFavorite: (workId) => set((state) => ({
    favorites: state.favorites.filter(id => id !== workId)
  })),
  
  isFavorite: (workId) => get().favorites.includes(workId),
  
  setSearchResults: (searchResults) => set({ searchResults }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  clearFilters: () => set({
    filters: {
      genre: '',
      author: '',
      tags: [],
      published: null,
    }
  }),
  
  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination }
  })),
  
  nextPage: () => set((state) => ({
    pagination: { 
      ...state.pagination, 
      page: state.pagination.page + 1 
    }
  })),
  
  prevPage: () => set((state) => ({
    pagination: { 
      ...state.pagination, 
      page: Math.max(1, state.pagination.page - 1) 
    }
  })),
  
  setPage: (page) => set((state) => ({
    pagination: { ...state.pagination, page }
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  incrementViews: (workId) => set((state) => ({
    works: state.works.map(work => 
      work.id === workId 
        ? { ...work, views: work.views + 1 }
        : work
    ),
    currentWork: state.currentWork?.id === workId
      ? { ...state.currentWork, views: state.currentWork.views + 1 }
      : state.currentWork,
  })),
  
  incrementLikes: (workId) => set((state) => ({
    works: state.works.map(work => 
      work.id === workId 
        ? { ...work, likes: work.likes + 1 }
        : work
    ),
    currentWork: state.currentWork?.id === workId
      ? { ...state.currentWork, likes: state.currentWork.likes + 1 }
      : state.currentWork,
  })),
  
  decrementLikes: (workId) => set((state) => ({
    works: state.works.map(work => 
      work.id === workId 
        ? { ...work, likes: Math.max(0, work.likes - 1) }
        : work
    ),
    currentWork: state.currentWork?.id === workId
      ? { ...state.currentWork, likes: Math.max(0, state.currentWork.likes - 1) }
      : state.currentWork,
  })),
  
  getWorkById: (id) => get().works.find(work => work.id === id),
  
  getWorksByAuthor: (authorId) => 
    get().works.filter(work => work.author_id === authorId),
  
  getWorksByGenre: (genre) => 
    get().works.filter(work => work.genre.toLowerCase() === genre.toLowerCase()),
  
  searchWorks: (query) => {
    const lowercaseQuery = query.toLowerCase();
    return get().works.filter(work => 
      work.title.toLowerCase().includes(lowercaseQuery) ||
      work.description.toLowerCase().includes(lowercaseQuery) ||
      work.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  },
}));

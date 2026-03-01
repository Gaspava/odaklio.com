import { create } from "zustand";
import type { SearchQuery } from "@/types/search";

interface SearchState {
  history: SearchQuery[];
  addQuery: (query: string) => void;
  removeQuery: (id: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  history: [],
  addQuery: (query) =>
    set((state) => ({
      history: [
        {
          id: Date.now().toString(),
          query,
          timestamp: new Date(),
          resultCount: 0,
        },
        ...state.history,
      ],
    })),
  removeQuery: (id) =>
    set((state) => ({
      history: state.history.filter((q) => q.id !== id),
    })),
  clearHistory: () => set({ history: [] }),
}));

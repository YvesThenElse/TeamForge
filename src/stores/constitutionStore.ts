import { create } from "zustand";
import { Constitution, ConstitutionCategory } from "@/types/constitution";

interface ConstitutionState {
  library: Constitution[];
  categories: ConstitutionCategory[];
  selectedConstitution: Constitution | null;
  searchQuery: string;
  selectedCategory: ConstitutionCategory | "all";
  isLoading: boolean;

  // Actions
  setLibrary: (library: Constitution[]) => void;
  setCategories: (categories: ConstitutionCategory[]) => void;
  setSelectedConstitution: (constitution: Constitution | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: ConstitutionCategory | "all") => void;
  setIsLoading: (isLoading: boolean) => void;
  clearSelection: () => void;

  // Computed
  getFilteredConstitutions: () => Constitution[];
}

export const useConstitutionStore = create<ConstitutionState>((set, get) => ({
  library: [],
  categories: [],
  selectedConstitution: null,
  searchQuery: "",
  selectedCategory: "all",
  isLoading: false,

  setLibrary: (library) => set({ library }),
  setCategories: (categories) => set({ categories }),
  setSelectedConstitution: (constitution) => set({ selectedConstitution: constitution }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setIsLoading: (isLoading) => set({ isLoading }),
  clearSelection: () => set({ selectedConstitution: null }),

  getFilteredConstitutions: () => {
    const { library, searchQuery, selectedCategory } = get();

    let filtered = library;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    // Filter by search query (minimum 3 characters)
    if (searchQuery.trim().length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          c.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  },
}));

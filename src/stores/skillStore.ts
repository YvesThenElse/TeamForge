import { create } from "zustand";
import { Skill } from "@/types/skill";

interface SkillState {
  library: Skill[];
  categories: string[];
  selectedSkills: string[]; // skill IDs
  skillOrder: Map<string, number>; // skillId -> order
  searchQuery: string;
  selectedCategory: string | "all";
  isLoading: boolean;

  // Actions
  setLibrary: (library: Skill[]) => void;
  setCategories: (categories: string[]) => void;
  addSkill: (skillId: string) => void;
  removeSkill: (skillId: string) => void;
  toggleSkill: (skillId: string) => void;
  clearSkills: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | "all") => void;
  setIsLoading: (isLoading: boolean) => void;

  // Order actions
  moveSkillUp: (skillId: string) => void;
  moveSkillDown: (skillId: string) => void;
  setSkillOrder: (skillId: string, order: number) => void;

  // Computed
  getFilteredSkills: () => Skill[];
  getSelectedSkillObjects: () => Skill[];
  getOrderedSkills: () => Skill[];
}

export const useSkillStore = create<SkillState>((set, get) => ({
  library: [],
  categories: [],
  selectedSkills: [],
  skillOrder: new Map(),
  searchQuery: "",
  selectedCategory: "all",
  isLoading: false,

  setLibrary: (library) => {
    // Extract unique categories
    const categories = Array.from(
      new Set(library.map((s) => s.category).filter(Boolean))
    ).sort() as string[];
    set({ library, categories });
  },

  setCategories: (categories) => set({ categories }),

  addSkill: (skillId) =>
    set((state) => {
      if (state.selectedSkills.includes(skillId)) {
        return state;
      }
      const newSkills = [...state.selectedSkills, skillId];
      const newOrder = new Map(state.skillOrder);
      const maxOrder = Math.max(0, ...Array.from(newOrder.values()));
      newOrder.set(skillId, maxOrder + 1);
      return {
        selectedSkills: newSkills,
        skillOrder: newOrder,
      };
    }),

  removeSkill: (skillId) =>
    set((state) => {
      const newOrder = new Map(state.skillOrder);
      newOrder.delete(skillId);
      return {
        selectedSkills: state.selectedSkills.filter((id) => id !== skillId),
        skillOrder: newOrder,
      };
    }),

  toggleSkill: (skillId) =>
    set((state) => {
      if (state.selectedSkills.includes(skillId)) {
        const newOrder = new Map(state.skillOrder);
        newOrder.delete(skillId);
        return {
          selectedSkills: state.selectedSkills.filter((id) => id !== skillId),
          skillOrder: newOrder,
        };
      } else {
        const newSkills = [...state.selectedSkills, skillId];
        const newOrder = new Map(state.skillOrder);
        const maxOrder = Math.max(0, ...Array.from(newOrder.values()));
        newOrder.set(skillId, maxOrder + 1);
        return {
          selectedSkills: newSkills,
          skillOrder: newOrder,
        };
      }
    }),

  clearSkills: () => set({ selectedSkills: [], skillOrder: new Map() }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Order actions
  moveSkillUp: (skillId) =>
    set((state) => {
      const currentOrder = state.skillOrder.get(skillId);
      if (currentOrder === undefined || currentOrder === 1) return state;

      const newOrder = new Map(state.skillOrder);
      const swapSkill = Array.from(newOrder.entries()).find(
        ([, order]) => order === currentOrder - 1
      );

      if (swapSkill) {
        newOrder.set(skillId, currentOrder - 1);
        newOrder.set(swapSkill[0], currentOrder);
      }

      return { skillOrder: newOrder };
    }),

  moveSkillDown: (skillId) =>
    set((state) => {
      const currentOrder = state.skillOrder.get(skillId);
      if (currentOrder === undefined) return state;

      const maxOrder = Math.max(...Array.from(state.skillOrder.values()));
      if (currentOrder === maxOrder) return state;

      const newOrder = new Map(state.skillOrder);
      const swapSkill = Array.from(newOrder.entries()).find(
        ([, order]) => order === currentOrder + 1
      );

      if (swapSkill) {
        newOrder.set(skillId, currentOrder + 1);
        newOrder.set(swapSkill[0], currentOrder);
      }

      return { skillOrder: newOrder };
    }),

  setSkillOrder: (skillId, order) =>
    set((state) => {
      const newOrder = new Map(state.skillOrder);
      newOrder.set(skillId, order);
      return { skillOrder: newOrder };
    }),

  // Computed
  getFilteredSkills: () => {
    const { library, searchQuery, selectedCategory } = get();

    let filtered = library;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((skill) => skill.category === selectedCategory);
    }

    // Filter by search query (minimum 3 characters)
    if (searchQuery.trim().length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  },

  getSelectedSkillObjects: () => {
    const { library, selectedSkills } = get();
    return library.filter((skill) => selectedSkills.includes(skill.id));
  },

  getOrderedSkills: () => {
    const { library, selectedSkills, skillOrder } = get();
    const skills = library.filter((skill) => selectedSkills.includes(skill.id));

    return skills.sort((a, b) => {
      const orderA = skillOrder.get(a.id) || 0;
      const orderB = skillOrder.get(b.id) || 0;
      return orderA - orderB;
    });
  },
}));

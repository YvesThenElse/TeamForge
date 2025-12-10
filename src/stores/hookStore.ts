import { create } from "zustand";
import { Hook, HookCategory } from "@/types/hook";

interface HookState {
  library: Hook[];
  categories: HookCategory[];
  selectedHooks: string[]; // hook IDs
  hookOrder: Map<string, number>; // hookId -> order
  searchQuery: string;
  selectedCategory: HookCategory | "all";
  isLoading: boolean;

  // Actions
  setLibrary: (library: Hook[]) => void;
  setCategories: (categories: HookCategory[]) => void;
  addHook: (hookId: string) => void;
  removeHook: (hookId: string) => void;
  toggleHook: (hookId: string) => void;
  clearHooks: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: HookCategory | "all") => void;
  setIsLoading: (isLoading: boolean) => void;

  // Order actions
  moveHookUp: (hookId: string) => void;
  moveHookDown: (hookId: string) => void;
  setHookOrder: (hookId: string, order: number) => void;

  // Computed
  getFilteredHooks: () => Hook[];
  getSelectedHookObjects: () => Hook[];
  getOrderedHooks: () => Hook[];
}

export const useHookStore = create<HookState>((set, get) => ({
  library: [],
  categories: [],
  selectedHooks: [],
  hookOrder: new Map(),
  searchQuery: "",
  selectedCategory: "all",
  isLoading: false,

  setLibrary: (library) => {
    // Extract unique categories
    const categories = Array.from(
      new Set(library.map((h) => h.category).filter(Boolean))
    ).sort() as HookCategory[];
    set({ library, categories });
  },

  setCategories: (categories) => set({ categories }),

  addHook: (hookId) =>
    set((state) => {
      if (state.selectedHooks.includes(hookId)) {
        return state;
      }
      const newHooks = [...state.selectedHooks, hookId];
      const newOrder = new Map(state.hookOrder);
      const maxOrder = Math.max(0, ...Array.from(newOrder.values()));
      newOrder.set(hookId, maxOrder + 1);
      return {
        selectedHooks: newHooks,
        hookOrder: newOrder,
      };
    }),

  removeHook: (hookId) =>
    set((state) => {
      const newOrder = new Map(state.hookOrder);
      newOrder.delete(hookId);
      return {
        selectedHooks: state.selectedHooks.filter((id) => id !== hookId),
        hookOrder: newOrder,
      };
    }),

  toggleHook: (hookId) =>
    set((state) => {
      if (state.selectedHooks.includes(hookId)) {
        const newOrder = new Map(state.hookOrder);
        newOrder.delete(hookId);
        return {
          selectedHooks: state.selectedHooks.filter((id) => id !== hookId),
          hookOrder: newOrder,
        };
      } else {
        const newHooks = [...state.selectedHooks, hookId];
        const newOrder = new Map(state.hookOrder);
        const maxOrder = Math.max(0, ...Array.from(newOrder.values()));
        newOrder.set(hookId, maxOrder + 1);
        return {
          selectedHooks: newHooks,
          hookOrder: newOrder,
        };
      }
    }),

  clearHooks: () => set({ selectedHooks: [], hookOrder: new Map() }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Order actions
  moveHookUp: (hookId) =>
    set((state) => {
      const currentOrder = state.hookOrder.get(hookId);
      if (currentOrder === undefined || currentOrder === 1) return state;

      const newOrder = new Map(state.hookOrder);
      const swapHook = Array.from(newOrder.entries()).find(
        ([, order]) => order === currentOrder - 1
      );

      if (swapHook) {
        newOrder.set(hookId, currentOrder - 1);
        newOrder.set(swapHook[0], currentOrder);
      }

      return { hookOrder: newOrder };
    }),

  moveHookDown: (hookId) =>
    set((state) => {
      const currentOrder = state.hookOrder.get(hookId);
      if (currentOrder === undefined) return state;

      const maxOrder = Math.max(...Array.from(state.hookOrder.values()));
      if (currentOrder === maxOrder) return state;

      const newOrder = new Map(state.hookOrder);
      const swapHook = Array.from(newOrder.entries()).find(
        ([, order]) => order === currentOrder + 1
      );

      if (swapHook) {
        newOrder.set(hookId, currentOrder + 1);
        newOrder.set(swapHook[0], currentOrder);
      }

      return { hookOrder: newOrder };
    }),

  setHookOrder: (hookId, order) =>
    set((state) => {
      const newOrder = new Map(state.hookOrder);
      newOrder.set(hookId, order);
      return { hookOrder: newOrder };
    }),

  // Computed
  getFilteredHooks: () => {
    const { library, searchQuery, selectedCategory } = get();

    let filtered = library;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((hook) => hook.category === selectedCategory);
    }

    // Filter by search query (minimum 3 characters)
    if (searchQuery.trim().length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (hook) =>
          hook.name.toLowerCase().includes(query) ||
          hook.description.toLowerCase().includes(query) ||
          hook.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          hook.event.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  getSelectedHookObjects: () => {
    const { library, selectedHooks } = get();
    return library.filter((hook) => selectedHooks.includes(hook.id));
  },

  getOrderedHooks: () => {
    const { library, selectedHooks, hookOrder } = get();
    const hooks = library.filter((hook) => selectedHooks.includes(hook.id));

    return hooks.sort((a, b) => {
      const orderA = hookOrder.get(a.id) || 0;
      const orderB = hookOrder.get(b.id) || 0;
      return orderA - orderB;
    });
  },
}));

import { create } from "zustand";
import { McpServer, McpCategory } from "@/types/mcp";

interface McpState {
  library: McpServer[];
  categories: McpCategory[];
  selectedMcps: string[]; // mcp IDs
  mcpOrder: Map<string, number>; // mcpId -> order
  searchQuery: string;
  selectedCategory: McpCategory | "all";
  isLoading: boolean;

  // Actions
  setLibrary: (library: McpServer[]) => void;
  setCategories: (categories: McpCategory[]) => void;
  addMcp: (mcpId: string) => void;
  removeMcp: (mcpId: string) => void;
  toggleMcp: (mcpId: string) => void;
  clearMcps: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: McpCategory | "all") => void;
  setIsLoading: (isLoading: boolean) => void;

  // Order actions
  moveMcpUp: (mcpId: string) => void;
  moveMcpDown: (mcpId: string) => void;
  setMcpOrder: (mcpId: string, order: number) => void;

  // Computed
  getFilteredMcps: () => McpServer[];
  getSelectedMcpObjects: () => McpServer[];
  getOrderedMcps: () => McpServer[];
}

export const useMcpStore = create<McpState>((set, get) => ({
  library: [],
  categories: [],
  selectedMcps: [],
  mcpOrder: new Map(),
  searchQuery: "",
  selectedCategory: "all",
  isLoading: false,

  setLibrary: (library) => {
    // Extract unique categories
    const categories = Array.from(
      new Set(library.map((m) => m.category).filter(Boolean))
    ).sort() as McpCategory[];
    set({ library, categories });
  },

  setCategories: (categories) => set({ categories }),

  addMcp: (mcpId) =>
    set((state) => {
      if (state.selectedMcps.includes(mcpId)) {
        return state;
      }
      const newMcps = [...state.selectedMcps, mcpId];
      const newOrder = new Map(state.mcpOrder);
      const maxOrder = Math.max(0, ...Array.from(newOrder.values()));
      newOrder.set(mcpId, maxOrder + 1);
      return {
        selectedMcps: newMcps,
        mcpOrder: newOrder,
      };
    }),

  removeMcp: (mcpId) =>
    set((state) => {
      const newOrder = new Map(state.mcpOrder);
      newOrder.delete(mcpId);
      return {
        selectedMcps: state.selectedMcps.filter((id) => id !== mcpId),
        mcpOrder: newOrder,
      };
    }),

  toggleMcp: (mcpId) =>
    set((state) => {
      if (state.selectedMcps.includes(mcpId)) {
        const newOrder = new Map(state.mcpOrder);
        newOrder.delete(mcpId);
        return {
          selectedMcps: state.selectedMcps.filter((id) => id !== mcpId),
          mcpOrder: newOrder,
        };
      } else {
        const newMcps = [...state.selectedMcps, mcpId];
        const newOrder = new Map(state.mcpOrder);
        const maxOrder = Math.max(0, ...Array.from(newOrder.values()));
        newOrder.set(mcpId, maxOrder + 1);
        return {
          selectedMcps: newMcps,
          mcpOrder: newOrder,
        };
      }
    }),

  clearMcps: () => set({ selectedMcps: [], mcpOrder: new Map() }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Order actions
  moveMcpUp: (mcpId) =>
    set((state) => {
      const currentOrder = state.mcpOrder.get(mcpId);
      if (currentOrder === undefined || currentOrder === 1) return state;

      const newOrder = new Map(state.mcpOrder);
      const swapMcp = Array.from(newOrder.entries()).find(
        ([, order]) => order === currentOrder - 1
      );

      if (swapMcp) {
        newOrder.set(mcpId, currentOrder - 1);
        newOrder.set(swapMcp[0], currentOrder);
      }

      return { mcpOrder: newOrder };
    }),

  moveMcpDown: (mcpId) =>
    set((state) => {
      const currentOrder = state.mcpOrder.get(mcpId);
      if (currentOrder === undefined) return state;

      const maxOrder = Math.max(...Array.from(state.mcpOrder.values()));
      if (currentOrder === maxOrder) return state;

      const newOrder = new Map(state.mcpOrder);
      const swapMcp = Array.from(newOrder.entries()).find(
        ([, order]) => order === currentOrder + 1
      );

      if (swapMcp) {
        newOrder.set(mcpId, currentOrder + 1);
        newOrder.set(swapMcp[0], currentOrder);
      }

      return { mcpOrder: newOrder };
    }),

  setMcpOrder: (mcpId, order) =>
    set((state) => {
      const newOrder = new Map(state.mcpOrder);
      newOrder.set(mcpId, order);
      return { mcpOrder: newOrder };
    }),

  // Computed
  getFilteredMcps: () => {
    const { library, searchQuery, selectedCategory } = get();

    let filtered = library;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((mcp) => mcp.category === selectedCategory);
    }

    // Filter by search query (minimum 3 characters)
    if (searchQuery.trim().length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (mcp) =>
          mcp.name.toLowerCase().includes(query) ||
          mcp.description.toLowerCase().includes(query) ||
          mcp.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          mcp.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  getSelectedMcpObjects: () => {
    const { library, selectedMcps } = get();
    return library.filter((mcp) => selectedMcps.includes(mcp.id));
  },

  getOrderedMcps: () => {
    const { library, selectedMcps, mcpOrder } = get();
    const mcps = library.filter((mcp) => selectedMcps.includes(mcp.id));

    return mcps.sort((a, b) => {
      const orderA = mcpOrder.get(a.id) || 0;
      const orderB = mcpOrder.get(b.id) || 0;
      return orderA - orderB;
    });
  },
}));

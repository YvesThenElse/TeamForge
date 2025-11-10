import { create } from "zustand";
import { Agent, AgentCategory } from "@/types";

interface AgentState {
  library: Agent[];
  categories: AgentCategory[];
  selectedAgents: string[]; // agent IDs
  agentOrder: Map<string, number>; // agentId -> order
  searchQuery: string;
  selectedCategory: AgentCategory | "all";
  isLoading: boolean;
  workflowEnabled: boolean;

  // Actions
  setLibrary: (library: Agent[]) => void;
  setCategories: (categories: AgentCategory[]) => void;
  addAgent: (agentId: string) => void;
  removeAgent: (agentId: string) => void;
  toggleAgent: (agentId: string) => void;
  clearAgents: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: AgentCategory | "all") => void;
  setIsLoading: (isLoading: boolean) => void;

  // Workflow actions
  setWorkflowEnabled: (enabled: boolean) => void;
  moveAgentUp: (agentId: string) => void;
  moveAgentDown: (agentId: string) => void;
  setAgentOrder: (agentId: string, order: number) => void;

  // Computed
  getFilteredAgents: () => Agent[];
  getSelectedAgentObjects: () => Agent[];
  getOrderedAgents: () => Agent[];
}

export const useAgentStore = create<AgentState>((set, get) => ({
  library: [],
  categories: [],
  selectedAgents: [],
  agentOrder: new Map(),
  searchQuery: "",
  selectedCategory: "all",
  isLoading: false,
  workflowEnabled: false,

  setLibrary: (library) => set({ library }),
  setCategories: (categories) => set({ categories }),

  addAgent: (agentId) =>
    set((state) => {
      if (state.selectedAgents.includes(agentId)) {
        return state;
      }
      const newAgents = [...state.selectedAgents, agentId];
      const newOrder = new Map(state.agentOrder);
      // Assign next order number
      const maxOrder = Math.max(0, ...Array.from(newOrder.values()));
      newOrder.set(agentId, maxOrder + 1);
      return {
        selectedAgents: newAgents,
        agentOrder: newOrder,
      };
    }),

  removeAgent: (agentId) =>
    set((state) => {
      const newOrder = new Map(state.agentOrder);
      newOrder.delete(agentId);
      return {
        selectedAgents: state.selectedAgents.filter((id) => id !== agentId),
        agentOrder: newOrder,
      };
    }),

  toggleAgent: (agentId) =>
    set((state) => {
      if (state.selectedAgents.includes(agentId)) {
        const newOrder = new Map(state.agentOrder);
        newOrder.delete(agentId);
        return {
          selectedAgents: state.selectedAgents.filter((id) => id !== agentId),
          agentOrder: newOrder,
        };
      } else {
        const newAgents = [...state.selectedAgents, agentId];
        const newOrder = new Map(state.agentOrder);
        const maxOrder = Math.max(0, ...Array.from(newOrder.values()));
        newOrder.set(agentId, maxOrder + 1);
        return {
          selectedAgents: newAgents,
          agentOrder: newOrder,
        };
      }
    }),

  clearAgents: () => set({ selectedAgents: [], agentOrder: new Map() }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Workflow actions
  setWorkflowEnabled: (enabled) => set({ workflowEnabled: enabled }),

  moveAgentUp: (agentId) =>
    set((state) => {
      const currentOrder = state.agentOrder.get(agentId);
      if (currentOrder === undefined || currentOrder === 1) return state;

      const newOrder = new Map(state.agentOrder);
      // Find agent with order currentOrder - 1
      const swapAgent = Array.from(newOrder.entries()).find(
        ([, order]) => order === currentOrder - 1
      );

      if (swapAgent) {
        newOrder.set(agentId, currentOrder - 1);
        newOrder.set(swapAgent[0], currentOrder);
      }

      return { agentOrder: newOrder };
    }),

  moveAgentDown: (agentId) =>
    set((state) => {
      const currentOrder = state.agentOrder.get(agentId);
      if (currentOrder === undefined) return state;

      const maxOrder = Math.max(...Array.from(state.agentOrder.values()));
      if (currentOrder === maxOrder) return state;

      const newOrder = new Map(state.agentOrder);
      // Find agent with order currentOrder + 1
      const swapAgent = Array.from(newOrder.entries()).find(
        ([, order]) => order === currentOrder + 1
      );

      if (swapAgent) {
        newOrder.set(agentId, currentOrder + 1);
        newOrder.set(swapAgent[0], currentOrder);
      }

      return { agentOrder: newOrder };
    }),

  setAgentOrder: (agentId, order) =>
    set((state) => {
      const newOrder = new Map(state.agentOrder);
      newOrder.set(agentId, order);
      return { agentOrder: newOrder };
    }),

  getFilteredAgents: () => {
    const { library, searchQuery, selectedCategory } = get();

    let filtered = library;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((agent) => agent.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  },

  getSelectedAgentObjects: () => {
    const { library, selectedAgents } = get();
    return library.filter((agent) => selectedAgents.includes(agent.id));
  },

  getOrderedAgents: () => {
    const { library, selectedAgents, agentOrder } = get();
    const agents = library.filter((agent) => selectedAgents.includes(agent.id));

    // Sort by order
    return agents.sort((a, b) => {
      const orderA = agentOrder.get(a.id) || 0;
      const orderB = agentOrder.get(b.id) || 0;
      return orderA - orderB;
    });
  },
}));

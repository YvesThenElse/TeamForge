import { useCallback, useEffect } from "react";
import { useAgentStore } from "@/stores/agentStore";
import * as electron from "@/services/electron";

export function useAgents() {
  const {
    library,
    categories,
    selectedAgents,
    searchQuery,
    selectedCategory,
    isLoading,
    setLibrary,
    setCategories,
    addAgent,
    removeAgent,
    toggleAgent,
    clearAgents,
    setSearchQuery,
    setSelectedCategory,
    setIsLoading,
    getFilteredAgents,
    getSelectedAgentObjects,
  } = useAgentStore();

  // Load agent library on mount
  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await electron.getAgentLibrary();
      setLibrary(result.agents);
      setCategories(result.categories as any);
    } catch (err) {
      console.error("Failed to load agent library:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setLibrary, setCategories, setIsLoading]);

  // Search agents
  const searchAgentsInLibrary = useCallback(
    async (keyword: string) => {
      if (!keyword.trim()) {
        await loadLibrary();
        return;
      }

      setIsLoading(true);
      try {
        const results = await electron.searchAgents(keyword);
        setLibrary(results);
      } catch (err) {
        console.error("Failed to search agents:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [setLibrary, setIsLoading, loadLibrary]
  );

  // Get suggested agents for technologies
  const getSuggestedAgents = useCallback(
    async (technologies: string[]) => {
      setIsLoading(true);
      try {
        const suggested = await electron.getSuggestedAgents(technologies);
        // Auto-select suggested agents
        suggested.forEach((agent) => addAgent(agent.id));
        return suggested;
      } catch (err) {
        console.error("Failed to get suggested agents:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [addAgent, setIsLoading]
  );

  // Generate agent file content
  const generateAgentFile = useCallback(
    async (agentId: string, customInstructions?: string) => {
      try {
        return await electron.generateAgentFile(agentId, customInstructions);
      } catch (err) {
        console.error("Failed to generate agent file:", err);
        throw err;
      }
    },
    []
  );

  // Save agent to file system
  const saveAgent = useCallback(
    async (agentContent: string, filePath: string) => {
      try {
        return await electron.saveAgentFile(agentContent, filePath);
      } catch (err) {
        console.error("Failed to save agent file:", err);
        throw err;
      }
    },
    []
  );

  return {
    // State
    library,
    categories,
    selectedAgents,
    searchQuery,
    selectedCategory,
    isLoading,
    filteredAgents: getFilteredAgents(),
    selectedAgentObjects: getSelectedAgentObjects(),

    // Actions
    loadLibrary,
    searchAgentsInLibrary,
    getSuggestedAgents,
    addAgent,
    removeAgent,
    toggleAgent,
    clearAgents,
    setSearchQuery,
    setSelectedCategory,
    generateAgentFile,
    saveAgent,
  };
}

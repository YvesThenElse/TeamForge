import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentSecurity, SecurityConfig } from "@/types/security";

interface SecurityState {
  config: SecurityConfig;

  // Actions
  setAgentTools: (agentId: string, tools: string[]) => void;
  addToolToAgent: (agentId: string, tool: string) => void;
  removeToolFromAgent: (agentId: string, tool: string) => void;
  addToolToAllAgents: (tool: string, checked: boolean) => void;
  removeToolFromAllAgents: (tool: string) => void;
  setAgents: (agents: AgentSecurity[]) => void;
  loadFromProject: (projectConfig: SecurityConfig) => void;
  resetToDefaults: () => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      config: {
        agents: [],
      },

      setAgentTools: (agentId, tools) =>
        set((state) => ({
          config: {
            ...state.config,
            agents: state.config.agents.map((agent) =>
              agent.agentId === agentId
                ? { ...agent, tools }
                : agent
            ),
            lastModified: new Date().toISOString(),
          },
        })),

      addToolToAgent: (agentId, tool) =>
        set((state) => ({
          config: {
            ...state.config,
            agents: state.config.agents.map((agent) =>
              agent.agentId === agentId
                ? {
                    ...agent,
                    tools: agent.tools.includes(tool)
                      ? agent.tools
                      : [...agent.tools, tool],
                  }
                : agent
            ),
            lastModified: new Date().toISOString(),
          },
        })),

      removeToolFromAgent: (agentId, tool) =>
        set((state) => ({
          config: {
            ...state.config,
            agents: state.config.agents.map((agent) =>
              agent.agentId === agentId
                ? {
                    ...agent,
                    tools: agent.tools.filter((t) => t !== tool),
                  }
                : agent
            ),
            lastModified: new Date().toISOString(),
          },
        })),

      addToolToAllAgents: (tool, checked) =>
        set((state) => ({
          config: {
            ...state.config,
            agents: state.config.agents.map((agent) => {
              // If checked, add the tool; if unchecked, ensure it's in the list but user can toggle later
              const hasWildcard = agent.tools.includes("*");

              if (hasWildcard && tool !== "*") {
                // If agent has *, don't add individual tools
                return agent;
              }

              if (checked) {
                return {
                  ...agent,
                  tools: agent.tools.includes(tool)
                    ? agent.tools
                    : [...agent.tools, tool],
                };
              } else {
                // Add tool but don't check it (it will be available but unchecked)
                return agent;
              }
            }),
            lastModified: new Date().toISOString(),
          },
        })),

      removeToolFromAllAgents: (tool) =>
        set((state) => ({
          config: {
            ...state.config,
            agents: state.config.agents.map((agent) => ({
              ...agent,
              tools: agent.tools.filter((t) => t !== tool),
            })),
            lastModified: new Date().toISOString(),
          },
        })),

      setAgents: (agents) =>
        set({
          config: {
            agents,
            lastModified: new Date().toISOString(),
          },
        }),

      loadFromProject: (projectConfig) =>
        set({
          config: projectConfig,
        }),

      resetToDefaults: () =>
        set({
          config: {
            agents: [],
          },
        }),
    }),
    {
      name: "teamforge-security",
    }
  )
);

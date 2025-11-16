import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  // Agent Repository Settings
  agentRepositoryUrl: string;
  agentRepositoryBranch: string;
  agentRepositoryPath: string; // Local path where repo is cloned
  lastSync: string | null;
  autoSync: boolean; // Auto-sync on startup

  // Default Agent Configuration
  defaultModel: "sonnet" | "opus" | "haiku";
  defaultTools: string; // Default tools for agents (e.g., "*" or specific tools)

  // Application Settings
  theme: "light" | "dark" | "system";
  confirmDeploy: boolean; // Confirm before deploying agents

  // Actions
  setAgentRepositoryUrl: (url: string) => void;
  setAgentRepositoryBranch: (branch: string) => void;
  setAgentRepositoryPath: (path: string) => void;
  setLastSync: (timestamp: string) => void;
  setAutoSync: (autoSync: boolean) => void;
  setDefaultModel: (model: "sonnet" | "opus" | "haiku") => void;
  setDefaultTools: (tools: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setConfirmDeploy: (confirm: boolean) => void;
  resetSettings: () => void;
}

const DEFAULT_REPO_URL = "https://github.com/anthropics/teamforge-agents.git";
const DEFAULT_BRANCH = "main";
const DEFAULT_MODEL = "sonnet";
const DEFAULT_TOOLS = "*";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Repository settings
      agentRepositoryUrl: DEFAULT_REPO_URL,
      agentRepositoryBranch: DEFAULT_BRANCH,
      agentRepositoryPath: "",
      lastSync: null,
      autoSync: false,

      // Default agent configuration
      defaultModel: DEFAULT_MODEL,
      defaultTools: DEFAULT_TOOLS,

      // Application settings
      theme: "system",
      confirmDeploy: true,

      setAgentRepositoryUrl: (url) => set({ agentRepositoryUrl: url }),
      setAgentRepositoryBranch: (branch) => set({ agentRepositoryBranch: branch }),
      setAgentRepositoryPath: (path) => set({ agentRepositoryPath: path }),
      setLastSync: (timestamp) => set({ lastSync: timestamp }),
      setAutoSync: (autoSync) => set({ autoSync }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setDefaultTools: (tools) => set({ defaultTools: tools }),
      setTheme: (theme) => set({ theme }),
      setConfirmDeploy: (confirm) => set({ confirmDeploy: confirm }),

      resetSettings: () =>
        set({
          agentRepositoryUrl: DEFAULT_REPO_URL,
          agentRepositoryBranch: DEFAULT_BRANCH,
          agentRepositoryPath: "",
          lastSync: null,
          autoSync: false,
          defaultModel: DEFAULT_MODEL,
          defaultTools: DEFAULT_TOOLS,
          theme: "system",
          confirmDeploy: true,
        }),
    }),
    {
      name: "teamforge-settings",
    }
  )
);

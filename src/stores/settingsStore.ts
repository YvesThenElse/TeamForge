import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  // Agent Source Settings
  agentRepoUrl: string;
  agentRepoBranch: string;
  agentSourcePath: string; // Subdirectory in repo where agents are located (e.g., "agents")
  agentDevPath: string; // Local path for dev mode
  agentCachePath: string; // Cache path (.teamforge/cache/agents)
  agentLastSync: string | null;

  // Skills Source Settings
  skillRepoUrl: string;
  skillRepoBranch: string;
  skillSourcePath: string; // Subdirectory in repo where skills are located
  skillDevPath: string; // Local path for dev mode
  skillCachePath: string; // Cache path (.teamforge/cache/skills)
  skillLastSync: string | null;

  // Hooks Source Settings
  hookRepoUrl: string;
  hookRepoBranch: string;
  hookSourcePath: string; // Subdirectory in repo where hooks are located
  hookDevPath: string; // Local path for dev mode
  hookCachePath: string; // Cache path (.teamforge/cache/hooks)
  hookLastSync: string | null;

  // Application Preferences
  autoSync: boolean; // Auto-sync on startup
  theme: "light" | "dark" | "system";
  confirmDeploy: boolean; // Confirm before deploying
  claudeSettingsFile: "settings.json" | "settings.local.json";
  developerMode: boolean; // Enable developer mode

  // Default Agent Configuration
  defaultModel: "sonnet" | "opus" | "haiku";
  defaultTools: string;

  // Actions - Agents
  setAgentRepoUrl: (url: string) => void;
  setAgentRepoBranch: (branch: string) => void;
  setAgentSourcePath: (path: string) => void;
  setAgentDevPath: (path: string) => void;
  setAgentCachePath: (path: string) => void;
  setAgentLastSync: (timestamp: string | null) => void;

  // Actions - Skills
  setSkillRepoUrl: (url: string) => void;
  setSkillRepoBranch: (branch: string) => void;
  setSkillSourcePath: (path: string) => void;
  setSkillDevPath: (path: string) => void;
  setSkillCachePath: (path: string) => void;
  setSkillLastSync: (timestamp: string | null) => void;

  // Actions - Hooks
  setHookRepoUrl: (url: string) => void;
  setHookRepoBranch: (branch: string) => void;
  setHookSourcePath: (path: string) => void;
  setHookDevPath: (path: string) => void;
  setHookCachePath: (path: string) => void;
  setHookLastSync: (timestamp: string | null) => void;

  // Actions - Preferences
  setAutoSync: (autoSync: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setConfirmDeploy: (confirm: boolean) => void;
  setClaudeSettingsFile: (file: "settings.json" | "settings.local.json") => void;
  setDeveloperMode: (enabled: boolean) => void;
  setDefaultModel: (model: "sonnet" | "opus" | "haiku") => void;
  setDefaultTools: (tools: string) => void;

  resetSettings: () => void;
}

const DEFAULT_AGENT_REPO = "https://github.com/anthropics/teamforge-agents.git";
const DEFAULT_SKILL_REPO = "";
const DEFAULT_HOOK_REPO = "";
const DEFAULT_BRANCH = "main";
const DEFAULT_MODEL = "sonnet";
const DEFAULT_TOOLS = "*";
const DEFAULT_CACHE_PATH = ".teamforge/cache";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Agent source settings
      agentRepoUrl: DEFAULT_AGENT_REPO,
      agentRepoBranch: DEFAULT_BRANCH,
      agentSourcePath: "",
      agentDevPath: "",
      agentCachePath: `${DEFAULT_CACHE_PATH}/agents`,
      agentLastSync: null,

      // Skills source settings
      skillRepoUrl: DEFAULT_SKILL_REPO,
      skillRepoBranch: DEFAULT_BRANCH,
      skillSourcePath: "",
      skillDevPath: "",
      skillCachePath: `${DEFAULT_CACHE_PATH}/skills`,
      skillLastSync: null,

      // Hooks source settings
      hookRepoUrl: DEFAULT_HOOK_REPO,
      hookRepoBranch: DEFAULT_BRANCH,
      hookSourcePath: "",
      hookDevPath: "",
      hookCachePath: `${DEFAULT_CACHE_PATH}/hooks`,
      hookLastSync: null,

      // Application preferences
      autoSync: false,
      theme: "system",
      confirmDeploy: true,
      claudeSettingsFile: "settings.local.json",
      developerMode: false,

      // Default agent configuration
      defaultModel: DEFAULT_MODEL,
      defaultTools: DEFAULT_TOOLS,

      // Actions - Agents
      setAgentRepoUrl: (url) => set({ agentRepoUrl: url }),
      setAgentRepoBranch: (branch) => set({ agentRepoBranch: branch }),
      setAgentSourcePath: (path) => set({ agentSourcePath: path }),
      setAgentDevPath: (path) => set({ agentDevPath: path }),
      setAgentCachePath: (path) => set({ agentCachePath: path }),
      setAgentLastSync: (timestamp) => set({ agentLastSync: timestamp }),

      // Actions - Skills
      setSkillRepoUrl: (url) => set({ skillRepoUrl: url }),
      setSkillRepoBranch: (branch) => set({ skillRepoBranch: branch }),
      setSkillSourcePath: (path) => set({ skillSourcePath: path }),
      setSkillDevPath: (path) => set({ skillDevPath: path }),
      setSkillCachePath: (path) => set({ skillCachePath: path }),
      setSkillLastSync: (timestamp) => set({ skillLastSync: timestamp }),

      // Actions - Hooks
      setHookRepoUrl: (url) => set({ hookRepoUrl: url }),
      setHookRepoBranch: (branch) => set({ hookRepoBranch: branch }),
      setHookSourcePath: (path) => set({ hookSourcePath: path }),
      setHookDevPath: (path) => set({ hookDevPath: path }),
      setHookCachePath: (path) => set({ hookCachePath: path }),
      setHookLastSync: (timestamp) => set({ hookLastSync: timestamp }),

      // Actions - Preferences
      setAutoSync: (autoSync) => set({ autoSync }),
      setTheme: (theme) => set({ theme }),
      setConfirmDeploy: (confirm) => set({ confirmDeploy: confirm }),
      setClaudeSettingsFile: (file) => set({ claudeSettingsFile: file }),
      setDeveloperMode: (enabled) => set({ developerMode: enabled }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setDefaultTools: (tools) => set({ defaultTools: tools }),

      resetSettings: () =>
        set({
          agentRepoUrl: DEFAULT_AGENT_REPO,
          agentRepoBranch: DEFAULT_BRANCH,
          agentSourcePath: "",
          agentDevPath: "",
          agentCachePath: `${DEFAULT_CACHE_PATH}/agents`,
          agentLastSync: null,
          skillRepoUrl: DEFAULT_SKILL_REPO,
          skillRepoBranch: DEFAULT_BRANCH,
          skillSourcePath: "",
          skillDevPath: "",
          skillCachePath: `${DEFAULT_CACHE_PATH}/skills`,
          skillLastSync: null,
          hookRepoUrl: DEFAULT_HOOK_REPO,
          hookRepoBranch: DEFAULT_BRANCH,
          hookSourcePath: "",
          hookDevPath: "",
          hookCachePath: `${DEFAULT_CACHE_PATH}/hooks`,
          hookLastSync: null,
          autoSync: false,
          theme: "system",
          confirmDeploy: true,
          claudeSettingsFile: "settings.local.json",
          developerMode: false,
          defaultModel: DEFAULT_MODEL,
          defaultTools: DEFAULT_TOOLS,
        }),
    }),
    {
      name: "teamforge-settings",
    }
  )
);

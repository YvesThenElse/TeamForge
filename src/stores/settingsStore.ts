import { create } from "zustand";
import * as electron from "@/services/electron";
import type { TeamforgeSettings } from "@/services/electron";

interface SettingsState {
  // Agent Source Settings
  agentRepoUrl: string;
  agentRepoBranch: string;
  agentSourcePath: string;
  agentDevPath: string;
  agentCachePath: string;
  agentLastSync: string | null;

  // Skills Source Settings
  skillRepoUrl: string;
  skillRepoBranch: string;
  skillSourcePath: string;
  skillDevPath: string;
  skillCachePath: string;
  skillLastSync: string | null;

  // Hooks Source Settings
  hookRepoUrl: string;
  hookRepoBranch: string;
  hookSourcePath: string;
  hookDevPath: string;
  hookCachePath: string;
  hookLastSync: string | null;

  // Application Preferences
  autoSync: boolean;
  theme: "light" | "dark" | "system";
  confirmDeploy: boolean;
  claudeSettingsFile: "settings.json" | "settings.local.json";
  developerMode: boolean;

  // Default Agent Configuration
  defaultModel: "sonnet" | "opus" | "haiku";
  defaultTools: string;

  // Security settings
  security: {
    allowedCommands: string[];
    blockedCommands: string[];
    requireConfirmation: boolean;
  };

  // Loading state
  isLoaded: boolean;
  isSaving: boolean;

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

  // Actions - File operations
  loadSettings: (projectPath: string) => Promise<void>;
  saveSettings: (projectPath: string) => Promise<void>;
  resetSettings: () => void;
}

const DEFAULT_BRANCH = "main";
const DEFAULT_MODEL = "sonnet";
const DEFAULT_TOOLS = "*";
const DEFAULT_CACHE_PATH = ".teamforge/cache";

const DEFAULT_STATE = {
  // Agent source settings
  agentRepoUrl: "",
  agentRepoBranch: DEFAULT_BRANCH,
  agentSourcePath: "",
  agentDevPath: "",
  agentCachePath: `${DEFAULT_CACHE_PATH}/agents`,
  agentLastSync: null,

  // Skills source settings
  skillRepoUrl: "",
  skillRepoBranch: DEFAULT_BRANCH,
  skillSourcePath: "",
  skillDevPath: "",
  skillCachePath: `${DEFAULT_CACHE_PATH}/skills`,
  skillLastSync: null,

  // Hooks source settings
  hookRepoUrl: "",
  hookRepoBranch: DEFAULT_BRANCH,
  hookSourcePath: "",
  hookDevPath: "",
  hookCachePath: `${DEFAULT_CACHE_PATH}/hooks`,
  hookLastSync: null,

  // Application preferences
  autoSync: false,
  theme: "system" as const,
  confirmDeploy: true,
  claudeSettingsFile: "settings.local.json" as const,
  developerMode: false,

  // Default agent configuration
  defaultModel: DEFAULT_MODEL as "sonnet" | "opus" | "haiku",
  defaultTools: DEFAULT_TOOLS,

  // Security settings
  security: {
    allowedCommands: [],
    blockedCommands: [],
    requireConfirmation: true,
  },

  // Loading state
  isLoaded: false,
  isSaving: false,
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  ...DEFAULT_STATE,

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

  // Load settings from .teamforge/settings.json
  loadSettings: async (projectPath: string) => {
    try {
      console.log("[settingsStore] Loading settings from project:", projectPath);
      const result = await electron.loadTeamforgeSettings(projectPath);

      if (result.exists) {
        console.log("[settingsStore] Settings loaded from:", result.path);
        set({
          agentRepoUrl: result.settings.agentRepoUrl ?? DEFAULT_STATE.agentRepoUrl,
          agentRepoBranch: result.settings.agentRepoBranch ?? DEFAULT_STATE.agentRepoBranch,
          agentSourcePath: result.settings.agentSourcePath ?? DEFAULT_STATE.agentSourcePath,
          agentDevPath: result.settings.agentDevPath ?? DEFAULT_STATE.agentDevPath,
          agentCachePath: result.settings.agentCachePath ?? DEFAULT_STATE.agentCachePath,
          agentLastSync: result.settings.agentLastSync ?? DEFAULT_STATE.agentLastSync,
          skillRepoUrl: result.settings.skillRepoUrl ?? DEFAULT_STATE.skillRepoUrl,
          skillRepoBranch: result.settings.skillRepoBranch ?? DEFAULT_STATE.skillRepoBranch,
          skillSourcePath: result.settings.skillSourcePath ?? DEFAULT_STATE.skillSourcePath,
          skillDevPath: result.settings.skillDevPath ?? DEFAULT_STATE.skillDevPath,
          skillCachePath: result.settings.skillCachePath ?? DEFAULT_STATE.skillCachePath,
          skillLastSync: result.settings.skillLastSync ?? DEFAULT_STATE.skillLastSync,
          hookRepoUrl: result.settings.hookRepoUrl ?? DEFAULT_STATE.hookRepoUrl,
          hookRepoBranch: result.settings.hookRepoBranch ?? DEFAULT_STATE.hookRepoBranch,
          hookSourcePath: result.settings.hookSourcePath ?? DEFAULT_STATE.hookSourcePath,
          hookDevPath: result.settings.hookDevPath ?? DEFAULT_STATE.hookDevPath,
          hookCachePath: result.settings.hookCachePath ?? DEFAULT_STATE.hookCachePath,
          hookLastSync: result.settings.hookLastSync ?? DEFAULT_STATE.hookLastSync,
          autoSync: result.settings.autoSync ?? DEFAULT_STATE.autoSync,
          theme: result.settings.theme ?? DEFAULT_STATE.theme,
          confirmDeploy: result.settings.confirmDeploy ?? DEFAULT_STATE.confirmDeploy,
          claudeSettingsFile: result.settings.claudeSettingsFile ?? DEFAULT_STATE.claudeSettingsFile,
          developerMode: result.settings.developerMode ?? DEFAULT_STATE.developerMode,
          defaultModel: result.settings.defaultModel ?? DEFAULT_STATE.defaultModel,
          defaultTools: result.settings.defaultTools ?? DEFAULT_STATE.defaultTools,
          security: {
            allowedCommands: result.settings.security?.allowedCommands ?? DEFAULT_STATE.security.allowedCommands,
            blockedCommands: result.settings.security?.blockedCommands ?? DEFAULT_STATE.security.blockedCommands,
            requireConfirmation: result.settings.security?.requireConfirmation ?? DEFAULT_STATE.security.requireConfirmation,
          },
          isLoaded: true,
        });
      } else {
        console.log("[settingsStore] No settings file found, using defaults");
        set({ ...DEFAULT_STATE, isLoaded: true });
      }
    } catch (error) {
      console.error("[settingsStore] Failed to load settings:", error);
      set({ ...DEFAULT_STATE, isLoaded: true });
    }
  },

  // Save settings to .teamforge/settings.json
  saveSettings: async (projectPath: string) => {
    const state = get();
    set({ isSaving: true });

    try {
      const settings: TeamforgeSettings = {
        agentRepoUrl: state.agentRepoUrl,
        agentRepoBranch: state.agentRepoBranch,
        agentSourcePath: state.agentSourcePath,
        agentDevPath: state.agentDevPath,
        agentCachePath: state.agentCachePath,
        agentLastSync: state.agentLastSync,
        skillRepoUrl: state.skillRepoUrl,
        skillRepoBranch: state.skillRepoBranch,
        skillSourcePath: state.skillSourcePath,
        skillDevPath: state.skillDevPath,
        skillCachePath: state.skillCachePath,
        skillLastSync: state.skillLastSync,
        hookRepoUrl: state.hookRepoUrl,
        hookRepoBranch: state.hookRepoBranch,
        hookSourcePath: state.hookSourcePath,
        hookDevPath: state.hookDevPath,
        hookCachePath: state.hookCachePath,
        hookLastSync: state.hookLastSync,
        autoSync: state.autoSync,
        theme: state.theme,
        confirmDeploy: state.confirmDeploy,
        claudeSettingsFile: state.claudeSettingsFile,
        developerMode: state.developerMode,
        defaultModel: state.defaultModel,
        defaultTools: state.defaultTools,
        security: state.security,
      };

      await electron.saveTeamforgeSettings(projectPath, settings);
      console.log("[settingsStore] Settings saved to project:", projectPath);
    } catch (error) {
      console.error("[settingsStore] Failed to save settings:", error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  resetSettings: () => set({ ...DEFAULT_STATE, isLoaded: true }),
}));

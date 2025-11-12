// Electron API wrappers with proper typing
import type {
  Agent,
  TeamForgeConfig,
  ProjectAnalysis,
} from "@/types";

// Access the Electron API exposed via preload script
declare global {
  interface Window {
    electronAPI: {
      // Dialog
      selectFolder: () => Promise<string | null>;

      // Git commands
      cloneRepo: (url: string, path: string) => Promise<string>;
      isGitRepo: (path: string) => Promise<boolean>;
      getRepoStatus: (path: string) => Promise<string[]>;
      createGitCommit: (
        path: string,
        message: string,
        files: string[]
      ) => Promise<string>;

      // Project commands
      analyzeProject: (path: string) => Promise<ProjectAnalysis>;

      // Agent commands
      getAgentLibrary: () => Promise<AgentLibraryResponse>;
      getAgentsByCategory: (category: string) => Promise<Agent[]>;
      searchAgents: (keyword: string) => Promise<Agent[]>;
      getAgentById: (id: string) => Promise<Agent | null>;
      generateAgentFile: (
        agentId: string,
        customInstructions?: string
      ) => Promise<string>;
      saveAgentFile: (agentContent: string, filePath: string) => Promise<string>;
      getSuggestedAgents: (technologies: string[]) => Promise<Agent[]>;

      // Config commands
      loadTeamforgeConfig: (projectPath: string) => Promise<TeamForgeConfig>;
      saveTeamforgeConfig: (
        config: TeamForgeConfig,
        projectPath: string
      ) => Promise<string>;
      createDefaultTeamforgeConfig: (
        projectName: string,
        projectType: string,
        projectPath: string,
        detectedTechnologies: string[]
      ) => Promise<TeamForgeConfig>;
      validateTeamforgeConfig: (config: TeamForgeConfig) => Promise<string[]>;
      teamforgeExists: (projectPath: string) => Promise<boolean>;
      initializeTeamforge: (projectPath: string) => Promise<string>;
      ensureClaudeAgentsDir: (projectPath: string) => Promise<string>;
    };
  }
}

// ============================================================================
// Dialog
// ============================================================================

export async function selectFolder(): Promise<string | null> {
  return window.electronAPI.selectFolder();
}

// ============================================================================
// Git Commands
// ============================================================================

export async function cloneRepo(url: string, path: string): Promise<string> {
  return window.electronAPI.cloneRepo(url, path);
}

export async function isGitRepo(path: string): Promise<boolean> {
  return window.electronAPI.isGitRepo(path);
}

export async function getRepoStatus(path: string): Promise<string[]> {
  return window.electronAPI.getRepoStatus(path);
}

export async function createGitCommit(
  path: string,
  message: string,
  files: string[]
): Promise<string> {
  return window.electronAPI.createGitCommit(path, message, files);
}

// ============================================================================
// Project Commands
// ============================================================================

export async function analyzeProject(
  path: string
): Promise<ProjectAnalysis> {
  return window.electronAPI.analyzeProject(path);
}

// ============================================================================
// Agent Commands
// ============================================================================

export interface AgentLibraryResponse {
  version: string;
  agents: Agent[];
  categories: string[];
}

export async function getAgentLibrary(): Promise<AgentLibraryResponse> {
  return window.electronAPI.getAgentLibrary();
}

export async function getAgentsByCategory(
  category: string
): Promise<Agent[]> {
  return window.electronAPI.getAgentsByCategory(category);
}

export async function searchAgents(keyword: string): Promise<Agent[]> {
  return window.electronAPI.searchAgents(keyword);
}

export async function getAgentById(id: string): Promise<Agent | null> {
  return window.electronAPI.getAgentById(id);
}

export async function generateAgentFile(
  agentId: string,
  customInstructions?: string
): Promise<string> {
  return window.electronAPI.generateAgentFile(agentId, customInstructions);
}

export async function saveAgentFile(
  agentContent: string,
  filePath: string
): Promise<string> {
  return window.electronAPI.saveAgentFile(agentContent, filePath);
}

export async function getSuggestedAgents(
  technologies: string[]
): Promise<Agent[]> {
  return window.electronAPI.getSuggestedAgents(technologies);
}

// ============================================================================
// Config Commands
// ============================================================================

export async function loadTeamforgeConfig(
  projectPath: string
): Promise<TeamForgeConfig> {
  return window.electronAPI.loadTeamforgeConfig(projectPath);
}

export async function saveTeamforgeConfig(
  config: TeamForgeConfig,
  projectPath: string
): Promise<string> {
  return window.electronAPI.saveTeamforgeConfig(config, projectPath);
}

export async function createDefaultTeamforgeConfig(
  projectName: string,
  projectType: string,
  projectPath: string,
  detectedTechnologies: string[]
): Promise<TeamForgeConfig> {
  return window.electronAPI.createDefaultTeamforgeConfig(
    projectName,
    projectType,
    projectPath,
    detectedTechnologies
  );
}

export async function validateTeamforgeConfig(
  config: TeamForgeConfig
): Promise<string[]> {
  return window.electronAPI.validateTeamforgeConfig(config);
}

export async function teamforgeExists(projectPath: string): Promise<boolean> {
  return window.electronAPI.teamforgeExists(projectPath);
}

export async function initializeTeamforge(
  projectPath: string
): Promise<string> {
  return window.electronAPI.initializeTeamforge(projectPath);
}

export async function ensureClaudeAgentsDir(
  projectPath: string
): Promise<string> {
  return window.electronAPI.ensureClaudeAgentsDir(projectPath);
}

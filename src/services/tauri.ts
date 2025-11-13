// DEPRECATED: Tauri command wrappers with proper typing
// This file is kept for reference only. The app now uses Electron instead of Tauri.
// See electron.ts for the new implementation.

// import { invoke } from "@tauri-apps/api/core";
import type {
  Agent,
  TeamForgeConfig,
  ProjectAnalysis,
} from "@/types";

// This is a mock invoke function to prevent errors
// This file should not be used anymore
const invoke = <T = any>(_cmd: string, _args?: any): Promise<T> => {
  throw new Error("Tauri is deprecated. Use electron.ts instead.");
};

// ============================================================================
// Git Commands
// ============================================================================

export async function cloneRepo(url: string, path: string): Promise<string> {
  return invoke<string>("clone_repo", { url, path });
}

export async function isGitRepo(path: string): Promise<boolean> {
  return invoke<boolean>("is_git_repo", { path });
}

export async function getRepoStatus(path: string): Promise<string[]> {
  return invoke<string[]>("get_repo_status", { path });
}

export async function createGitCommit(
  path: string,
  message: string,
  files: string[]
): Promise<string> {
  return invoke<string>("create_git_commit", { path, message, files });
}

// ============================================================================
// Project Commands
// ============================================================================

export async function analyzeProject(
  path: string
): Promise<ProjectAnalysis> {
  return invoke<ProjectAnalysis>("analyze_project", { path });
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
  return invoke<AgentLibraryResponse>("get_agent_library");
}

export async function getAgentsByCategory(
  category: string
): Promise<Agent[]> {
  return invoke<Agent[]>("get_agents_by_category", { category });
}

export async function searchAgents(keyword: string): Promise<Agent[]> {
  return invoke<Agent[]>("search_agents", { keyword });
}

export async function getAgentById(id: string): Promise<Agent | null> {
  return invoke<Agent | null>("get_agent_by_id", { id });
}

export async function generateAgentFile(
  agentId: string,
  customInstructions?: string
): Promise<string> {
  return invoke<string>("generate_agent_file", {
    agentId,
    customInstructions: customInstructions || null,
  });
}

export async function saveAgentFile(
  agentContent: string,
  filePath: string
): Promise<string> {
  return invoke<string>("save_agent_file", { agentContent, filePath });
}

export async function getSuggestedAgents(
  technologies: string[]
): Promise<Agent[]> {
  return invoke<Agent[]>("get_suggested_agents", { technologies });
}

// ============================================================================
// Config Commands
// ============================================================================

export async function loadTeamforgeConfig(
  projectPath: string
): Promise<TeamForgeConfig> {
  return invoke<TeamForgeConfig>("load_teamforge_config", { projectPath });
}

export async function saveTeamforgeConfig(
  config: TeamForgeConfig,
  projectPath: string
): Promise<string> {
  return invoke<string>("save_teamforge_config", { config, projectPath });
}

export async function createDefaultTeamforgeConfig(
  projectName: string,
  projectType: string,
  projectPath: string,
  detectedTechnologies: string[]
): Promise<TeamForgeConfig> {
  return invoke<TeamForgeConfig>("create_default_teamforge_config", {
    projectName,
    projectType,
    projectPath,
    detectedTechnologies,
  });
}

export async function validateTeamforgeConfig(
  config: TeamForgeConfig
): Promise<string[]> {
  return invoke<string[]>("validate_teamforge_config", { config });
}

export async function teamforgeExists(projectPath: string): Promise<boolean> {
  return invoke<boolean>("teamforge_exists", { projectPath });
}

export async function initializeTeamforge(
  projectPath: string
): Promise<string> {
  return invoke<string>("initialize_teamforge", { projectPath });
}

export async function ensureClaudeAgentsDir(
  projectPath: string
): Promise<string> {
  return invoke<string>("ensure_claude_agents_dir", { projectPath });
}

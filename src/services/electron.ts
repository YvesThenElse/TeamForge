// Electron API wrappers with proper typing
import type {
  Agent,
  TeamForgeConfig,
  ProjectAnalysis,
} from "@/types";
import type {
  AgentFile,
  AgentFileFrontmatter,
} from "@/types/agentFile";
import type { ClaudeInfo, GlobalClaudeInfo } from "@/types/claudeInfo";
import type { Skill, SkillFrontmatter } from "@/types/skill";

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

      // Agent File commands (for .claude/agents/)
      listAgentFiles: (projectPath: string) => Promise<AgentFile[]>;
      readAgentFile: (projectPath: string, agentId: string) => Promise<AgentFile>;
      saveAgentFileContent: (
        projectPath: string,
        agentId: string,
        frontmatter: AgentFileFrontmatter,
        systemPrompt: string
      ) => Promise<{ success: boolean; filePath: string }>;
      deleteAgentFile: (projectPath: string, agentId: string) => Promise<{ success: boolean }>;
      agentFileDirExists: (projectPath: string) => Promise<boolean>;
      loadTemplateAgents: () => Promise<Agent[]>;
      getClaudeInfo: (projectPath: string) => Promise<ClaudeInfo>;
      getGlobalClaudeInfo: () => Promise<GlobalClaudeInfo>;

      // Skill commands
      listSkills: (projectPath: string) => Promise<Skill[]>;
      readSkill: (projectPath: string, skillId: string) => Promise<Skill>;
      saveSkill: (
        projectPath: string,
        skillId: string,
        frontmatter: SkillFrontmatter,
        instructions: string
      ) => Promise<{ success: boolean; skillPath: string }>;
      deleteSkill: (projectPath: string, skillId: string) => Promise<{ success: boolean }>;
      skillDirExists: (projectPath: string) => Promise<boolean>;
      ensureSkillsDir: (projectPath: string) => Promise<string>;
    };
  }
}

// ============================================================================
// Dialog
// ============================================================================

export async function selectFolder(): Promise<string | null> {
  console.log("[electron.ts] Checking window.electronAPI...");

  if (!window.electronAPI) {
    console.error("[electron.ts] window.electronAPI is not defined!");
    throw new Error("Electron API not available. Are you running in Electron?");
  }

  if (!window.electronAPI.selectFolder) {
    console.error("[electron.ts] window.electronAPI.selectFolder is not defined!");
    throw new Error("selectFolder method not available in Electron API");
  }

  console.log("[electron.ts] Calling window.electronAPI.selectFolder()");
  try {
    const result = await window.electronAPI.selectFolder();
    console.log("[electron.ts] Result:", result);
    return result;
  } catch (err) {
    console.error("[electron.ts] Error:", err);
    throw err;
  }
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

// ============================================================================
// Agent File Commands
// ============================================================================

export async function listAgentFiles(projectPath: string): Promise<AgentFile[]> {
  return window.electronAPI.listAgentFiles(projectPath);
}

export async function readAgentFile(
  projectPath: string,
  agentId: string
): Promise<AgentFile> {
  return window.electronAPI.readAgentFile(projectPath, agentId);
}

export async function saveAgentFileContent(
  projectPath: string,
  agentId: string,
  frontmatter: AgentFileFrontmatter,
  systemPrompt: string
): Promise<{ success: boolean; filePath: string }> {
  return window.electronAPI.saveAgentFileContent(
    projectPath,
    agentId,
    frontmatter,
    systemPrompt
  );
}

export async function deleteAgentFile(
  projectPath: string,
  agentId: string
): Promise<{ success: boolean }> {
  return window.electronAPI.deleteAgentFile(projectPath, agentId);
}

export async function agentFileDirExists(
  projectPath: string
): Promise<boolean> {
  return window.electronAPI.agentFileDirExists(projectPath);
}

export async function loadTemplateAgents(): Promise<Agent[]> {
  return window.electronAPI.loadTemplateAgents();
}

export async function getClaudeInfo(projectPath: string): Promise<ClaudeInfo> {
  return window.electronAPI.getClaudeInfo(projectPath);
}

export async function getGlobalClaudeInfo(): Promise<GlobalClaudeInfo> {
  return window.electronAPI.getGlobalClaudeInfo();
}

// ============================================================================
// Skills
// ============================================================================

export async function listSkills(projectPath: string): Promise<Skill[]> {
  return window.electronAPI.listSkills(projectPath);
}

export async function readSkill(
  projectPath: string,
  skillId: string
): Promise<Skill> {
  return window.electronAPI.readSkill(projectPath, skillId);
}

export async function saveSkill(
  projectPath: string,
  skillId: string,
  frontmatter: SkillFrontmatter,
  instructions: string
): Promise<{ success: boolean; skillPath: string }> {
  return window.electronAPI.saveSkill(
    projectPath,
    skillId,
    frontmatter,
    instructions
  );
}

export async function deleteSkill(
  projectPath: string,
  skillId: string
): Promise<{ success: boolean }> {
  return window.electronAPI.deleteSkill(projectPath, skillId);
}

export async function skillDirExists(projectPath: string): Promise<boolean> {
  return window.electronAPI.skillDirExists(projectPath);
}

export async function ensureSkillsDir(projectPath: string): Promise<string> {
  return window.electronAPI.ensureSkillsDir(projectPath);
}

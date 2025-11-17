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
import type { Team } from "@/types/team";
import type { Hook } from "@/types/hook";
import type { ClaudeSettings, SettingsFile } from "@/types/claudeSettings";

// Access the Electron API exposed via preload script
declare global {
  interface Window {
    electronAPI: {
      // Dialog
      selectFolder: () => Promise<string | null>;
      openFolder: (folderPath: string) => Promise<string>;

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
      loadTemplateSkills: () => Promise<Skill[]>;

      // Team commands
      listTeams: (projectPath: string) => Promise<Team[]>;
      loadTeam: (projectPath: string, teamId: string) => Promise<Team>;
      saveTeam: (projectPath: string, team: Team) => Promise<string>;
      deleteTeam: (projectPath: string, teamId: string) => Promise<string>;
      deployTeam: (
        projectPath: string,
        team: Team,
        agentLibrary: Agent[]
      ) => Promise<string>;

      // Agent Repository commands
      syncAgentRepository: (repoUrl: string, branch: string) => Promise<{
        success: boolean;
        path: string;
        message: string;
        timestamp: string;
      }>;
      getAgentRepositoryPath: () => Promise<string>;
      getAgentRepositoryStatus: () => Promise<{
        exists: boolean;
        isRepo?: boolean;
        path: string;
        branch?: string;
        ahead?: number;
        behind?: number;
        remotes?: Array<{ name: string; url: string }>;
        message?: string;
        error?: string;
      }>;
      deleteAgentRepository: () => Promise<{ success: boolean; message: string }>;
      reloadAgents: () => Promise<{
        success: boolean;
        agentCount: number;
        source: string;
        loadedFrom: string;
      }>;

      // Hook commands
      loadTemplateHooks: () => Promise<Hook[]>;
      listHooks: (projectPath: string) => Promise<Array<{
        event: string;
        matcher: string;
        command: string;
        type: string;
      }>>;
      deployHook: (projectPath: string, hook: Hook) => Promise<string>;
      removeHook: (
        projectPath: string,
        hookEvent: string,
        matcher: string,
        command: string
      ) => Promise<string>;
      hookDirExists: (projectPath: string) => Promise<boolean>;
      ensureHooksDir: (projectPath: string) => Promise<string>;

      // Claude Settings commands
      loadClaudeSettings: (projectPath: string) => Promise<{
        exists: boolean;
        path: string;
        settings: ClaudeSettings;
      }>;
      saveClaudeSettings: (
        projectPath: string,
        settings: ClaudeSettings
      ) => Promise<{
        success: boolean;
        path: string;
        message: string;
      }>;
      loadUserClaudeSettings: () => Promise<{
        exists: boolean;
        path: string;
        settings: ClaudeSettings;
      }>;
      loadAllClaudeSettings: (projectPath: string) => Promise<{
        files: SettingsFile[];
        merged: ClaudeSettings;
      }>;
      claudeSettingsExists: (projectPath: string) => Promise<boolean>;
      ensureClaudeSettingsDir: (projectPath: string) => Promise<string>;
      validateClaudeSettings: (settings: ClaudeSettings) => Promise<{
        valid: boolean;
        errors: string[];
      }>;
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

export async function openFolder(folderPath: string): Promise<string> {
  return window.electronAPI.openFolder(folderPath);
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
  source?: string; // 'git' or 'local'
  loadedFrom?: string; // Path to loaded directory
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

export async function loadTemplateSkills(): Promise<Skill[]> {
  return window.electronAPI.loadTemplateSkills();
}

// ============================================================================
// Team Commands
// ============================================================================

export async function listTeams(projectPath: string): Promise<Team[]> {
  return window.electronAPI.listTeams(projectPath);
}

export async function loadTeam(
  projectPath: string,
  teamId: string
): Promise<Team> {
  return window.electronAPI.loadTeam(projectPath, teamId);
}

export async function saveTeam(
  projectPath: string,
  team: Team
): Promise<string> {
  return window.electronAPI.saveTeam(projectPath, team);
}

export async function deleteTeam(
  projectPath: string,
  teamId: string
): Promise<string> {
  return window.electronAPI.deleteTeam(projectPath, teamId);
}

export async function deployTeam(
  projectPath: string,
  team: Team,
  agentLibrary: Agent[]
): Promise<string> {
  return window.electronAPI.deployTeam(projectPath, team, agentLibrary);
}

// ============================================================================
// Agent Repository Commands
// ============================================================================

export async function syncAgentRepository(repoUrl: string, branch: string = 'main') {
  return window.electronAPI.syncAgentRepository(repoUrl, branch);
}

export async function getAgentRepositoryPath(): Promise<string> {
  return window.electronAPI.getAgentRepositoryPath();
}

export async function getAgentRepositoryStatus() {
  return window.electronAPI.getAgentRepositoryStatus();
}

export async function deleteAgentRepository() {
  return window.electronAPI.deleteAgentRepository();
}

export async function reloadAgents() {
  return window.electronAPI.reloadAgents();
}

// ============================================================================
// Hook Commands
// ============================================================================

export async function loadTemplateHooks(): Promise<Hook[]> {
  return window.electronAPI.loadTemplateHooks();
}

export async function listHooks(projectPath: string): Promise<Array<{
  event: string;
  matcher: string;
  command: string;
  type: string;
}>> {
  return window.electronAPI.listHooks(projectPath);
}

export async function deployHook(
  projectPath: string,
  hook: Hook
): Promise<string> {
  return window.electronAPI.deployHook(projectPath, hook);
}

export async function removeHook(
  projectPath: string,
  hookEvent: string,
  matcher: string,
  command: string
): Promise<string> {
  return window.electronAPI.removeHook(projectPath, hookEvent, matcher, command);
}

export async function hookDirExists(projectPath: string): Promise<boolean> {
  return window.electronAPI.hookDirExists(projectPath);
}

export async function ensureHooksDir(projectPath: string): Promise<string> {
  return window.electronAPI.ensureHooksDir(projectPath);
}

// ============================================================================
// Claude Settings Commands
// ============================================================================

export async function loadClaudeSettings(projectPath: string): Promise<{
  exists: boolean;
  path: string;
  settings: ClaudeSettings;
}> {
  return window.electronAPI.loadClaudeSettings(projectPath);
}

export async function saveClaudeSettings(
  projectPath: string,
  settings: ClaudeSettings
): Promise<{
  success: boolean;
  path: string;
  message: string;
}> {
  return window.electronAPI.saveClaudeSettings(projectPath, settings);
}

export async function loadUserClaudeSettings(): Promise<{
  exists: boolean;
  path: string;
  settings: ClaudeSettings;
}> {
  return window.electronAPI.loadUserClaudeSettings();
}

export async function loadAllClaudeSettings(projectPath: string): Promise<{
  files: SettingsFile[];
  merged: ClaudeSettings;
}> {
  return window.electronAPI.loadAllClaudeSettings(projectPath);
}

export async function claudeSettingsExists(projectPath: string): Promise<boolean> {
  return window.electronAPI.claudeSettingsExists(projectPath);
}

export async function ensureClaudeSettingsDir(projectPath: string): Promise<string> {
  return window.electronAPI.ensureClaudeSettingsDir(projectPath);
}

export async function validateClaudeSettings(settings: ClaudeSettings): Promise<{
  valid: boolean;
  errors: string[];
}> {
  return window.electronAPI.validateClaudeSettings(settings);
}

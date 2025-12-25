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
import type { McpServer } from "@/types/mcp";
import type { Constitution, ConstitutionCategory, AISystem } from "@/types/constitution";

// TeamForge project-level settings type
export interface TeamforgeSettings {
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

  // MCP Source Settings
  mcpRepoUrl: string;
  mcpRepoBranch: string;
  mcpSourcePath: string;
  mcpDevPath: string;
  mcpCachePath: string;
  mcpLastSync: string | null;

  // Constitution Source Settings
  constitutionRepoUrl: string;
  constitutionRepoBranch: string;
  constitutionSourcePath: string;
  constitutionDevPath: string;
  constitutionCachePath: string;
  constitutionLastSync: string | null;

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
  security?: {
    allowedCommands?: string[];
    blockedCommands?: string[];
    requireConfirmation?: boolean;
  };
}

// Deployment types
export interface SystemCapabilities {
  agents: boolean;
  constitution: boolean;
  skills: boolean;
  hooks: boolean;
  mcpServers: boolean;
  memory: boolean;
}

export interface DeploymentTeam {
  id?: string;
  name?: string;
  constitution?: string;
  // Can be either full Agent objects or TeamAgent references
  agents?: Array<Agent | { agentId: string; order?: number; customInstructions?: string }>;
  // Can be either full Skill objects or TeamSkill references
  skills?: Array<Skill | { skillId: string; order?: number }>;
  // Can be either full Hook objects or TeamHook references
  hooks?: Array<Hook | { hookId: string; order?: number }>;
  // Can be either full McpServer objects or TeamMcp references
  mcpServers?: Array<McpServer | { mcpId: string; order?: number }>;
  settings?: Record<string, unknown>;
  security?: {
    configured?: boolean;
    permissions?: {
      allow?: string[];
      deny?: string[];
      ask?: string[];
    };
    env?: Record<string, string>;
  };
  memoryBank?: {
    projectBrief?: string;
    techContext?: string;
    activeContext?: string;
  };
}

export interface DeploymentOptions {
  clearExisting?: boolean;
  useLocal?: boolean;
  deployGlobal?: boolean;
  useRulesFolder?: boolean;
  rulesFileName?: string;
  deployMemoryBank?: boolean;
}

export interface DeploymentValidation {
  valid: boolean;
  warnings: Array<{
    system: AISystem;
    feature: string;
    message: string;
  }>;
  errors: string[];
}

export interface DeploymentResult {
  system: AISystem;
  success: boolean;
  error?: string;
  details: Record<string, unknown>;
  warnings?: string[];
}

export interface MultiDeploymentResult {
  results: Record<AISystem, DeploymentResult>;
  validation: DeploymentValidation;
  errors: Array<{ system: AISystem; error: string }>;
  success: boolean;
}

// Deployed configuration detection types
export interface DeployedFileInfo {
  exists: boolean;
  path: string;
  modifiedAt?: string;
  count?: number;
  isFolder?: boolean;
  fileCount?: number;
}

export interface DeployedClaudeConfig {
  directory: DeployedFileInfo;
  constitution: DeployedFileInfo;
  constitutionLocal: DeployedFileInfo;
  agents: DeployedFileInfo;
  skills: DeployedFileInfo;
  settings: DeployedFileInfo;
  mcp: DeployedFileInfo;
}

export interface DeployedGeminiConfig {
  constitution: DeployedFileInfo;
}

export interface DeployedGeminiGlobalConfig {
  directory: DeployedFileInfo;
  constitution: DeployedFileInfo;
  settings: DeployedFileInfo;
}

export interface DeployedClineConfig {
  rules: DeployedFileInfo;
  memoryBank: DeployedFileInfo;
  mcp: DeployedFileInfo;
}

export interface DeployedSystemConfig {
  system: AISystem;
  deployed: boolean;
  project: DeployedClaudeConfig | DeployedGeminiConfig | DeployedClineConfig | null;
  global: DeployedGeminiGlobalConfig | null;
}

export type AllDeployedConfigs = Record<AISystem, DeployedSystemConfig>;

// Access the Electron API exposed via preload script
declare global {
  interface Window {
    electronAPI: {
      // Dialog
      selectFolder: () => Promise<string | null>;
      openFolder: (folderPath: string) => Promise<string>;

      // Git commands (read-only)
      isGitRepo: (path: string) => Promise<boolean>;
      getRepoStatus: (path: string) => Promise<string[]>;

      // Project commands
      analyzeProject: (path: string) => Promise<ProjectAnalysis>;

      // Agent commands
      getAgentLibrary: (devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string) => Promise<AgentLibraryResponse>;
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
      createAgentTemplate: (agent: Partial<Agent>, devPath?: string, projectPath?: string) => Promise<{ success: boolean; path: string; agentId: string; message: string }>;
      updateAgentTemplate: (agentId: string, agent: Partial<Agent>, devPath?: string, projectPath?: string) => Promise<{ success: boolean; path: string; message: string }>;
      deleteAgentTemplate: (agentId: string, devPath?: string, projectPath?: string) => Promise<{ success: boolean; message: string }>;
      openAgentTemplateFile: (agentId: string, devPath?: string, projectPath?: string) => Promise<{ success: boolean; path: string }>;
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
      loadTemplateSkills: (devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string) => Promise<Skill[]>;
      createSkillTemplate: (skill: Partial<Skill>) => Promise<{ success: boolean; path: string; skillId: string; message: string }>;
      updateSkillTemplate: (skillId: string, skill: Partial<Skill>) => Promise<{ success: boolean; path: string; message: string }>;
      deleteSkillTemplate: (skillId: string) => Promise<{ success: boolean; message: string }>;
      openSkillTemplateFile: (skillId: string, devPath?: string, projectPath?: string) => Promise<{ success: boolean; path: string }>;

      // Team commands
      listTeams: (projectPath: string) => Promise<Team[]>;
      loadTeam: (projectPath: string, teamId: string) => Promise<Team>;
      saveTeam: (projectPath: string, team: Team) => Promise<{
        success: boolean;
        teamId: string;
        message: string;
      }>;
      deleteTeam: (projectPath: string, teamId: string) => Promise<{
        success: boolean;
        message: string;
      }>;
      deployTeam: (
        projectPath: string,
        teamId: string
      ) => Promise<{
        success: boolean;
        message: string;
        teamId: string;
      }>;
      getDeployedTeam: (projectPath: string) => Promise<{
        teamId: string;
        teamName: string;
        deployedAt: string | null;
      } | null>;
      generateTeamAgents: (
        projectPath: string,
        teamId: string,
        agentLibrary: Agent[]
      ) => Promise<{
        success: boolean;
        filesGenerated: number;
        files: string[];
      }>;
      generateTeamSkills: (
        projectPath: string,
        teamId: string,
        skillLibrary: any[]
      ) => Promise<{
        success: boolean;
        dirsGenerated: number;
        dirs: string[];
      }>;
      generateTeamSettings: (
        projectPath: string,
        teamId: string,
        hookLibrary: any[]
      ) => Promise<{
        success: boolean;
        settingsGenerated: boolean;
        localSettingsGenerated: boolean;
      }>;
      generateTeamMcpConfig: (
        projectPath: string,
        teamId: string,
        mcpLibrary: McpServer[]
      ) => Promise<{
        success: boolean;
        mcpConfigGenerated: boolean;
        serversCount: number;
      }>;

      // Agent Repository commands
      syncAgentRepository: (repoUrl: string, branch: string, cachePath?: string, projectPath?: string, sourcePath?: string) => Promise<{
        success: boolean;
        path: string;
        message: string;
        timestamp: string;
        categories?: number;
        files?: number;
      }>;
      getAgentRepositoryPath: () => Promise<string>;
      getAgentRepositoryStats: (cachePath?: string, projectPath?: string, sourcePath?: string) => Promise<{
        exists: boolean;
        path?: string;
        categories: number;
        files: number;
        error?: string;
      }>;
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
      deleteAgentRepository: (cachePath?: string, projectPath?: string) => Promise<{ success: boolean; message: string; path?: string }>;
      reloadAgents: (devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string) => Promise<{
        success: boolean;
        agentCount: number;
        source: string;
        loadedFrom: string;
      }>;

      // Hook commands
      loadTemplateHooks: (devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string) => Promise<Hook[]>;
      createHookTemplate: (hook: Partial<Hook>) => Promise<{ success: boolean; hookId: string; message: string }>;
      updateHookTemplate: (hookId: string, hook: Partial<Hook>) => Promise<{ success: boolean; message: string }>;
      deleteHookTemplate: (hookId: string) => Promise<{ success: boolean; message: string }>;
      openHookTemplateFile: (devPath?: string, projectPath?: string) => Promise<{ success: boolean; path: string }>;
      listHooks: (projectPath: string, settingsFileName?: string) => Promise<Array<{
        event: string;
        matcher: string;
        command: string;
        type: string;
      }>>;
      deployHook: (projectPath: string, hook: Hook, settingsFileName?: string) => Promise<string>;
      removeHook: (
        projectPath: string,
        hookEvent: string,
        matcher: string,
        command: string,
        settingsFileName?: string
      ) => Promise<string>;
      hookDirExists: (projectPath: string) => Promise<boolean>;
      ensureHooksDir: (projectPath: string) => Promise<string>;

      // Constitution commands
      getConstitutionLibrary: (devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string) => Promise<ConstitutionLibraryResponse>;
      reloadConstitutions: (devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string) => Promise<ConstitutionLibraryResponse>;
      getConstitutionById: (id: string, devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string) => Promise<Constitution | null>;
      createConstitutionTemplate: (name: string, description: string, content: string, category: ConstitutionCategory, tags: string[], targetSystem: AISystem | undefined, devPath: string, projectPath?: string) => Promise<{ success: boolean; filePath: string }>;
      updateConstitutionTemplate: (id: string, name: string, description: string, content: string, category: ConstitutionCategory, tags: string[], targetSystem: AISystem | undefined, devPath: string, projectPath?: string) => Promise<{ success: boolean; filePath: string }>;
      deleteConstitutionTemplate: (id: string, devPath: string, projectPath?: string) => Promise<{ success: boolean }>;

      // Deployment commands
      getDeploymentSystems: () => Promise<AISystem[]>;
      getDeploymentCapabilities: (system: AISystem, projectPath: string) => Promise<SystemCapabilities>;
      getAllDeploymentCapabilities: (projectPath: string) => Promise<Record<AISystem, SystemCapabilities>>;
      validateDeployment: (team: DeploymentTeam, targetSystems: AISystem[], projectPath: string) => Promise<DeploymentValidation>;
      deploy: (team: DeploymentTeam, targetSystem: AISystem, projectPath: string, options?: DeploymentOptions) => Promise<DeploymentResult>;
      deployMultiple: (team: DeploymentTeam, targetSystems: AISystem[], projectPath: string, options?: DeploymentOptions) => Promise<MultiDeploymentResult>;
      detectDeployedConfig: (system: AISystem, projectPath: string) => Promise<DeployedSystemConfig>;
      detectAllDeployedConfigs: (projectPath: string) => Promise<AllDeployedConfigs>;

      // MCP Server commands
      listMcpServers: (projectPath: string) => Promise<McpServer[]>;
      loadTemplateMcps: (devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string) => Promise<McpServer[]>;
      createMcpTemplate: (mcp: Partial<McpServer>, devPath?: string, projectPath?: string) => Promise<{ success: boolean; path: string; mcpId: string; message: string }>;
      updateMcpTemplate: (mcpId: string, mcp: Partial<McpServer>, devPath?: string, projectPath?: string) => Promise<{ success: boolean; path: string; message: string }>;
      deleteMcpTemplate: (mcpId: string, devPath?: string, projectPath?: string) => Promise<{ success: boolean; message: string }>;
      openMcpTemplateFile: (mcpId: string, devPath?: string, projectPath?: string) => Promise<{ success: boolean; path: string }>;

      // TeamForge Settings commands (project-level .teamforge/settings.json)
      loadTeamforgeSettings: (projectPath: string) => Promise<{
        exists: boolean;
        path: string;
        settings: TeamforgeSettings;
      }>;
      saveTeamforgeSettings: (projectPath: string, settings: TeamforgeSettings) => Promise<{
        success: boolean;
        path: string;
        message: string;
      }>;
      teamforgeSettingsExists: (projectPath: string) => Promise<boolean>;

      // Claude Settings commands
      loadClaudeSettings: (projectPath: string, settingsFileName?: string) => Promise<{
        exists: boolean;
        path: string;
        settings: ClaudeSettings;
      }>;
      saveClaudeSettings: (
        projectPath: string,
        settings: ClaudeSettings,
        settingsFileName?: string
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
      claudeSettingsExists: (projectPath: string, settingsFileName?: string) => Promise<boolean>;
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
// Git Commands (read-only)
// ============================================================================

export async function isGitRepo(path: string): Promise<boolean> {
  return window.electronAPI.isGitRepo(path);
}

export async function getRepoStatus(path: string): Promise<string[]> {
  return window.electronAPI.getRepoStatus(path);
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

export async function getAgentLibrary(devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string): Promise<AgentLibraryResponse> {
  return window.electronAPI.getAgentLibrary(devMode, cachePath, devPath, projectPath, sourcePath);
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

// Developer Mode - Agent Template CRUD
export async function createAgentTemplate(
  agent: Partial<Agent>,
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  path: string;
  agentId: string;
  message: string;
}> {
  return window.electronAPI.createAgentTemplate(agent, devPath, projectPath);
}

export async function updateAgentTemplate(
  agentId: string,
  agent: Partial<Agent>,
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  path: string;
  message: string;
}> {
  return window.electronAPI.updateAgentTemplate(agentId, agent, devPath, projectPath);
}

export async function deleteAgentTemplate(
  agentId: string,
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  return window.electronAPI.deleteAgentTemplate(agentId, devPath, projectPath);
}

export async function openAgentTemplateFile(
  agentId: string,
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  path: string;
}> {
  return window.electronAPI.openAgentTemplateFile(agentId, devPath, projectPath);
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

export async function loadTemplateSkills(
  devMode?: boolean,
  cachePath?: string,
  devPath?: string,
  projectPath?: string,
  sourcePath?: string
): Promise<Skill[]> {
  return window.electronAPI.loadTemplateSkills(devMode, cachePath, devPath, projectPath, sourcePath);
}

// Developer Mode - Skill Template CRUD
export async function createSkillTemplate(skill: Partial<Skill>): Promise<{
  success: boolean;
  path: string;
  skillId: string;
  message: string;
}> {
  return window.electronAPI.createSkillTemplate(skill);
}

export async function updateSkillTemplate(skillId: string, skill: Partial<Skill>): Promise<{
  success: boolean;
  path: string;
  message: string;
}> {
  return window.electronAPI.updateSkillTemplate(skillId, skill);
}

export async function deleteSkillTemplate(skillId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return window.electronAPI.deleteSkillTemplate(skillId);
}

export async function openSkillTemplateFile(
  skillId: string,
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  path: string;
}> {
  return window.electronAPI.openSkillTemplateFile(skillId, devPath, projectPath);
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
): Promise<{ success: boolean; teamId: string; message: string }> {
  return window.electronAPI.saveTeam(projectPath, team);
}

export async function deleteTeam(
  projectPath: string,
  teamId: string
): Promise<{ success: boolean; message: string }> {
  return window.electronAPI.deleteTeam(projectPath, teamId);
}

export async function deployTeam(
  projectPath: string,
  teamId: string
): Promise<{ success: boolean; message: string; teamId: string }> {
  return window.electronAPI.deployTeam(projectPath, teamId);
}

export async function getDeployedTeam(
  projectPath: string
): Promise<{ teamId: string; teamName: string; deployedAt: string | null } | null> {
  return window.electronAPI.getDeployedTeam(projectPath);
}

export async function generateTeamAgents(
  projectPath: string,
  teamId: string,
  agentLibrary: Agent[]
): Promise<{ success: boolean; filesGenerated: number; files: string[] }> {
  return window.electronAPI.generateTeamAgents(projectPath, teamId, agentLibrary);
}

export async function generateTeamSkills(
  projectPath: string,
  teamId: string,
  skillLibrary: any[]
): Promise<{ success: boolean; dirsGenerated: number; dirs: string[] }> {
  return window.electronAPI.generateTeamSkills(projectPath, teamId, skillLibrary);
}

export async function generateTeamSettings(
  projectPath: string,
  teamId: string,
  hookLibrary: any[]
): Promise<{ success: boolean; settingsGenerated: boolean; localSettingsGenerated: boolean }> {
  return window.electronAPI.generateTeamSettings(projectPath, teamId, hookLibrary);
}

export async function generateTeamMcpConfig(
  projectPath: string,
  teamId: string,
  mcpLibrary: McpServer[]
): Promise<{ success: boolean; mcpConfigGenerated: boolean; serversCount: number }> {
  return window.electronAPI.generateTeamMcpConfig(projectPath, teamId, mcpLibrary);
}

// ============================================================================
// Agent Repository Commands
// ============================================================================

export async function syncAgentRepository(repoUrl: string, branch: string = 'main', cachePath?: string, projectPath?: string, sourcePath?: string) {
  return window.electronAPI.syncAgentRepository(repoUrl, branch, cachePath, projectPath, sourcePath);
}

export async function getAgentRepositoryPath(): Promise<string> {
  return window.electronAPI.getAgentRepositoryPath();
}

export async function getAgentRepositoryStats(cachePath?: string, projectPath?: string, sourcePath?: string) {
  return window.electronAPI.getAgentRepositoryStats(cachePath, projectPath, sourcePath);
}

export async function getAgentRepositoryStatus() {
  return window.electronAPI.getAgentRepositoryStatus();
}

export async function deleteAgentRepository(cachePath?: string, projectPath?: string) {
  return window.electronAPI.deleteAgentRepository(cachePath, projectPath);
}

export async function reloadAgents(devMode?: boolean, cachePath?: string, devPath?: string, projectPath?: string, sourcePath?: string) {
  return window.electronAPI.reloadAgents(devMode, cachePath, devPath, projectPath, sourcePath);
}

// ============================================================================
// Hook Commands
// ============================================================================

export async function loadTemplateHooks(
  devMode?: boolean,
  cachePath?: string,
  devPath?: string,
  projectPath?: string,
  sourcePath?: string
): Promise<Hook[]> {
  return window.electronAPI.loadTemplateHooks(devMode, cachePath, devPath, projectPath, sourcePath);
}

// Developer Mode - Hook Template CRUD
export async function createHookTemplate(hook: Partial<Hook>): Promise<{
  success: boolean;
  hookId: string;
  message: string;
}> {
  return window.electronAPI.createHookTemplate(hook);
}

export async function updateHookTemplate(hookId: string, hook: Partial<Hook>): Promise<{
  success: boolean;
  message: string;
}> {
  return window.electronAPI.updateHookTemplate(hookId, hook);
}

export async function deleteHookTemplate(hookId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return window.electronAPI.deleteHookTemplate(hookId);
}

export async function openHookTemplateFile(
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  path: string;
}> {
  return window.electronAPI.openHookTemplateFile(devPath, projectPath);
}

export async function listHooks(projectPath: string, settingsFileName?: string): Promise<Array<{
  event: string;
  matcher: string;
  command: string;
  type: string;
}>> {
  return window.electronAPI.listHooks(projectPath, settingsFileName);
}

export async function deployHook(
  projectPath: string,
  hook: Hook,
  settingsFileName?: string
): Promise<string> {
  return window.electronAPI.deployHook(projectPath, hook, settingsFileName);
}

export async function removeHook(
  projectPath: string,
  hookEvent: string,
  matcher: string,
  command: string,
  settingsFileName?: string
): Promise<string> {
  return window.electronAPI.removeHook(projectPath, hookEvent, matcher, command, settingsFileName);
}

export async function hookDirExists(projectPath: string): Promise<boolean> {
  return window.electronAPI.hookDirExists(projectPath);
}

export async function ensureHooksDir(projectPath: string): Promise<string> {
  return window.electronAPI.ensureHooksDir(projectPath);
}

// ============================================================================
// MCP Server Commands
// ============================================================================

export async function listMcpServers(projectPath: string): Promise<McpServer[]> {
  return window.electronAPI.listMcpServers(projectPath);
}

export async function loadTemplateMcps(
  devMode?: boolean,
  cachePath?: string,
  devPath?: string,
  projectPath?: string,
  sourcePath?: string
): Promise<McpServer[]> {
  return window.electronAPI.loadTemplateMcps(devMode, cachePath, devPath, projectPath, sourcePath);
}

// Developer Mode - MCP Template CRUD
export async function createMcpTemplate(
  mcp: Partial<McpServer>,
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  path: string;
  mcpId: string;
  message: string;
}> {
  return window.electronAPI.createMcpTemplate(mcp, devPath, projectPath);
}

export async function updateMcpTemplate(
  mcpId: string,
  mcp: Partial<McpServer>,
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  path: string;
  message: string;
}> {
  return window.electronAPI.updateMcpTemplate(mcpId, mcp, devPath, projectPath);
}

export async function deleteMcpTemplate(
  mcpId: string,
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  return window.electronAPI.deleteMcpTemplate(mcpId, devPath, projectPath);
}

export async function openMcpTemplateFile(
  mcpId: string,
  devPath?: string,
  projectPath?: string
): Promise<{
  success: boolean;
  path: string;
}> {
  return window.electronAPI.openMcpTemplateFile(mcpId, devPath, projectPath);
}

// ============================================================================
// TeamForge Settings Commands (project-level .teamforge/settings.json)
// ============================================================================

export async function loadTeamforgeSettings(projectPath: string): Promise<{
  exists: boolean;
  path: string;
  settings: TeamforgeSettings;
}> {
  return window.electronAPI.loadTeamforgeSettings(projectPath);
}

export async function saveTeamforgeSettings(
  projectPath: string,
  settings: TeamforgeSettings
): Promise<{
  success: boolean;
  path: string;
  message: string;
}> {
  return window.electronAPI.saveTeamforgeSettings(projectPath, settings);
}

export async function teamforgeSettingsExists(projectPath: string): Promise<boolean> {
  return window.electronAPI.teamforgeSettingsExists(projectPath);
}

// ============================================================================
// Claude Settings Commands
// ============================================================================

export async function loadClaudeSettings(projectPath: string, settingsFileName?: string): Promise<{
  exists: boolean;
  path: string;
  settings: ClaudeSettings;
}> {
  return window.electronAPI.loadClaudeSettings(projectPath, settingsFileName);
}

export async function saveClaudeSettings(
  projectPath: string,
  settings: ClaudeSettings,
  settingsFileName?: string
): Promise<{
  success: boolean;
  path: string;
  message: string;
}> {
  return window.electronAPI.saveClaudeSettings(projectPath, settings, settingsFileName);
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

export async function claudeSettingsExists(projectPath: string, settingsFileName?: string): Promise<boolean> {
  return window.electronAPI.claudeSettingsExists(projectPath, settingsFileName);
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

// ============================================================================
// Constitution Commands
// ============================================================================

export interface ConstitutionLibraryResponse {
  version: string;
  constitutions: Constitution[];
  categories: ConstitutionCategory[];
  source?: string;
  loadedFrom?: string;
}

export async function getConstitutionLibrary(
  devMode?: boolean,
  cachePath?: string,
  devPath?: string,
  projectPath?: string,
  sourcePath?: string
): Promise<ConstitutionLibraryResponse> {
  return window.electronAPI.getConstitutionLibrary(devMode, cachePath, devPath, projectPath, sourcePath);
}

export async function reloadConstitutions(
  devMode?: boolean,
  cachePath?: string,
  devPath?: string,
  projectPath?: string,
  sourcePath?: string
): Promise<ConstitutionLibraryResponse> {
  return window.electronAPI.reloadConstitutions(devMode, cachePath, devPath, projectPath, sourcePath);
}

export async function getConstitutionById(
  id: string,
  devMode?: boolean,
  cachePath?: string,
  devPath?: string,
  projectPath?: string,
  sourcePath?: string
): Promise<Constitution | null> {
  return window.electronAPI.getConstitutionById(id, devMode, cachePath, devPath, projectPath, sourcePath);
}

export async function createConstitutionTemplate(
  name: string,
  description: string,
  content: string,
  category: ConstitutionCategory,
  tags: string[],
  targetSystem: AISystem | undefined,
  devPath: string,
  projectPath?: string
): Promise<{ success: boolean; filePath: string }> {
  return window.electronAPI.createConstitutionTemplate(name, description, content, category, tags, targetSystem, devPath, projectPath);
}

export async function updateConstitutionTemplate(
  id: string,
  name: string,
  description: string,
  content: string,
  category: ConstitutionCategory,
  tags: string[],
  targetSystem: AISystem | undefined,
  devPath: string,
  projectPath?: string
): Promise<{ success: boolean; filePath: string }> {
  return window.electronAPI.updateConstitutionTemplate(id, name, description, content, category, tags, targetSystem, devPath, projectPath);
}

export async function deleteConstitutionTemplate(
  id: string,
  devPath: string,
  projectPath?: string
): Promise<{ success: boolean }> {
  return window.electronAPI.deleteConstitutionTemplate(id, devPath, projectPath);
}

// ============================================================================
// Deployment
// ============================================================================

export async function getDeploymentSystems(): Promise<AISystem[]> {
  return window.electronAPI.getDeploymentSystems();
}

export async function getDeploymentCapabilities(
  system: AISystem,
  projectPath: string
): Promise<SystemCapabilities> {
  return window.electronAPI.getDeploymentCapabilities(system, projectPath);
}

export async function getAllDeploymentCapabilities(
  projectPath: string
): Promise<Record<AISystem, SystemCapabilities>> {
  return window.electronAPI.getAllDeploymentCapabilities(projectPath);
}

export async function validateDeployment(
  team: DeploymentTeam,
  targetSystems: AISystem[],
  projectPath: string
): Promise<DeploymentValidation> {
  return window.electronAPI.validateDeployment(team, targetSystems, projectPath);
}

export async function deploy(
  team: DeploymentTeam,
  targetSystem: AISystem,
  projectPath: string,
  options?: DeploymentOptions
): Promise<DeploymentResult> {
  return window.electronAPI.deploy(team, targetSystem, projectPath, options);
}

export async function deployMultiple(
  team: DeploymentTeam,
  targetSystems: AISystem[],
  projectPath: string,
  options?: DeploymentOptions
): Promise<MultiDeploymentResult> {
  return window.electronAPI.deployMultiple(team, targetSystems, projectPath, options);
}

export async function detectDeployedConfig(
  system: AISystem,
  projectPath: string
): Promise<DeployedSystemConfig> {
  return window.electronAPI.detectDeployedConfig(system, projectPath);
}

export async function detectAllDeployedConfigs(
  projectPath: string
): Promise<AllDeployedConfigs> {
  return window.electronAPI.detectAllDeployedConfigs(projectPath);
}

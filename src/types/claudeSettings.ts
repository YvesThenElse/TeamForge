// Claude Code Settings Types
// Based on: https://code.claude.com/docs/en/settings

export interface PermissionRule {
  matcher?: string;
  path?: string;
  tool?: string;
}

export interface PermissionSettings {
  allow?: PermissionRule[];
  ask?: PermissionRule[];
  deny?: PermissionRule[];
  additionalDirectories?: string[];
  defaultMode?: "allow" | "ask" | "deny";
  disableBypassPermissionsMode?: boolean;
}

export interface SandboxNetworkSettings {
  allowUnixSockets?: string[];
  allowLocalBinding?: boolean;
  httpProxyPort?: number;
  socksProxyPort?: number;
}

export interface SandboxSettings {
  enabled?: boolean;
  autoAllowBashIfSandboxed?: boolean;
  excludedCommands?: string[];
  allowUnsandboxedCommands?: boolean;
  network?: SandboxNetworkSettings;
  enableWeakerNestedSandbox?: boolean;
}

export interface MCPServerSettings {
  enableAllProjectMcpServers?: boolean;
  enabledMcpjsonServers?: string[];
  disabledMcpjsonServers?: string[];
  allowedMcpServers?: string[];
  deniedMcpServers?: string[];
}

export interface PluginMarketplace {
  url: string;
  name?: string;
}

export interface PluginSettings {
  enabledPlugins?: Record<string, boolean>;
  extraKnownMarketplaces?: Record<string, PluginMarketplace>;
}

export interface StatusLineSettings {
  enabled?: boolean;
  format?: string;
  refresh?: number;
}

export interface ClaudeSettings {
  // Core Settings
  apiKeyHelper?: string;
  cleanupPeriodDays?: number;
  model?: string;
  includeCoAuthoredBy?: boolean;
  forceLoginMethod?: "claudeai" | "console";
  forceLoginOrgUUID?: string;
  disableAllHooks?: boolean;
  outputStyle?: string;
  statusLine?: StatusLineSettings;

  // Permission Settings
  permissions?: PermissionSettings;

  // Sandbox Settings
  sandbox?: SandboxSettings;

  // MCP Server Settings
  enableAllProjectMcpServers?: boolean;
  enabledMcpjsonServers?: string[];
  disabledMcpjsonServers?: string[];
  allowedMcpServers?: string[];
  deniedMcpServers?: string[];

  // Plugin Settings
  enabledPlugins?: Record<string, boolean>;
  extraKnownMarketplaces?: Record<string, PluginMarketplace>;

  // Enterprise & AWS Settings
  awsAuthRefresh?: string;
  awsCredentialExport?: string;
  companyAnnouncements?: Array<{
    message: string;
    severity?: "info" | "warning" | "error";
    expiresAt?: string;
  }>;
  env?: Record<string, string>;

  // Hooks (already handled separately)
  hooks?: any;
}

// Available tools in Claude Code
export const CLAUDE_TOOLS = [
  { name: "Bash", requiresPermission: true, description: "Execute shell commands" },
  { name: "Edit", requiresPermission: true, description: "Make targeted file edits" },
  { name: "Glob", requiresPermission: false, description: "Pattern-based file discovery" },
  { name: "Grep", requiresPermission: false, description: "Search file contents" },
  { name: "NotebookEdit", requiresPermission: true, description: "Edit Jupyter notebooks" },
  { name: "Read", requiresPermission: false, description: "Read file contents" },
  { name: "SlashCommand", requiresPermission: true, description: "Execute slash commands" },
  { name: "Task", requiresPermission: false, description: "Run sub-agents" },
  { name: "TodoWrite", requiresPermission: false, description: "Manage task lists" },
  { name: "WebFetch", requiresPermission: true, description: "Fetch web content" },
  { name: "WebSearch", requiresPermission: true, description: "Search the web" },
  { name: "Write", requiresPermission: true, description: "Create/overwrite files" },
] as const;

export type ClaudeToolName = typeof CLAUDE_TOOLS[number]["name"];

// Settings locations
export type SettingsLocation = "project" | "project-local" | "user" | "managed";

export interface SettingsFile {
  location: SettingsLocation;
  path: string;
  settings: ClaudeSettings;
  exists: boolean;
}

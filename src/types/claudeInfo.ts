// Claude configuration info types

export interface ClaudeInfo {
  exists: boolean;
  agentsDir: boolean;
  settingsFile: boolean;
  settings: Record<string, any> | null;
  claudePath?: string;
  agents?: string[]; // List of agent names (without .md extension)
  skillsDir?: boolean; // Whether .claude/skills/ directory exists
  skills?: string[]; // List of skill names (directory names)
}

export interface GlobalClaudeInfo {
  exists: boolean;
  agentsDir: boolean;
  settingsJsonFile: boolean;
  agentsCount: number;
  settings: Record<string, any> | null;
  claudePath?: string;
}

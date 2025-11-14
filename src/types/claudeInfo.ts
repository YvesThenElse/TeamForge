// Claude configuration info types

export interface ClaudeInfo {
  exists: boolean;
  agentsDir: boolean;
  settingsFile: boolean;
  settings: Record<string, any> | null;
  claudePath?: string;
}

export interface GlobalClaudeInfo {
  exists: boolean;
  agentsDir: boolean;
  settingsJsonFile: boolean;
  agentsCount: number;
  settings: Record<string, any> | null;
  claudePath?: string;
}

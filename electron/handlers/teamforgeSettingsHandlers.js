import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = 'settings.json';

// Default settings values
const DEFAULT_SETTINGS = {
  // Agent Source Settings
  agentRepoUrl: "",
  agentRepoBranch: "main",
  agentSourcePath: "",
  agentDevPath: "",
  agentCachePath: ".teamforge/cache/agents",
  agentLastSync: null,

  // Skills Source Settings
  skillRepoUrl: "",
  skillRepoBranch: "main",
  skillSourcePath: "",
  skillDevPath: "",
  skillCachePath: ".teamforge/cache/skills",
  skillLastSync: null,

  // Hooks Source Settings
  hookRepoUrl: "",
  hookRepoBranch: "main",
  hookSourcePath: "",
  hookDevPath: "",
  hookCachePath: ".teamforge/cache/hooks",
  hookLastSync: null,

  // Application Preferences
  autoSync: false,
  theme: "system",
  confirmDeploy: true,
  claudeSettingsFile: "settings.local.json",
  developerMode: false,

  // Default Agent Configuration
  defaultModel: "sonnet",
  defaultTools: "*",

  // Security settings
  security: {
    allowedCommands: [],
    blockedCommands: [],
    requireConfirmation: true,
  },
};

export function registerTeamforgeSettingsHandlers(ipcMain) {
  // Load TeamForge app settings from .teamforge/settings.json
  ipcMain.handle('teamforgeSettings:load', async (event, { projectPath }) => {
    try {
      const teamforgeDir = path.join(projectPath, '.teamforge');
      const settingsPath = path.join(teamforgeDir, SETTINGS_FILE);

      try {
        const content = await fs.readFile(settingsPath, 'utf-8');
        const settings = JSON.parse(content);
        console.log('[teamforgeSettings:load] Loaded settings from:', settingsPath);
        return {
          exists: true,
          path: settingsPath,
          settings: { ...DEFAULT_SETTINGS, ...settings },
        };
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log('[teamforgeSettings:load] Settings file not found, returning defaults');
          return {
            exists: false,
            path: settingsPath,
            settings: DEFAULT_SETTINGS,
          };
        }
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to load TeamForge settings: ${error.message}`);
    }
  });

  // Save TeamForge app settings to .teamforge/settings.json
  ipcMain.handle('teamforgeSettings:save', async (event, { projectPath, settings }) => {
    try {
      const teamforgeDir = path.join(projectPath, '.teamforge');

      // Create .teamforge directory if it doesn't exist
      await fs.mkdir(teamforgeDir, { recursive: true });

      const settingsPath = path.join(teamforgeDir, SETTINGS_FILE);

      // Only save data fields, not functions
      const dataToSave = {
        agentRepoUrl: settings.agentRepoUrl,
        agentRepoBranch: settings.agentRepoBranch,
        agentSourcePath: settings.agentSourcePath,
        agentDevPath: settings.agentDevPath,
        agentCachePath: settings.agentCachePath,
        agentLastSync: settings.agentLastSync,
        skillRepoUrl: settings.skillRepoUrl,
        skillRepoBranch: settings.skillRepoBranch,
        skillSourcePath: settings.skillSourcePath,
        skillDevPath: settings.skillDevPath,
        skillCachePath: settings.skillCachePath,
        skillLastSync: settings.skillLastSync,
        hookRepoUrl: settings.hookRepoUrl,
        hookRepoBranch: settings.hookRepoBranch,
        hookSourcePath: settings.hookSourcePath,
        hookDevPath: settings.hookDevPath,
        hookCachePath: settings.hookCachePath,
        hookLastSync: settings.hookLastSync,
        autoSync: settings.autoSync,
        theme: settings.theme,
        confirmDeploy: settings.confirmDeploy,
        claudeSettingsFile: settings.claudeSettingsFile,
        developerMode: settings.developerMode,
        defaultModel: settings.defaultModel,
        defaultTools: settings.defaultTools,
        security: settings.security,
      };

      const content = JSON.stringify(dataToSave, null, 2);
      await fs.writeFile(settingsPath, content, 'utf-8');

      console.log('[teamforgeSettings:save] Settings saved to:', settingsPath);
      return {
        success: true,
        path: settingsPath,
        message: 'Settings saved successfully',
      };
    } catch (error) {
      throw new Error(`Failed to save TeamForge settings: ${error.message}`);
    }
  });

  // Check if settings file exists
  ipcMain.handle('teamforgeSettings:exists', async (event, { projectPath }) => {
    try {
      const settingsPath = path.join(projectPath, '.teamforge', SETTINGS_FILE);
      await fs.access(settingsPath);
      return true;
    } catch {
      return false;
    }
  });
}

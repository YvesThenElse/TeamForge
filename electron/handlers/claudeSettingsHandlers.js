import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerClaudeSettingsHandlers(ipcMain) {
  // Load settings from .claude/settings.json
  ipcMain.handle('claudeSettings:load', async (event, { projectPath }) => {
    try {
      const settingsPath = path.join(projectPath, '.claude', 'settings.json');

      // Check if settings file exists
      try {
        await fs.access(settingsPath);
      } catch {
        // File doesn't exist, return empty settings
        return {
          exists: false,
          path: settingsPath,
          settings: {},
        };
      }

      const content = await fs.readFile(settingsPath, 'utf-8');
      const settings = JSON.parse(content);

      return {
        exists: true,
        path: settingsPath,
        settings,
      };
    } catch (error) {
      console.error('Failed to load Claude settings:', error);
      throw new Error(`Failed to load Claude settings: ${error.message}`);
    }
  });

  // Save settings to .claude/settings.json
  ipcMain.handle('claudeSettings:save', async (event, { projectPath, settings }) => {
    try {
      const claudeDir = path.join(projectPath, '.claude');
      const settingsPath = path.join(claudeDir, 'settings.json');

      // Ensure .claude directory exists
      await fs.mkdir(claudeDir, { recursive: true });

      // Save settings
      await fs.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2),
        'utf-8'
      );

      return {
        success: true,
        path: settingsPath,
        message: 'Claude settings saved successfully',
      };
    } catch (error) {
      console.error('Failed to save Claude settings:', error);
      throw new Error(`Failed to save Claude settings: ${error.message}`);
    }
  });

  // Load user-level settings from ~/.claude/settings.json
  ipcMain.handle('claudeSettings:loadUser', async () => {
    try {
      const homeDir = os.homedir();
      const settingsPath = path.join(homeDir, '.claude', 'settings.json');

      try {
        await fs.access(settingsPath);
      } catch {
        return {
          exists: false,
          path: settingsPath,
          settings: {},
        };
      }

      const content = await fs.readFile(settingsPath, 'utf-8');
      const settings = JSON.parse(content);

      return {
        exists: true,
        path: settingsPath,
        settings,
      };
    } catch (error) {
      console.error('Failed to load user Claude settings:', error);
      throw new Error(`Failed to load user Claude settings: ${error.message}`);
    }
  });

  // Get all settings (merged from all locations)
  ipcMain.handle('claudeSettings:loadAll', async (event, { projectPath }) => {
    try {
      const settingsFiles = [];

      // 1. User settings (~/.claude/settings.json)
      const homeDir = os.homedir();
      const userSettingsPath = path.join(homeDir, '.claude', 'settings.json');
      try {
        await fs.access(userSettingsPath);
        const content = await fs.readFile(userSettingsPath, 'utf-8');
        settingsFiles.push({
          location: 'user',
          path: userSettingsPath,
          settings: JSON.parse(content),
          exists: true,
        });
      } catch {
        settingsFiles.push({
          location: 'user',
          path: userSettingsPath,
          settings: {},
          exists: false,
        });
      }

      // 2. Project settings (.claude/settings.json)
      const projectSettingsPath = path.join(projectPath, '.claude', 'settings.json');
      try {
        await fs.access(projectSettingsPath);
        const content = await fs.readFile(projectSettingsPath, 'utf-8');
        settingsFiles.push({
          location: 'project',
          path: projectSettingsPath,
          settings: JSON.parse(content),
          exists: true,
        });
      } catch {
        settingsFiles.push({
          location: 'project',
          path: projectSettingsPath,
          settings: {},
          exists: false,
        });
      }

      // 3. Project local settings (.claude/settings.local.json)
      const projectLocalSettingsPath = path.join(projectPath, '.claude', 'settings.local.json');
      try {
        await fs.access(projectLocalSettingsPath);
        const content = await fs.readFile(projectLocalSettingsPath, 'utf-8');
        settingsFiles.push({
          location: 'project-local',
          path: projectLocalSettingsPath,
          settings: JSON.parse(content),
          exists: true,
        });
      } catch {
        settingsFiles.push({
          location: 'project-local',
          path: projectLocalSettingsPath,
          settings: {},
          exists: false,
        });
      }

      // Merge settings (later files override earlier ones)
      const mergedSettings = {};
      for (const file of settingsFiles) {
        Object.assign(mergedSettings, file.settings);
      }

      return {
        files: settingsFiles,
        merged: mergedSettings,
      };
    } catch (error) {
      console.error('Failed to load all Claude settings:', error);
      throw new Error(`Failed to load all Claude settings: ${error.message}`);
    }
  });

  // Check if settings file exists
  ipcMain.handle('claudeSettings:exists', async (event, { projectPath }) => {
    try {
      const settingsPath = path.join(projectPath, '.claude', 'settings.json');
      await fs.access(settingsPath);
      return true;
    } catch {
      return false;
    }
  });

  // Ensure .claude directory exists
  ipcMain.handle('claudeSettings:ensureDir', async (event, { projectPath }) => {
    try {
      const claudeDir = path.join(projectPath, '.claude');
      await fs.mkdir(claudeDir, { recursive: true });
      return claudeDir;
    } catch (error) {
      throw new Error(`Failed to create .claude directory: ${error.message}`);
    }
  });

  // Validate settings JSON
  ipcMain.handle('claudeSettings:validate', async (event, { settings }) => {
    try {
      // Basic validation
      const errors = [];

      // Validate cleanupPeriodDays
      if (settings.cleanupPeriodDays !== undefined) {
        if (typeof settings.cleanupPeriodDays !== 'number' || settings.cleanupPeriodDays < 0) {
          errors.push('cleanupPeriodDays must be a positive number');
        }
      }

      // Validate model
      if (settings.model !== undefined) {
        if (typeof settings.model !== 'string' || settings.model.trim() === '') {
          errors.push('model must be a non-empty string');
        }
      }

      // Validate forceLoginMethod
      if (settings.forceLoginMethod !== undefined) {
        if (!['claudeai', 'console'].includes(settings.forceLoginMethod)) {
          errors.push('forceLoginMethod must be "claudeai" or "console"');
        }
      }

      // Validate permissions
      if (settings.permissions) {
        if (settings.permissions.defaultMode !== undefined) {
          if (!['allow', 'ask', 'deny'].includes(settings.permissions.defaultMode)) {
            errors.push('permissions.defaultMode must be "allow", "ask", or "deny"');
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
      };
    }
  });
}

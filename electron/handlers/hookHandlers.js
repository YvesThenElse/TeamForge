import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerHookHandlers(ipcMain) {
  // Load hook templates from embedded library
  ipcMain.handle('hook:loadTemplates', async () => {
    try {
      const libraryPath = path.join(__dirname, '..', '..', 'hooks_template', 'library.json');
      const content = await fs.readFile(libraryPath, 'utf-8');
      const library = JSON.parse(content);
      return library.hooks;
    } catch (error) {
      console.error('Failed to load hook templates:', error);
      return [];
    }
  });

  // List deployed hooks in project
  ipcMain.handle('hook:list', async (event, { projectPath }) => {
    try {
      const hooksSettingsPath = path.join(projectPath, '.claude', 'settings.json');

      // Check if settings file exists
      try {
        await fs.access(hooksSettingsPath);
      } catch {
        // File doesn't exist, return empty list
        return [];
      }

      const content = await fs.readFile(hooksSettingsPath, 'utf-8');
      const settings = JSON.parse(content);

      // Extract hooks from settings
      const deployedHooks = [];
      if (settings.hooks) {
        for (const [event, matchers] of Object.entries(settings.hooks)) {
          for (const matcher of matchers) {
            for (const hook of matcher.hooks) {
              deployedHooks.push({
                event,
                matcher: matcher.matcher,
                command: hook.command,
                type: hook.type || 'command',
              });
            }
          }
        }
      }

      return deployedHooks;
    } catch (error) {
      console.error('Failed to list hooks:', error);
      throw new Error(`Failed to list hooks: ${error.message}`);
    }
  });

  // Deploy a hook to project
  ipcMain.handle('hook:deploy', async (event, { projectPath, hook }) => {
    try {
      const claudeDir = path.join(projectPath, '.claude');
      const hooksSettingsPath = path.join(claudeDir, 'settings.json');

      // Ensure .claude directory exists
      await fs.mkdir(claudeDir, { recursive: true });

      // Load existing settings or create new
      let settings = { hooks: {} };
      try {
        const content = await fs.readFile(hooksSettingsPath, 'utf-8');
        settings = JSON.parse(content);
        if (!settings.hooks) {
          settings.hooks = {};
        }
      } catch {
        // File doesn't exist, use default
      }

      // Add hook to settings
      const event = hook.event;
      if (!settings.hooks[event]) {
        settings.hooks[event] = [];
      }

      // Find existing matcher or create new
      let matcherEntry = settings.hooks[event].find(m => m.matcher === hook.matcher);
      if (!matcherEntry) {
        matcherEntry = {
          matcher: hook.matcher,
          hooks: []
        };
        settings.hooks[event].push(matcherEntry);
      }

      // Add hook if not already present
      const hookExists = matcherEntry.hooks.some(h => h.command === hook.command);
      if (!hookExists) {
        matcherEntry.hooks.push({
          type: 'command',
          command: hook.command
        });
      }

      // Save settings
      await fs.writeFile(hooksSettingsPath, JSON.stringify(settings, null, 2), 'utf-8');

      return `Hook "${hook.name}" deployed successfully`;
    } catch (error) {
      console.error('Failed to deploy hook:', error);
      throw new Error(`Failed to deploy hook: ${error.message}`);
    }
  });

  // Remove a hook from project
  ipcMain.handle('hook:remove', async (event, { projectPath, hookEvent, matcher, command }) => {
    try {
      const hooksSettingsPath = path.join(projectPath, '.claude', 'settings.json');

      const content = await fs.readFile(hooksSettingsPath, 'utf-8');
      const settings = JSON.parse(content);

      if (!settings.hooks || !settings.hooks[hookEvent]) {
        throw new Error('Hook not found');
      }

      // Find and remove the hook
      const matcherEntry = settings.hooks[hookEvent].find(m => m.matcher === matcher);
      if (matcherEntry) {
        matcherEntry.hooks = matcherEntry.hooks.filter(h => h.command !== command);

        // Remove matcher if no hooks left
        if (matcherEntry.hooks.length === 0) {
          settings.hooks[hookEvent] = settings.hooks[hookEvent].filter(m => m.matcher !== matcher);
        }

        // Remove event if no matchers left
        if (settings.hooks[hookEvent].length === 0) {
          delete settings.hooks[hookEvent];
        }
      }

      // Save settings
      await fs.writeFile(hooksSettingsPath, JSON.stringify(settings, null, 2), 'utf-8');

      return 'Hook removed successfully';
    } catch (error) {
      console.error('Failed to remove hook:', error);
      throw new Error(`Failed to remove hook: ${error.message}`);
    }
  });

  // Check if .claude directory exists
  ipcMain.handle('hook:dirExists', async (event, { projectPath }) => {
    try {
      const claudeDir = path.join(projectPath, '.claude');
      await fs.access(claudeDir);
      return true;
    } catch {
      return false;
    }
  });

  // Ensure .claude directory exists
  ipcMain.handle('hook:ensureDir', async (event, { projectPath }) => {
    try {
      const claudeDir = path.join(projectPath, '.claude');
      await fs.mkdir(claudeDir, { recursive: true });
      return claudeDir;
    } catch (error) {
      throw new Error(`Failed to create .claude directory: ${error.message}`);
    }
  });
}

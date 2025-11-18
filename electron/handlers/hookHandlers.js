import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerHookHandlers(ipcMain) {
  // Load hook templates from embedded library
  ipcMain.handle('hook:loadTemplates', async (event, { devMode = false } = {}) => {
    try {
      const dirName = devMode ? 'hooks_dev' : 'hooks_template';
      const libraryPath = path.join(__dirname, '..', '..', dirName, 'library.json');

      console.log(`[hook:loadTemplates] Loading from ${devMode ? '(dev mode)' : ''}:`, libraryPath);

      const content = await fs.readFile(libraryPath, 'utf-8');
      const library = JSON.parse(content);
      return library.hooks;
    } catch (error) {
      console.error('Failed to load hook templates:', error);
      return [];
    }
  });

  // List deployed hooks in project
  ipcMain.handle('hook:list', async (event, { projectPath, settingsFileName = 'settings.json' }) => {
    try {
      const hooksSettingsPath = path.join(projectPath, '.claude', settingsFileName);

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
  ipcMain.handle('hook:deploy', async (event, { projectPath, hook, settingsFileName = 'settings.json' }) => {
    try {
      const claudeDir = path.join(projectPath, '.claude');
      const hooksSettingsPath = path.join(claudeDir, settingsFileName);

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
  ipcMain.handle('hook:remove', async (event, { projectPath, hookEvent, matcher, command, settingsFileName = 'settings.json' }) => {
    try {
      const hooksSettingsPath = path.join(projectPath, '.claude', settingsFileName);

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

  // ========== DEVELOPER MODE CRUD OPERATIONS ==========

  // Create new hook template in hooks_dev/library.json
  ipcMain.handle('hook:createTemplate', async (event, { hook }) => {
    try {
      const libraryPath = path.join(__dirname, '..', '..', 'hooks_dev', 'library.json');

      // Load existing library or create new
      let library = { hooks: [] };
      try {
        const content = await fs.readFile(libraryPath, 'utf-8');
        library = JSON.parse(content);
      } catch {
        // File doesn't exist, use default
        console.log('[hook:createTemplate] Creating new library.json');
      }

      // Generate hook ID
      const hookId = hook.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Check if hook with same ID exists
      const exists = library.hooks.some(h => h.id === hookId);
      if (exists) {
        throw new Error(`Hook already exists: ${hookId}`);
      }

      // Add new hook
      const newHook = {
        id: hookId,
        name: hook.name,
        description: hook.description || '',
        event: hook.event,
        matcher: hook.matcher || '*',
        command: hook.command,
        type: hook.type || 'command',
        category: hook.category || 'Custom',
        tags: hook.tags || [],
      };

      library.hooks.push(newHook);

      // Ensure directory exists
      const devDir = path.join(__dirname, '..', '..', 'hooks_dev');
      await fs.mkdir(devDir, { recursive: true });

      // Save library
      await fs.writeFile(libraryPath, JSON.stringify(library, null, 2), 'utf-8');

      console.log(`[HookHandlers] Created template: ${hookId}`);

      return {
        success: true,
        hookId,
        message: `Hook template created: ${hook.name}`,
      };
    } catch (err) {
      console.error('[hook:createTemplate] Failed:', err);
      throw err;
    }
  });

  // Update existing hook template in hooks_dev/library.json
  ipcMain.handle('hook:updateTemplate', async (event, { hookId, hook }) => {
    try {
      const libraryPath = path.join(__dirname, '..', '..', 'hooks_dev', 'library.json');

      // Load existing library
      const content = await fs.readFile(libraryPath, 'utf-8');
      const library = JSON.parse(content);

      // Find hook by ID
      const hookIndex = library.hooks.findIndex(h => h.id === hookId);
      if (hookIndex === -1) {
        throw new Error(`Hook template not found: ${hookId}`);
      }

      // Update hook
      library.hooks[hookIndex] = {
        id: hookId,
        name: hook.name,
        description: hook.description || '',
        event: hook.event,
        matcher: hook.matcher || '*',
        command: hook.command,
        type: hook.type || 'command',
        category: hook.category || 'Custom',
        tags: hook.tags || [],
      };

      // Save library
      await fs.writeFile(libraryPath, JSON.stringify(library, null, 2), 'utf-8');

      console.log(`[HookHandlers] Updated template: ${hookId}`);

      return {
        success: true,
        message: `Hook template updated: ${hook.name}`,
      };
    } catch (err) {
      console.error('[hook:updateTemplate] Failed:', err);
      throw err;
    }
  });

  // Delete hook template from hooks_dev/library.json
  ipcMain.handle('hook:deleteTemplate', async (event, { hookId }) => {
    try {
      const libraryPath = path.join(__dirname, '..', '..', 'hooks_dev', 'library.json');

      // Load existing library
      const content = await fs.readFile(libraryPath, 'utf-8');
      const library = JSON.parse(content);

      // Find and remove hook
      const hookIndex = library.hooks.findIndex(h => h.id === hookId);
      if (hookIndex === -1) {
        throw new Error(`Hook template not found: ${hookId}`);
      }

      library.hooks.splice(hookIndex, 1);

      // Save library
      await fs.writeFile(libraryPath, JSON.stringify(library, null, 2), 'utf-8');

      console.log(`[HookHandlers] Deleted template: ${hookId}`);

      return {
        success: true,
        message: `Hook template deleted: ${hookId}`,
      };
    } catch (err) {
      console.error('[hook:deleteTemplate] Failed:', err);
      throw err;
    }
  });
}

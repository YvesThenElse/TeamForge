import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse MCP server mcp.json file
 * @param {string} content - Raw file content
 * @returns {Object} Parsed MCP server data
 */
function parseMcpFile(content) {
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse mcp.json:', err);
    return null;
  }
}

/**
 * Format MCP server data to mcp.json file
 * @param {Object} mcpData - MCP server configuration
 * @returns {string} Formatted JSON content
 */
function formatMcpFile(mcpData) {
  return JSON.stringify(mcpData, null, 2);
}

/**
 * Register all MCP handlers
 * @param {import('electron').IpcMain} ipcMain
 */
export function registerMcpHandlers(ipcMain) {
  // List all MCP servers deployed in project .mcp.json file
  ipcMain.handle('mcp:list', async (event, { projectPath }) => {
    try {
      const mcpFilePath = path.join(projectPath, '.mcp.json');

      // Check if file exists
      try {
        await fs.access(mcpFilePath);
      } catch {
        return []; // File doesn't exist, return empty array
      }

      const content = await fs.readFile(mcpFilePath, 'utf-8');
      const mcpConfig = parseMcpFile(content);

      if (!mcpConfig || !mcpConfig.mcpServers) {
        return [];
      }

      // Convert to array format
      const servers = Object.entries(mcpConfig.mcpServers).map(([id, config]) => ({
        id,
        name: config.name || id,
        description: config.description || '',
        category: config.category || 'tools',
        tags: config.tags || [],
        type: config.type || 'stdio',
        command: config.command,
        args: config.args || [],
        url: config.url,
        headers: config.headers || {},
        env: config.env || {},
        mcpPath: mcpFilePath,
      }));

      return servers;
    } catch (err) {
      console.error('Failed to list MCP servers:', err);
      throw err;
    }
  });

  // Load template MCP servers from configured path
  ipcMain.handle('mcp:loadTemplates', async (event, { devMode = false, cachePath = null, devPath = null, projectPath = null, sourcePath = null } = {}) => {
    try {
      let templatesDir;

      if (devMode) {
        // In dev mode, require devPath to be configured
        if (!devPath) {
          throw new Error('Developer mode is enabled but no Dev Path is configured. Please set a Dev Path in Settings > MCP.');
        }
        // Resolve relative paths from project path
        if (!path.isAbsolute(devPath)) {
          if (projectPath) {
            templatesDir = path.join(projectPath, devPath);
          } else {
            throw new Error('Developer mode with relative path requires a project to be selected.');
          }
        } else {
          templatesDir = devPath;
        }
        console.log('[mcp:loadTemplates] Developer mode: Loading from:', templatesDir);
      } else {
        // Normal mode: use cachePath
        if (!cachePath) {
          console.log('[mcp:loadTemplates] No cache path configured');
          return [];
        }
        // Resolve relative paths from project path
        let repoPath = cachePath;
        if (!path.isAbsolute(repoPath)) {
          if (projectPath) {
            repoPath = path.join(projectPath, repoPath);
          } else {
            console.log('[mcp:loadTemplates] Relative path requires a project');
            return [];
          }
        }
        // Note: sourcePath is only used during sync - cache already has extracted files
        templatesDir = repoPath;
        console.log('[mcp:loadTemplates] Loading from cache:', templatesDir);
      }

      // Check if directory exists
      try {
        await fs.access(templatesDir);
      } catch {
        console.log('[mcp:loadTemplates] Directory not found:', templatesDir);
        if (devMode) {
          throw new Error(`Dev directory not found: ${templatesDir}`);
        }
        return [];
      }

      const entries = await fs.readdir(templatesDir, { withFileTypes: true });
      const mcpDirs = entries.filter((entry) => entry.isDirectory());

      console.log('[mcp:loadTemplates] Found MCP directories:', mcpDirs.map(d => d.name));

      const templates = await Promise.all(
        mcpDirs.map(async (dir) => {
          const mcpPath = path.join(templatesDir, dir.name);
          const mcpFilePath = path.join(mcpPath, 'mcp.json');

          try {
            const content = await fs.readFile(mcpFilePath, 'utf-8');
            const mcpData = parseMcpFile(content);

            if (!mcpData) {
              return null;
            }

            return {
              id: dir.name,
              name: mcpData.name || dir.name,
              description: mcpData.description || '',
              category: mcpData.category || 'tools',
              tags: mcpData.tags || [],
              type: mcpData.type || 'stdio',
              command: mcpData.command,
              args: mcpData.args || [],
              url: mcpData.url,
              headers: mcpData.headers || {},
              env: mcpData.env || {},
              mcpPath,
            };
          } catch (err) {
            console.error(`[mcp:loadTemplates] Failed to read MCP ${dir.name}:`, err);
            return null;
          }
        })
      );

      const validTemplates = templates.filter(t => t !== null);
      console.log('[mcp:loadTemplates] Loaded templates:', validTemplates.length);
      return validTemplates;
    } catch (err) {
      console.error('[mcp:loadTemplates] Failed to load templates:', err);
      throw err;
    }
  });

  // ========== DEVELOPER MODE CRUD OPERATIONS ==========

  // Create new MCP template
  ipcMain.handle('mcp:createTemplate', async (event, { mcp, devPath, projectPath }) => {
    try {
      // Resolve dev directory path
      let devDir = devPath;
      if (!path.isAbsolute(devDir)) {
        if (projectPath) {
          devDir = path.join(projectPath, devDir);
        } else {
          throw new Error('Cannot create template: no project selected');
        }
      }

      // Generate MCP ID from name (sanitize)
      const mcpId = mcp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const mcpPath = path.join(devDir, mcpId);
      const mcpFilePath = path.join(mcpPath, 'mcp.json');

      // Check if MCP already exists
      try {
        await fs.access(mcpPath);
        throw new Error(`MCP server already exists: ${mcpId}`);
      } catch (err) {
        // Doesn't exist, continue
        if (err.message.includes('already exists')) throw err;
      }

      // Build MCP config
      const mcpConfig = {
        name: mcp.name,
        description: mcp.description || '',
        category: mcp.category || 'tools',
        tags: mcp.tags || [],
        type: mcp.type || 'stdio',
      };

      // Add type-specific fields
      if (mcp.type === 'stdio' || !mcp.type) {
        mcpConfig.command = mcp.command || '';
        mcpConfig.args = mcp.args || [];
      } else {
        mcpConfig.url = mcp.url || '';
        mcpConfig.headers = mcp.headers || {};
      }

      // Add env if present
      if (mcp.env && Object.keys(mcp.env).length > 0) {
        mcpConfig.env = mcp.env;
      }

      // Create MCP directory and file
      await fs.mkdir(mcpPath, { recursive: true });
      const content = formatMcpFile(mcpConfig);
      await fs.writeFile(mcpFilePath, content, 'utf-8');

      console.log(`[McpHandlers] Created template: ${mcpFilePath}`);

      return {
        success: true,
        path: mcpFilePath,
        mcpId,
        message: `MCP template created: ${mcpId}`,
      };
    } catch (err) {
      console.error('[mcp:createTemplate] Failed:', err);
      throw err;
    }
  });

  // Update existing MCP template
  ipcMain.handle('mcp:updateTemplate', async (event, { mcpId, mcp, devPath, projectPath }) => {
    try {
      // Resolve dev directory path
      let devDir = devPath;
      if (!path.isAbsolute(devDir)) {
        if (projectPath) {
          devDir = path.join(projectPath, devDir);
        } else {
          throw new Error('Cannot update template: no project selected');
        }
      }

      const mcpPath = path.join(devDir, mcpId);
      const mcpFilePath = path.join(mcpPath, 'mcp.json');

      // Check if MCP exists
      try {
        await fs.access(mcpPath);
      } catch {
        throw new Error(`MCP template not found: ${mcpId}`);
      }

      // Build updated MCP config
      const mcpConfig = {
        name: mcp.name,
        description: mcp.description || '',
        category: mcp.category || 'tools',
        tags: mcp.tags || [],
        type: mcp.type || 'stdio',
      };

      // Add type-specific fields
      if (mcp.type === 'stdio' || !mcp.type) {
        mcpConfig.command = mcp.command || '';
        mcpConfig.args = mcp.args || [];
      } else {
        mcpConfig.url = mcp.url || '';
        mcpConfig.headers = mcp.headers || {};
      }

      // Add env if present
      if (mcp.env && Object.keys(mcp.env).length > 0) {
        mcpConfig.env = mcp.env;
      }

      // Update file
      const content = formatMcpFile(mcpConfig);
      await fs.writeFile(mcpFilePath, content, 'utf-8');

      console.log(`[McpHandlers] Updated template: ${mcpFilePath}`);

      return {
        success: true,
        path: mcpFilePath,
        message: `MCP template updated: ${mcp.name}`,
      };
    } catch (err) {
      console.error('[mcp:updateTemplate] Failed:', err);
      throw err;
    }
  });

  // Delete MCP template
  ipcMain.handle('mcp:deleteTemplate', async (event, { mcpId, devPath, projectPath }) => {
    try {
      // Resolve dev directory path
      let devDir = devPath;
      if (!path.isAbsolute(devDir)) {
        if (projectPath) {
          devDir = path.join(projectPath, devDir);
        } else {
          throw new Error('Cannot delete template: no project selected');
        }
      }

      const mcpPath = path.join(devDir, mcpId);

      // Check if MCP exists
      try {
        await fs.access(mcpPath);
      } catch {
        throw new Error(`MCP template not found: ${mcpId}`);
      }

      // Delete MCP directory
      await fs.rm(mcpPath, { recursive: true, force: true });

      console.log(`[McpHandlers] Deleted template: ${mcpPath}`);

      return {
        success: true,
        message: `MCP template deleted: ${mcpId}`,
      };
    } catch (err) {
      console.error('[mcp:deleteTemplate] Failed:', err);
      throw err;
    }
  });

  // Open MCP template file in default editor
  ipcMain.handle('mcp:openTemplateFile', async (event, { mcpId, devPath, projectPath }) => {
    const { shell } = require('electron');

    try {
      // Resolve dev directory path
      let devDir = devPath;
      if (!devDir) {
        throw new Error('Dev path is not configured');
      }
      if (!path.isAbsolute(devDir)) {
        if (projectPath) {
          devDir = path.join(projectPath, devDir);
        } else {
          throw new Error('Cannot open template: no project selected');
        }
      }

      const mcpPath = path.join(devDir, mcpId);
      const filePath = path.join(mcpPath, 'mcp.json');

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        throw new Error(`MCP template file not found: ${filePath}`);
      }

      // Open file in default editor
      const result = await shell.openPath(filePath);
      if (result) {
        throw new Error(`Failed to open file: ${result}`);
      }

      console.log(`[McpHandlers] Opened template: ${filePath}`);

      return {
        success: true,
        path: filePath,
      };
    } catch (err) {
      console.error('[mcp:openTemplateFile] Failed:', err);
      throw err;
    }
  });
}

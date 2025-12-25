import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { deploymentService } from './deployment/index.js';

/**
 * Detect deployed configuration for a specific AI system
 */
async function detectSystemConfig(system, projectPath) {
  const exists = async (filePath) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  };

  const getFileStats = async (filePath) => {
    try {
      const stats = await fs.stat(filePath);
      return { exists: true, modifiedAt: stats.mtime.toISOString() };
    } catch {
      return { exists: false };
    }
  };

  const countFiles = async (dirPath, extension = '.md') => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries.filter(e => e.isFile() && e.name.endsWith(extension)).length;
    } catch {
      return 0;
    }
  };

  switch (system) {
    case 'claude-code': {
      const claudeDir = path.join(projectPath, '.claude');
      const claudeMd = path.join(projectPath, 'CLAUDE.md');
      const claudeLocalMd = path.join(projectPath, 'CLAUDE.local.md');
      const agentsDir = path.join(claudeDir, 'agents');
      const skillsDir = path.join(claudeDir, 'skills');
      const settingsFile = path.join(claudeDir, 'settings.json');
      const mcpFile = path.join(claudeDir, '.mcp.json');

      const [dirExists, mdStats, localMdStats, agentCount, skillCount, hasSettings, hasMcp] = await Promise.all([
        exists(claudeDir),
        getFileStats(claudeMd),
        getFileStats(claudeLocalMd),
        countFiles(agentsDir),
        countFiles(skillsDir),
        exists(settingsFile),
        exists(mcpFile),
      ]);

      return {
        system: 'claude-code',
        deployed: dirExists || mdStats.exists,
        project: {
          directory: { exists: dirExists, path: '.claude/' },
          constitution: { ...mdStats, path: 'CLAUDE.md' },
          constitutionLocal: { ...localMdStats, path: 'CLAUDE.local.md' },
          agents: { count: agentCount, path: '.claude/agents/' },
          skills: { count: skillCount, path: '.claude/skills/' },
          settings: { exists: hasSettings, path: '.claude/settings.json' },
          mcp: { exists: hasMcp, path: '.claude/.mcp.json' },
        },
        global: null, // Claude Code doesn't use global config for project deployment
      };
    }

    case 'gemini-cli': {
      const geminiMd = path.join(projectPath, 'GEMINI.md');
      const homeDir = os.homedir();
      const globalDir = path.join(homeDir, '.gemini');
      const globalMd = path.join(globalDir, 'GEMINI.md');
      const globalSettings = path.join(globalDir, 'settings.json');

      const [projectMdStats, globalDirExists, globalMdStats, globalSettingsExists] = await Promise.all([
        getFileStats(geminiMd),
        exists(globalDir),
        getFileStats(globalMd),
        exists(globalSettings),
      ]);

      return {
        system: 'gemini-cli',
        deployed: projectMdStats.exists || globalDirExists,
        project: {
          constitution: { ...projectMdStats, path: 'GEMINI.md' },
        },
        global: {
          directory: { exists: globalDirExists, path: '~/.gemini/' },
          constitution: { ...globalMdStats, path: '~/.gemini/GEMINI.md' },
          settings: { exists: globalSettingsExists, path: '~/.gemini/settings.json' },
        },
      };
    }

    case 'cline': {
      const clinerules = path.join(projectPath, '.clinerules');
      const memoryBank = path.join(projectPath, 'memory-bank');
      const vscodeMcp = path.join(projectPath, '.vscode', 'mcp.json');

      const [rulesStats, memoryBankExists, mcpExists] = await Promise.all([
        getFileStats(clinerules),
        exists(memoryBank),
        exists(vscodeMcp),
      ]);

      // Check if .clinerules is a file or directory
      let isRulesFolder = false;
      let rulesFileCount = 0;
      if (rulesStats.exists) {
        try {
          const stats = await fs.stat(clinerules);
          isRulesFolder = stats.isDirectory();
          if (isRulesFolder) {
            rulesFileCount = await countFiles(clinerules);
          }
        } catch {}
      }

      // Count memory bank files
      let memoryBankFiles = 0;
      if (memoryBankExists) {
        memoryBankFiles = await countFiles(memoryBank);
      }

      return {
        system: 'cline',
        deployed: rulesStats.exists || memoryBankExists || mcpExists,
        project: {
          rules: {
            ...rulesStats,
            path: '.clinerules',
            isFolder: isRulesFolder,
            fileCount: rulesFileCount,
          },
          memoryBank: {
            exists: memoryBankExists,
            path: 'memory-bank/',
            fileCount: memoryBankFiles,
          },
          mcp: { exists: mcpExists, path: '.vscode/mcp.json' },
        },
        global: null, // Cline uses project-level config
      };
    }

    default:
      return { system, deployed: false, project: null, global: null };
  }
}

/**
 * Register IPC handlers for deployment operations
 */
export function registerDeploymentHandlers(ipcMain) {
  /**
   * Get available deployment systems
   */
  ipcMain.handle('deployment:getSystems', async () => {
    return deploymentService.getAvailableSystems();
  });

  /**
   * Get capabilities for a specific system
   */
  ipcMain.handle('deployment:getCapabilities', async (event, { system, projectPath }) => {
    return deploymentService.getSystemCapabilities(system, projectPath);
  });

  /**
   * Get all systems with their capabilities
   */
  ipcMain.handle('deployment:getAllCapabilities', async (event, { projectPath }) => {
    return deploymentService.getAllSystemCapabilities(projectPath);
  });

  /**
   * Validate deployment before executing
   */
  ipcMain.handle('deployment:validate', async (event, { team, targetSystems, projectPath }) => {
    return deploymentService.validateDeployment(team, targetSystems, projectPath);
  });

  /**
   * Deploy to a single system
   */
  ipcMain.handle('deployment:deploy', async (event, { team, targetSystem, projectPath, options }) => {
    console.log(`[deploymentHandlers] Deploying to ${targetSystem}...`);
    return deploymentService.deploy(team, targetSystem, projectPath, options || {});
  });

  /**
   * Deploy to multiple systems
   */
  ipcMain.handle('deployment:deployMultiple', async (event, { team, targetSystems, projectPath, options }) => {
    console.log(`[deploymentHandlers] Deploying to ${targetSystems.length} systems...`);
    return deploymentService.deployToMultiple(team, targetSystems, projectPath, options || {});
  });

  /**
   * Detect deployed configuration for a specific AI system
   */
  ipcMain.handle('deployment:detectConfig', async (event, { system, projectPath }) => {
    console.log(`[deploymentHandlers] Detecting config for ${system}...`);
    return detectSystemConfig(system, projectPath);
  });

  /**
   * Detect deployed configurations for all AI systems
   */
  ipcMain.handle('deployment:detectAllConfigs', async (event, { projectPath }) => {
    console.log(`[deploymentHandlers] Detecting all configs...`);
    const systems = ['claude-code', 'gemini-cli', 'cline'];
    const results = await Promise.all(
      systems.map(system => detectSystemConfig(system, projectPath))
    );
    return results.reduce((acc, config) => {
      acc[config.system] = config;
      return acc;
    }, {});
  });
}

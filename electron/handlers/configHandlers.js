import fs from 'fs/promises';
import path from 'path';

export function registerConfigHandlers(ipcMain) {
  // Load TeamForge config
  ipcMain.handle('config:load', async (event, { projectPath }) => {
    try {
      const configPath = path.join(projectPath, '.teamforge', 'config.json');
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load config: ${error.message}`);
    }
  });

  // Save TeamForge config
  ipcMain.handle('config:save', async (event, { config, projectPath }) => {
    try {
      const teamforgeDir = path.join(projectPath, '.teamforge');

      // Create .teamforge directory if it doesn't exist
      await fs.mkdir(teamforgeDir, { recursive: true });

      const configPath = path.join(teamforgeDir, 'config.json');
      const content = JSON.stringify(config, null, 2);

      await fs.writeFile(configPath, content, 'utf-8');

      return 'Config saved successfully';
    } catch (error) {
      throw new Error(`Failed to save config: ${error.message}`);
    }
  });

  // Create default TeamForge config
  ipcMain.handle(
    'config:createDefault',
    async (event, { projectName, projectType, projectPath, detectedTechnologies }) => {
      const now = new Date().toISOString();

      return {
        version: '1.0.0',
        project: {
          name: projectName,
          project_type: projectType,
          path: projectPath,
          detected_technologies: detectedTechnologies,
        },
        active_agents: [],
        customizations: {},
        last_analyzed: now,
      };
    }
  );

  // Validate TeamForge config
  ipcMain.handle('config:validate', async (event, { config }) => {
    const warnings = [];

    // Check version
    if (!config.version || config.version.trim() === '') {
      warnings.push('Config version is empty');
    }

    // Check project info
    if (!config.project.name || config.project.name.trim() === '') {
      warnings.push('Project name is empty');
    }

    if (!config.project.path || config.project.path.trim() === '') {
      warnings.push('Project path is empty');
    }

    // Check active agents
    if (!config.active_agents || config.active_agents.length === 0) {
      warnings.push('No active agents configured');
    }

    return warnings;
  });

  // Check if TeamForge config exists
  ipcMain.handle('config:exists', async (event, { projectPath }) => {
    try {
      const configPath = path.join(projectPath, '.teamforge', 'config.json');
      await fs.access(configPath);
      return true;
    } catch {
      return false;
    }
  });

  // Initialize TeamForge structure
  ipcMain.handle('config:initialize', async (event, { projectPath }) => {
    try {
      const teamforgeDir = path.join(projectPath, '.teamforge');
      const presetsDir = path.join(teamforgeDir, 'presets');

      // Create directories
      await fs.mkdir(presetsDir, { recursive: true });

      // Create empty analysis.json
      const analysisPath = path.join(teamforgeDir, 'analysis.json');
      try {
        await fs.access(analysisPath);
      } catch {
        await fs.writeFile(analysisPath, '{}', 'utf-8');
      }

      return 'TeamForge initialized successfully';
    } catch (error) {
      throw new Error(`Failed to initialize TeamForge: ${error.message}`);
    }
  });

  // Ensure .claude/agents/ directory
  ipcMain.handle('config:ensureAgentsDir', async (event, { projectPath }) => {
    try {
      const claudeAgentsDir = path.join(projectPath, '.claude', 'agents');
      await fs.mkdir(claudeAgentsDir, { recursive: true });
      return '.claude/agents/ directory created';
    } catch (error) {
      throw new Error(`Failed to create .claude/agents/ directory: ${error.message}`);
    }
  });
}

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { randomBytes } from 'crypto';

/**
 * ============================================================================
 * TEAM FILE MANAGEMENT ARCHITECTURE
 * ============================================================================
 *
 * This module manages Claude Code team configurations. Each team is a complete
 * snapshot of a Claude Code workspace configuration stored in an isolated directory.
 *
 * DIRECTORY STRUCTURE:
 *
 * .teamforge/
 * └── teams/
 *     ├── team-1763403576184-1qipl6/     (random unique ID)
 *     │   ├── team.json                   (team metadata)
 *     │   ├── settings.json               (Claude Code shared settings)
 *     │   ├── settings.local.json         (Claude Code local settings)
 *     │   ├── agents/                     (agent definitions)
 *     │   │   └── [agent-name].md
 *     │   ├── skills/                     (skill definitions)
 *     │   │   └── [skill-name]/
 *     │   │       └── SKILL.md
 *     │   └── .mcp.json                   (MCP servers - future)
 *     └── team-1763403576185-abc123/      (another team)
 *         └── ...
 *
 * TEAM LIFECYCLE:
 *
 * 1. CREATE: New team → Create directory with unique ID → Initialize .claude/ structure
 * 2. EDIT: Modify team → Update files in team directory
 * 3. DEPLOY: Deploy team → Copy team directory contents to project's .claude/
 * 4. DELETE: Delete team → Remove team directory completely
 *
 * CLAUDE CODE CONFIGURATION FILES (per team):
 *
 * - settings.json: Shared settings (hooks, permissions, model, etc.)
 *   - Hooks configuration
 *   - Shared permissions
 *   - Model preferences
 *   - Environment variables (non-sensitive)
 *
 * - settings.local.json: Local settings (secrets, personal preferences)
 *   - Sensitive permissions
 *   - Personal environment variables
 *   - API keys (if needed)
 *
 * - agents/: Custom subagents (*.md files with YAML frontmatter)
 * - skills/: Skill definitions (directories with SKILL.md)
 * - .mcp.json: MCP server configurations (future implementation)
 *
 * DEPLOYMENT BEHAVIOR:
 *
 * When a team is deployed:
 * 1. Backup current .claude/ configuration (optional)
 * 2. Clear current .claude/ directory
 * 3. Copy all files from .teamforge/teams/[team-id]/ to .claude/
 * 4. Exclude team.json from deployment (metadata only)
 *
 * ACTIVE TEAM DETECTION:
 *
 * Compare .claude/ contents with team directories to determine which team
 * (if any) is currently deployed. This enables visual indication in UI.
 *
 * ============================================================================
 */

/**
 * Generate a unique team ID with timestamp and random suffix
 * Format: team-[timestamp]-[random]
 * Example: team-1763403576184-1qipl6
 */
function generateTeamId() {
  const timestamp = Date.now();
  const random = randomBytes(3).toString('base64url').substring(0, 6);
  return `team-${timestamp}-${random}`;
}

/**
 * Get the team directory path
 */
function getTeamPath(projectPath, teamId) {
  return path.join(projectPath, '.teamforge', 'teams', teamId);
}

/**
 * Get the team metadata file path
 */
function getTeamMetadataPath(projectPath, teamId) {
  return path.join(getTeamPath(projectPath, teamId), 'team.json');
}

/**
 * Copy directory recursively
 */
async function copyDirectory(src, dest, exclude = []) {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, exclude);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Remove directory recursively
 */
async function removeDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await removeDirectory(fullPath);
      } else {
        await fs.unlink(fullPath);
      }
    }

    await fs.rmdir(dirPath);
  } catch (error) {
    // Directory might not exist
    if (error.code !== 'ENOENT') throw error;
  }
}

/**
 * Check if two directories have identical content
 */
async function directoriesMatch(dir1, dir2, exclude = []) {
  try {
    const files1 = await getDirectoryFiles(dir1, exclude);
    const files2 = await getDirectoryFiles(dir2, exclude);

    // Compare file lists
    if (files1.length !== files2.length) return false;

    const fileSet1 = new Set(files1.map(f => f.relativePath));
    const fileSet2 = new Set(files2.map(f => f.relativePath));

    for (const file of fileSet1) {
      if (!fileSet2.has(file)) return false;
    }

    // Compare file contents
    for (const file of files1) {
      const content1 = await fs.readFile(file.fullPath, 'utf-8');
      const file2Path = path.join(dir2, file.relativePath);

      try {
        const content2 = await fs.readFile(file2Path, 'utf-8');
        if (content1 !== content2) return false;
      } catch {
        return false; // File doesn't exist in dir2
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get all files in a directory recursively
 */
async function getDirectoryFiles(dirPath, exclude = [], basePath = null) {
  const files = [];

  if (basePath === null) basePath = dirPath;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (exclude.includes(entry.name)) continue;

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        const subFiles = await getDirectoryFiles(fullPath, exclude, basePath);
        files.push(...subFiles);
      } else {
        files.push({ fullPath, relativePath });
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }

  return files;
}

export function registerTeamHandlers(ipcMain) {
  /**
   * List all teams in the project
   * Returns array of team objects with metadata
   */
  ipcMain.handle('team:list', async (event, { projectPath }) => {
    try {
      const teamsDir = path.join(projectPath, '.teamforge', 'teams');

      // Create teams directory if it doesn't exist
      await fs.mkdir(teamsDir, { recursive: true });

      // Read all subdirectories in teams directory
      const entries = await fs.readdir(teamsDir, { withFileTypes: true });
      const teamDirs = entries.filter(entry => entry.isDirectory());

      const teams = await Promise.all(
        teamDirs.map(async (dir) => {
          const metadataPath = getTeamMetadataPath(projectPath, dir.name);

          try {
            const content = await fs.readFile(metadataPath, 'utf-8');
            return JSON.parse(content);
          } catch (error) {
            console.error(`Failed to load team ${dir.name}:`, error);
            // Return basic metadata if team.json is missing
            return {
              id: dir.name,
              name: dir.name,
              description: 'Error loading team metadata',
              createdAt: new Date().toISOString(),
            };
          }
        })
      );

      return teams;
    } catch (error) {
      throw new Error(`Failed to list teams: ${error.message}`);
    }
  });

  /**
   * Load a specific team with all its configuration
   */
  ipcMain.handle('team:load', async (event, { projectPath, teamId }) => {
    try {
      const metadataPath = getTeamMetadataPath(projectPath, teamId);
      const content = await fs.readFile(metadataPath, 'utf-8');
      const team = JSON.parse(content);

      // Load additional configuration files
      const teamPath = getTeamPath(projectPath, teamId);

      // Load settings.json if exists
      try {
        const settingsPath = path.join(teamPath, 'settings.json');
        const settingsContent = await fs.readFile(settingsPath, 'utf-8');
        team.settings = JSON.parse(settingsContent);
      } catch {
        team.settings = {};
      }

      // Load settings.local.json if exists
      try {
        const localSettingsPath = path.join(teamPath, 'settings.local.json');
        const localSettingsContent = await fs.readFile(localSettingsPath, 'utf-8');
        team.localSettings = JSON.parse(localSettingsContent);
      } catch {
        team.localSettings = {};
      }

      return team;
    } catch (error) {
      throw new Error(`Failed to load team: ${error.message}`);
    }
  });

  /**
   * Create or update a team
   * Creates the team directory structure if it doesn't exist
   */
  ipcMain.handle('team:save', async (event, { projectPath, team }) => {
    try {
      // Generate ID if creating new team
      if (!team.id) {
        team.id = generateTeamId();
        team.createdAt = new Date().toISOString();
      }

      team.updatedAt = new Date().toISOString();

      const teamPath = getTeamPath(projectPath, team.id);

      // Create team directory structure
      await fs.mkdir(teamPath, { recursive: true });
      await fs.mkdir(path.join(teamPath, 'agents'), { recursive: true });
      await fs.mkdir(path.join(teamPath, 'skills'), { recursive: true });

      // Save team metadata
      const metadataPath = getTeamMetadataPath(projectPath, team.id);
      const metadata = {
        id: team.id,
        name: team.name,
        description: team.description,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        workflow: team.workflow || [],
        chainingEnabled: team.chainingEnabled || false,
      };

      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

      // Save settings.json if provided
      if (team.settings) {
        const settingsPath = path.join(teamPath, 'settings.json');
        await fs.writeFile(settingsPath, JSON.stringify(team.settings, null, 2), 'utf-8');
      }

      // Save settings.local.json if provided
      if (team.localSettings) {
        const localSettingsPath = path.join(teamPath, 'settings.local.json');
        await fs.writeFile(localSettingsPath, JSON.stringify(team.localSettings, null, 2), 'utf-8');
      }

      return {
        success: true,
        teamId: team.id,
        message: 'Team saved successfully',
      };
    } catch (error) {
      throw new Error(`Failed to save team: ${error.message}`);
    }
  });

  /**
   * Delete a team and its entire directory
   */
  ipcMain.handle('team:delete', async (event, { projectPath, teamId }) => {
    try {
      const teamPath = getTeamPath(projectPath, teamId);
      await removeDirectory(teamPath);

      return {
        success: true,
        message: 'Team deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete team: ${error.message}`);
    }
  });

  /**
   * Deploy a team to .claude/ directory
   * This replaces the current Claude Code configuration with the team's configuration
   */
  ipcMain.handle('team:deploy', async (event, { projectPath, teamId }) => {
    try {
      const teamPath = getTeamPath(projectPath, teamId);
      const claudePath = path.join(projectPath, '.claude');

      // Verify team directory exists
      try {
        await fs.access(teamPath);
      } catch {
        throw new Error(`Team directory not found: ${teamId}`);
      }

      // Backup current .claude directory (optional - commented out for now)
      // const backupPath = path.join(projectPath, '.teamforge', 'backup', `claude-${Date.now()}`);
      // await copyDirectory(claudePath, backupPath, []);

      // Clear current .claude directory
      await removeDirectory(claudePath);

      // Recreate .claude directory
      await fs.mkdir(claudePath, { recursive: true });

      // Copy team configuration to .claude (exclude team.json metadata)
      await copyDirectory(teamPath, claudePath, ['team.json']);

      console.log(`[TeamHandlers] Team ${teamId} deployed to .claude/`);

      return {
        success: true,
        message: `Team deployed successfully to .claude/`,
        teamId,
      };
    } catch (error) {
      console.error('[TeamHandlers] Deploy error:', error);
      throw new Error(`Failed to deploy team: ${error.message}`);
    }
  });

  /**
   * Get the currently deployed team by comparing .claude/ with team directories
   * Returns the team ID if a match is found, null otherwise
   */
  ipcMain.handle('team:getDeployed', async (event, { projectPath }) => {
    try {
      const claudePath = path.join(projectPath, '.claude');
      const teamsDir = path.join(projectPath, '.teamforge', 'teams');

      // Check if .claude exists
      try {
        await fs.access(claudePath);
      } catch {
        return null; // No .claude directory
      }

      // Get all teams
      const entries = await fs.readdir(teamsDir, { withFileTypes: true });
      const teamDirs = entries.filter(entry => entry.isDirectory());

      // Compare each team directory with .claude
      for (const dir of teamDirs) {
        const teamPath = getTeamPath(projectPath, dir.name);

        // Check if directories match (excluding team.json)
        const matches = await directoriesMatch(claudePath, teamPath, ['team.json']);

        if (matches) {
          // Load team metadata
          const metadataPath = getTeamMetadataPath(projectPath, dir.name);
          try {
            const content = await fs.readFile(metadataPath, 'utf-8');
            const team = JSON.parse(content);
            return {
              teamId: team.id,
              teamName: team.name,
              deployedAt: null, // Could track deployment time in future
            };
          } catch {
            return {
              teamId: dir.name,
              teamName: dir.name,
              deployedAt: null,
            };
          }
        }
      }

      return null; // No matching team found
    } catch (error) {
      console.error('[TeamHandlers] Error detecting deployed team:', error);
      return null;
    }
  });

  /**
   * Generate agent files from team workflow
   * Creates agent files in the team's agents/ directory
   */
  ipcMain.handle('team:generateAgents', async (event, { projectPath, teamId, agentLibrary }) => {
    try {
      const teamPath = getTeamPath(projectPath, teamId);
      const agentsDir = path.join(teamPath, 'agents');

      // Load team metadata
      const metadataPath = getTeamMetadataPath(projectPath, teamId);
      const content = await fs.readFile(metadataPath, 'utf-8');
      const team = JSON.parse(content);

      // Ensure agents directory exists
      await fs.mkdir(agentsDir, { recursive: true });

      // Generate agent files from workflow
      const generatedFiles = [];

      for (const workflowNode of team.workflow || []) {
        const agent = agentLibrary.find(a => a.id === workflowNode.agentId);

        if (!agent) {
          console.warn(`Agent not found in library: ${workflowNode.agentId}`);
          continue;
        }

        // Generate agent filename
        const fileName = `${agent.id}.md`;
        const filePath = path.join(agentsDir, fileName);

        // Build frontmatter
        const frontmatter = `---
name: ${agent.name}
description: ${agent.description}
tags: [${agent.tags.join(', ')}]
tools: ${JSON.stringify(agent.tools)}
model: ${agent.model}
---

`;

        // Combine frontmatter and template
        let content = agent.template;

        // Add custom instructions if provided
        if (workflowNode.customInstructions) {
          content += '\n\n## Custom Instructions\n\n';
          content += workflowNode.customInstructions;
        }

        const agentFileContent = frontmatter + content;

        // Write agent file
        await fs.writeFile(filePath, agentFileContent, 'utf-8');

        generatedFiles.push(fileName);
      }

      return {
        success: true,
        filesGenerated: generatedFiles.length,
        files: generatedFiles,
      };
    } catch (error) {
      throw new Error(`Failed to generate agent files: ${error.message}`);
    }
  });
}

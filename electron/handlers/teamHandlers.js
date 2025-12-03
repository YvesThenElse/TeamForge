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

      // Save team metadata (supports both v1 workflow and v2 structure)
      const metadataPath = getTeamMetadataPath(projectPath, team.id);
      const metadata = {
        id: team.id,
        name: team.name,
        description: team.description,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        // v2 structure
        agents: team.agents || [],
        skills: team.skills || [],
        hooks: team.hooks || [],
        mcpServers: team.mcpServers || [],
        security: team.security || { configured: false },
        // v1 legacy structure (backward compatibility)
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
   * Generate agent files from team agents array (v2) or workflow (v1 legacy)
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

      // Generate agent files from agents array (v2) or workflow (v1 legacy)
      const generatedFiles = [];
      const agentsList = team.agents || team.workflow || [];

      for (const agentItem of agentsList) {
        const agentId = agentItem.agentId;
        const agent = agentLibrary.find(a => a.id === agentId);

        if (!agent) {
          console.warn(`Agent not found in library: ${agentId}`);
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
        if (agentItem.customInstructions) {
          content += '\n\n## Custom Instructions\n\n';
          content += agentItem.customInstructions;
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

  /**
   * Generate skill directories from team skills array
   * Creates skill directories in the team's skills/ directory
   */
  ipcMain.handle('team:generateSkills', async (event, { projectPath, teamId, skillLibrary }) => {
    try {
      const teamPath = getTeamPath(projectPath, teamId);
      const skillsDir = path.join(teamPath, 'skills');

      // Load team metadata
      const metadataPath = getTeamMetadataPath(projectPath, teamId);
      const content = await fs.readFile(metadataPath, 'utf-8');
      const team = JSON.parse(content);

      // Ensure skills directory exists
      await fs.mkdir(skillsDir, { recursive: true });

      // Generate skill directories from skills array
      const generatedDirs = [];

      for (const skillItem of team.skills || []) {
        const skill = skillLibrary.find(s => s.id === skillItem.skillId);

        if (!skill) {
          console.warn(`Skill not found in library: ${skillItem.skillId}`);
          continue;
        }

        // Create skill directory
        const skillDir = path.join(skillsDir, skill.id);
        await fs.mkdir(skillDir, { recursive: true });

        // Write SKILL.md file
        const skillFilePath = path.join(skillDir, 'SKILL.md');
        await fs.writeFile(skillFilePath, skill.content, 'utf-8');

        generatedDirs.push(skill.id);
      }

      return {
        success: true,
        dirsGenerated: generatedDirs.length,
        dirs: generatedDirs,
      };
    } catch (error) {
      throw new Error(`Failed to generate skill directories: ${error.message}`);
    }
  });

  /**
   * Generate settings.json with hooks and security configuration
   * Creates settings.json in the team directory
   */
  ipcMain.handle('team:generateSettings', async (event, { projectPath, teamId, hookLibrary }) => {
    try {
      const teamPath = getTeamPath(projectPath, teamId);

      // Load team metadata
      const metadataPath = getTeamMetadataPath(projectPath, teamId);
      const content = await fs.readFile(metadataPath, 'utf-8');
      const team = JSON.parse(content);

      // Build settings.json structure
      const settings = {
        version: '1.0.0',
      };

      // Add hooks configuration
      if (team.hooks && team.hooks.length > 0) {
        settings.hooks = {};

        for (const hookItem of team.hooks) {
          const hook = hookLibrary.find(h => h.id === hookItem.hookId);

          if (!hook) {
            console.warn(`Hook not found in library: ${hookItem.hookId}`);
            continue;
          }

          // Add hook to appropriate event
          if (!settings.hooks[hook.event]) {
            settings.hooks[hook.event] = [];
          }

          settings.hooks[hook.event].push({
            name: hook.name,
            command: hook.command,
            description: hook.description,
          });
        }
      }

      // Add global security permissions (allow, deny, ask)
      if (team.security && team.security.configured) {
        if (team.security.permissions) {
          settings.permissions = {};

          if (team.security.permissions.allow && team.security.permissions.allow.length > 0) {
            settings.permissions.allow = team.security.permissions.allow;
          }

          if (team.security.permissions.deny && team.security.permissions.deny.length > 0) {
            settings.permissions.deny = team.security.permissions.deny;
          }

          if (team.security.permissions.ask && team.security.permissions.ask.length > 0) {
            settings.permissions.ask = team.security.permissions.ask;
          }
        }

        // Add non-sensitive environment variables
        if (team.security.env && Object.keys(team.security.env).length > 0) {
          settings.env = team.security.env;
        }
      }

      // Write settings.json
      const settingsPath = path.join(teamPath, 'settings.json');
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');

      // Generate settings.local.json for element-level security
      const localSettings = {};
      let hasLocalSettings = false;

      // Check if any agents have element-level security
      for (const agentItem of team.agents || []) {
        if (agentItem.security && agentItem.security.configured) {
          if (!localSettings.agentPermissions) {
            localSettings.agentPermissions = {};
          }
          localSettings.agentPermissions[agentItem.agentId] = agentItem.security.permissions;
          hasLocalSettings = true;
        }
      }

      // Check if any skills have element-level security
      for (const skillItem of team.skills || []) {
        if (skillItem.security && skillItem.security.configured) {
          if (!localSettings.skillPermissions) {
            localSettings.skillPermissions = {};
          }
          localSettings.skillPermissions[skillItem.skillId] = skillItem.security.permissions;
          hasLocalSettings = true;
        }
      }

      // Check if any hooks have element-level security
      for (const hookItem of team.hooks || []) {
        if (hookItem.security && hookItem.security.configured) {
          if (!localSettings.hookPermissions) {
            localSettings.hookPermissions = {};
          }
          localSettings.hookPermissions[hookItem.hookId] = hookItem.security.permissions;
          hasLocalSettings = true;
        }
      }

      // Write settings.local.json if there are local settings
      if (hasLocalSettings) {
        const localSettingsPath = path.join(teamPath, 'settings.local.json');
        await fs.writeFile(localSettingsPath, JSON.stringify(localSettings, null, 2), 'utf-8');
      }

      return {
        success: true,
        settingsGenerated: true,
        localSettingsGenerated: hasLocalSettings,
      };
    } catch (error) {
      throw new Error(`Failed to generate settings: ${error.message}`);
    }
  });

  /**
   * Generate .mcp.json with MCP server configurations
   * Creates .mcp.json in the team directory
   */
  ipcMain.handle('team:generateMcpConfig', async (event, { projectPath, teamId, mcpLibrary }) => {
    try {
      const teamPath = getTeamPath(projectPath, teamId);

      // Load team metadata
      const metadataPath = getTeamMetadataPath(projectPath, teamId);
      const content = await fs.readFile(metadataPath, 'utf-8');
      const team = JSON.parse(content);

      // Build .mcp.json structure
      const mcpConfig = {
        mcpServers: {},
      };

      // Generate MCP server configurations from mcpServers array
      for (const mcpItem of team.mcpServers || []) {
        const mcp = mcpLibrary.find(m => m.id === mcpItem.mcpId);

        if (!mcp) {
          console.warn(`MCP server not found in library: ${mcpItem.mcpId}`);
          continue;
        }

        // Build MCP server config following Claude Code's official format
        const serverConfig = {
          type: mcp.type,
        };

        // Add type-specific configuration
        if (mcp.type === 'stdio') {
          if (mcp.command) serverConfig.command = mcp.command;
          if (mcp.args && mcp.args.length > 0) serverConfig.args = mcp.args;
        } else {
          // http or sse
          if (mcp.url) serverConfig.url = mcp.url;
          if (mcp.headers && Object.keys(mcp.headers).length > 0) {
            serverConfig.headers = mcp.headers;
          }
        }

        // Add environment variables if present
        if (mcp.env && Object.keys(mcp.env).length > 0) {
          serverConfig.env = mcp.env;
        }

        // Use MCP id as the key in mcpServers
        mcpConfig.mcpServers[mcp.id] = serverConfig;
      }

      // Only write .mcp.json if there are MCP servers configured
      if (Object.keys(mcpConfig.mcpServers).length > 0) {
        const mcpConfigPath = path.join(teamPath, '.mcp.json');
        await fs.writeFile(mcpConfigPath, JSON.stringify(mcpConfig, null, 2), 'utf-8');

        return {
          success: true,
          mcpConfigGenerated: true,
          serversCount: Object.keys(mcpConfig.mcpServers).length,
        };
      }

      return {
        success: true,
        mcpConfigGenerated: false,
        serversCount: 0,
      };
    } catch (error) {
      throw new Error(`Failed to generate MCP config: ${error.message}`);
    }
  });
}

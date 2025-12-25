import fs from 'fs/promises';
import path from 'path';
import { BaseProvider } from './BaseProvider.js';

/**
 * ClaudeCodeProvider - Deployment provider for Claude Code
 *
 * Deploys configuration to:
 * - .claude/agents/       - Agent definitions (*.md with YAML frontmatter)
 * - .claude/commands/     - Custom slash commands
 * - .claude/skills/       - Skill definitions (directories with SKILL.md)
 * - .claude/settings.json - Shared settings (hooks, permissions, etc.)
 * - .claude/.mcp.json     - MCP server configurations
 * - CLAUDE.md             - Project constitution (in project root)
 */
export class ClaudeCodeProvider extends BaseProvider {
  getSystemId() {
    return 'claude-code';
  }

  getOutputPaths() {
    return {
      root: path.join(this.projectPath, '.claude'),
      agents: path.join(this.projectPath, '.claude', 'agents'),
      commands: path.join(this.projectPath, '.claude', 'commands'),
      skills: path.join(this.projectPath, '.claude', 'skills'),
      settings: path.join(this.projectPath, '.claude', 'settings.json'),
      settingsLocal: path.join(this.projectPath, '.claude', 'settings.local.json'),
      mcp: path.join(this.projectPath, '.claude', '.mcp.json'),
      constitution: path.join(this.projectPath, 'CLAUDE.md'),
      constitutionLocal: path.join(this.projectPath, 'CLAUDE.local.md'),
    };
  }

  getCapabilities() {
    return {
      agents: true,
      constitution: true,
      skills: true,
      hooks: true,
      mcpServers: true,
      memory: false,
    };
  }

  async prepareDirectories(paths, options = {}) {
    const { clearExisting = false } = options;

    if (clearExisting) {
      // Remove existing .claude directory
      await this.removeDirectory(paths.root);
    }

    // Create directories
    await fs.mkdir(paths.root, { recursive: true });
    await fs.mkdir(paths.agents, { recursive: true });
    await fs.mkdir(paths.commands, { recursive: true });
    await fs.mkdir(paths.skills, { recursive: true });
  }

  async removeDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.removeDirectory(fullPath);
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

  async deployConstitution(content, options = {}) {
    const paths = this.getOutputPaths();
    const { useLocal = false } = options;

    const targetPath = useLocal ? paths.constitutionLocal : paths.constitution;
    await fs.writeFile(targetPath, content, 'utf-8');

    console.log(`[ClaudeCodeProvider] Constitution deployed to ${targetPath}`);

    return {
      success: true,
      path: targetPath,
    };
  }

  async deployAgents(agents, options = {}) {
    const paths = this.getOutputPaths();
    const deployedFiles = [];

    for (const agent of agents) {
      // Generate agent filename
      const fileName = `${agent.id}.md`;
      const filePath = path.join(paths.agents, fileName);

      // Build frontmatter
      const frontmatterLines = [
        '---',
        `name: ${agent.name}`,
        `description: ${agent.description}`,
      ];

      if (agent.tags && agent.tags.length > 0) {
        frontmatterLines.push(`tags: [${agent.tags.join(', ')}]`);
      }

      if (agent.tools) {
        frontmatterLines.push(`tools: ${JSON.stringify(agent.tools)}`);
      }

      if (agent.model) {
        frontmatterLines.push(`model: ${agent.model}`);
      }

      frontmatterLines.push('---', '');

      // Combine frontmatter and content
      let content = agent.template || '';

      // Add custom instructions if provided
      if (agent.customInstructions) {
        content += '\n\n## Custom Instructions\n\n';
        content += agent.customInstructions;
      }

      const fileContent = frontmatterLines.join('\n') + content;

      // Write agent file
      await fs.writeFile(filePath, fileContent, 'utf-8');
      deployedFiles.push(fileName);
    }

    console.log(`[ClaudeCodeProvider] Deployed ${deployedFiles.length} agents`);

    return {
      success: true,
      filesDeployed: deployedFiles.length,
      files: deployedFiles,
    };
  }

  async deploySkills(skills, options = {}) {
    const paths = this.getOutputPaths();
    const deployedDirs = [];

    for (const skill of skills) {
      // Create skill directory
      const skillDir = path.join(paths.skills, skill.id);
      await fs.mkdir(skillDir, { recursive: true });

      // Write SKILL.md file
      const skillFilePath = path.join(skillDir, 'SKILL.md');

      // Build frontmatter if available
      let fileContent = '';
      if (skill.name || skill.description) {
        const frontmatterLines = ['---'];
        if (skill.name) frontmatterLines.push(`name: ${skill.name}`);
        if (skill.description) frontmatterLines.push(`description: ${skill.description}`);
        frontmatterLines.push('---', '');
        fileContent = frontmatterLines.join('\n');
      }

      fileContent += skill.content || skill.instructions || '';

      await fs.writeFile(skillFilePath, fileContent, 'utf-8');
      deployedDirs.push(skill.id);
    }

    console.log(`[ClaudeCodeProvider] Deployed ${deployedDirs.length} skills`);

    return {
      success: true,
      dirsDeployed: deployedDirs.length,
      dirs: deployedDirs,
    };
  }

  async deployHooks(hooks, options = {}) {
    // Hooks are deployed as part of settings.json
    // This method just returns the hooks for inclusion in settings
    return {
      success: true,
      hooksCount: hooks.length,
      hooks: hooks,
    };
  }

  async deployMcpServers(mcpServers, options = {}) {
    const paths = this.getOutputPaths();

    // Build .mcp.json structure
    const mcpConfig = {
      mcpServers: {},
    };

    for (const mcp of mcpServers) {
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

      mcpConfig.mcpServers[mcp.id] = serverConfig;
    }

    // Write .mcp.json
    await fs.writeFile(paths.mcp, JSON.stringify(mcpConfig, null, 2), 'utf-8');

    console.log(`[ClaudeCodeProvider] Deployed ${mcpServers.length} MCP servers`);

    return {
      success: true,
      serversDeployed: mcpServers.length,
      path: paths.mcp,
    };
  }

  async deploySettings(settings, options = {}) {
    const paths = this.getOutputPaths();
    const { hooks = [], security = {} } = settings;

    // Build settings.json structure
    const settingsConfig = {
      version: '1.0.0',
    };

    // Add hooks configuration
    if (hooks && hooks.length > 0) {
      settingsConfig.hooks = {};

      for (const hook of hooks) {
        if (!settingsConfig.hooks[hook.event]) {
          settingsConfig.hooks[hook.event] = [];
        }

        settingsConfig.hooks[hook.event].push({
          name: hook.name,
          command: hook.command,
          description: hook.description,
          ...(hook.matcher && { matcher: hook.matcher }),
        });
      }
    }

    // Add global security permissions
    if (security && security.configured) {
      if (security.permissions) {
        settingsConfig.permissions = {};

        if (security.permissions.allow?.length > 0) {
          settingsConfig.permissions.allow = security.permissions.allow;
        }
        if (security.permissions.deny?.length > 0) {
          settingsConfig.permissions.deny = security.permissions.deny;
        }
        if (security.permissions.ask?.length > 0) {
          settingsConfig.permissions.ask = security.permissions.ask;
        }
      }

      // Add environment variables
      if (security.env && Object.keys(security.env).length > 0) {
        settingsConfig.env = security.env;
      }
    }

    // Write settings.json
    await fs.writeFile(paths.settings, JSON.stringify(settingsConfig, null, 2), 'utf-8');

    console.log(`[ClaudeCodeProvider] Settings deployed`);

    return {
      success: true,
      path: paths.settings,
    };
  }

  async deploy(team, options = {}) {
    const results = {
      system: this.getSystemId(),
      success: true,
      details: {},
    };

    try {
      const paths = this.getOutputPaths();
      await this.prepareDirectories(paths, options);

      // Deploy constitution
      if (team.constitution) {
        results.details.constitution = await this.deployConstitution(team.constitution, options);
      }

      // Deploy agents
      if (team.agents?.length) {
        results.details.agents = await this.deployAgents(team.agents, options);
      }

      // Deploy skills
      if (team.skills?.length) {
        results.details.skills = await this.deploySkills(team.skills, options);
      }

      // Deploy MCP servers
      if (team.mcpServers?.length) {
        results.details.mcpServers = await this.deployMcpServers(team.mcpServers, options);
      }

      // Deploy settings (includes hooks and security)
      const settingsData = {
        hooks: team.hooks || [],
        security: team.security || {},
      };
      results.details.settings = await this.deploySettings(settingsData, options);

    } catch (error) {
      results.success = false;
      results.error = error.message;
      console.error('[ClaudeCodeProvider] Deployment error:', error);
    }

    return results;
  }
}

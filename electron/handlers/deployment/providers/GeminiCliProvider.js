import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { BaseProvider } from './BaseProvider.js';

/**
 * GeminiCliProvider - Deployment provider for Gemini CLI
 *
 * Deploys configuration to:
 * - GEMINI.md                    - Project constitution (in project root)
 * - ~/.gemini/GEMINI.md          - Global constitution (optional)
 * - ~/.gemini/settings.json      - Global settings and MCP servers
 *
 * Note: Gemini CLI has limited feature support compared to Claude Code:
 * - No sub-agents
 * - No hooks
 * - No skills/commands (uses different approach)
 * - MCP servers via settings.json
 */
export class GeminiCliProvider extends BaseProvider {
  getSystemId() {
    return 'gemini-cli';
  }

  getOutputPaths() {
    const homeDir = os.homedir();
    return {
      root: path.join(homeDir, '.gemini'),
      constitution: path.join(this.projectPath, 'GEMINI.md'),
      globalConstitution: path.join(homeDir, '.gemini', 'GEMINI.md'),
      settings: path.join(homeDir, '.gemini', 'settings.json'),
    };
  }

  getCapabilities() {
    return {
      agents: false,
      constitution: true,
      skills: false,
      hooks: false,
      mcpServers: true,
      memory: true,
    };
  }

  async prepareDirectories(paths, options = {}) {
    // Create .gemini directory in home
    await fs.mkdir(paths.root, { recursive: true });
  }

  async deployConstitution(content, options = {}) {
    const paths = this.getOutputPaths();
    const { deployGlobal = false } = options;

    // Deploy to project root
    await fs.writeFile(paths.constitution, content, 'utf-8');
    console.log(`[GeminiCliProvider] Constitution deployed to ${paths.constitution}`);

    // Optionally deploy to global location
    if (deployGlobal) {
      await fs.writeFile(paths.globalConstitution, content, 'utf-8');
      console.log(`[GeminiCliProvider] Global constitution deployed to ${paths.globalConstitution}`);
    }

    return {
      success: true,
      path: paths.constitution,
      globalPath: deployGlobal ? paths.globalConstitution : null,
    };
  }

  async deployMcpServers(mcpServers, options = {}) {
    const paths = this.getOutputPaths();

    // Read existing settings or create new
    let settings = {};
    try {
      const existingContent = await fs.readFile(paths.settings, 'utf-8');
      settings = JSON.parse(existingContent);
    } catch {
      // File doesn't exist, use empty object
    }

    // Build mcpServers configuration
    settings.mcpServers = {};

    for (const mcp of mcpServers) {
      const serverConfig = {};

      // Gemini CLI uses similar format to Claude Code for MCP
      if (mcp.type === 'stdio') {
        if (mcp.command) serverConfig.command = mcp.command;
        if (mcp.args && mcp.args.length > 0) serverConfig.args = mcp.args;
      } else {
        if (mcp.url) serverConfig.url = mcp.url;
      }

      // Add environment variables if present
      if (mcp.env && Object.keys(mcp.env).length > 0) {
        serverConfig.env = mcp.env;
      }

      settings.mcpServers[mcp.id] = serverConfig;
    }

    // Write settings.json
    await fs.writeFile(paths.settings, JSON.stringify(settings, null, 2), 'utf-8');

    console.log(`[GeminiCliProvider] Deployed ${mcpServers.length} MCP servers`);

    return {
      success: true,
      serversDeployed: mcpServers.length,
      path: paths.settings,
    };
  }

  async deploySettings(settings, options = {}) {
    const paths = this.getOutputPaths();

    // Read existing settings or create new
    let existingSettings = {};
    try {
      const existingContent = await fs.readFile(paths.settings, 'utf-8');
      existingSettings = JSON.parse(existingContent);
    } catch {
      // File doesn't exist, use empty object
    }

    // Merge new settings (preserve mcpServers if already set)
    const finalSettings = {
      ...existingSettings,
      ...settings,
    };

    // Write settings.json
    await fs.writeFile(paths.settings, JSON.stringify(finalSettings, null, 2), 'utf-8');

    console.log(`[GeminiCliProvider] Settings deployed`);

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
      warnings: [],
    };

    try {
      const paths = this.getOutputPaths();
      await this.prepareDirectories(paths, options);

      // Deploy constitution
      if (team.constitution) {
        results.details.constitution = await this.deployConstitution(team.constitution, options);
      }

      // Deploy MCP servers
      if (team.mcpServers?.length) {
        results.details.mcpServers = await this.deployMcpServers(team.mcpServers, options);
      }

      // Warn about unsupported features
      if (team.agents?.length) {
        results.warnings.push('Gemini CLI does not support sub-agents. Agents configuration was skipped.');
      }
      if (team.hooks?.length) {
        results.warnings.push('Gemini CLI does not support hooks. Hooks configuration was skipped.');
      }
      if (team.skills?.length) {
        results.warnings.push('Gemini CLI does not support skills. Skills configuration was skipped.');
      }

    } catch (error) {
      results.success = false;
      results.error = error.message;
      console.error('[GeminiCliProvider] Deployment error:', error);
    }

    return results;
  }
}

import fs from 'fs/promises';
import path from 'path';
import { BaseProvider } from './BaseProvider.js';

/**
 * ClineProvider - Deployment provider for Cline (VS Code Extension)
 *
 * Deploys configuration to:
 * - .clinerules                  - Single file rules (alternative to folder)
 * - .clinerules/                 - Rules folder with multiple .md files
 * - memory-bank/                 - Cline Memory Bank structure
 *   ├── projectBrief.md
 *   ├── techContext.md
 *   └── activeContext.md
 * - .vscode/mcp.json             - MCP server configurations
 *
 * Note: Cline has different capabilities:
 * - No sub-agents (uses different approach)
 * - No hooks
 * - Rules instead of constitution
 * - Memory Bank for persistent context
 * - MCP servers via .vscode/mcp.json
 */
export class ClineProvider extends BaseProvider {
  getSystemId() {
    return 'cline';
  }

  getOutputPaths() {
    return {
      rulesFile: path.join(this.projectPath, '.clinerules'),
      rulesFolder: path.join(this.projectPath, '.clinerules'),
      memoryBank: path.join(this.projectPath, 'memory-bank'),
      projectBrief: path.join(this.projectPath, 'memory-bank', 'projectBrief.md'),
      techContext: path.join(this.projectPath, 'memory-bank', 'techContext.md'),
      activeContext: path.join(this.projectPath, 'memory-bank', 'activeContext.md'),
      vscode: path.join(this.projectPath, '.vscode'),
      mcp: path.join(this.projectPath, '.vscode', 'mcp.json'),
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
    const { useRulesFolder = false, deployMemoryBank = false } = options;

    if (useRulesFolder) {
      await fs.mkdir(paths.rulesFolder, { recursive: true });
    }

    if (deployMemoryBank) {
      await fs.mkdir(paths.memoryBank, { recursive: true });
    }

    // Create .vscode directory for MCP config
    await fs.mkdir(paths.vscode, { recursive: true });
  }

  async deployConstitution(content, options = {}) {
    const paths = this.getOutputPaths();
    const { useRulesFolder = false, rulesFileName = 'rules.md' } = options;

    if (useRulesFolder) {
      // Deploy as .clinerules folder with .md file
      await fs.mkdir(paths.rulesFolder, { recursive: true });
      const rulesPath = path.join(paths.rulesFolder, rulesFileName);
      await fs.writeFile(rulesPath, content, 'utf-8');

      console.log(`[ClineProvider] Rules deployed to ${rulesPath}`);

      return {
        success: true,
        path: rulesPath,
        isFolder: true,
      };
    } else {
      // Deploy as single .clinerules file
      await fs.writeFile(paths.rulesFile, content, 'utf-8');

      console.log(`[ClineProvider] Rules deployed to ${paths.rulesFile}`);

      return {
        success: true,
        path: paths.rulesFile,
        isFolder: false,
      };
    }
  }

  async deployMemoryBank(content, options = {}) {
    const paths = this.getOutputPaths();
    const { projectBrief, techContext, activeContext } = content;

    await fs.mkdir(paths.memoryBank, { recursive: true });

    const deployed = [];

    // Deploy projectBrief.md
    if (projectBrief) {
      await fs.writeFile(paths.projectBrief, projectBrief, 'utf-8');
      deployed.push('projectBrief.md');
    }

    // Deploy techContext.md
    if (techContext) {
      await fs.writeFile(paths.techContext, techContext, 'utf-8');
      deployed.push('techContext.md');
    }

    // Deploy activeContext.md
    if (activeContext) {
      await fs.writeFile(paths.activeContext, activeContext, 'utf-8');
      deployed.push('activeContext.md');
    }

    console.log(`[ClineProvider] Memory Bank deployed: ${deployed.join(', ')}`);

    return {
      success: true,
      path: paths.memoryBank,
      files: deployed,
    };
  }

  async deployMcpServers(mcpServers, options = {}) {
    const paths = this.getOutputPaths();

    // Build mcp.json structure for VS Code
    const mcpConfig = {
      mcpServers: {},
    };

    for (const mcp of mcpServers) {
      const serverConfig = {};

      // Cline uses similar format for MCP
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

      mcpConfig.mcpServers[mcp.id] = serverConfig;
    }

    // Write .vscode/mcp.json
    await fs.writeFile(paths.mcp, JSON.stringify(mcpConfig, null, 2), 'utf-8');

    console.log(`[ClineProvider] Deployed ${mcpServers.length} MCP servers to ${paths.mcp}`);

    return {
      success: true,
      serversDeployed: mcpServers.length,
      path: paths.mcp,
    };
  }

  async deploySettings(settings, options = {}) {
    // Cline doesn't have a central settings file like Claude Code
    // Settings are handled through VS Code extension settings
    return {
      success: true,
      skipped: true,
      reason: 'Cline settings are managed through VS Code extension settings',
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

      // Deploy constitution as .clinerules
      if (team.constitution) {
        results.details.constitution = await this.deployConstitution(team.constitution, options);
      }

      // Deploy Memory Bank if specified
      if (options.deployMemoryBank && team.memoryBank) {
        results.details.memoryBank = await this.deployMemoryBank(team.memoryBank, options);
      }

      // Deploy MCP servers
      if (team.mcpServers?.length) {
        results.details.mcpServers = await this.deployMcpServers(team.mcpServers, options);
      }

      // Warn about unsupported features
      if (team.agents?.length) {
        results.warnings.push('Cline does not support sub-agents. Agents configuration was skipped.');
      }
      if (team.hooks?.length) {
        results.warnings.push('Cline does not support hooks. Hooks configuration was skipped.');
      }
      if (team.skills?.length) {
        results.warnings.push('Cline does not support skills. Skills configuration was skipped.');
      }

    } catch (error) {
      results.success = false;
      results.error = error.message;
      console.error('[ClineProvider] Deployment error:', error);
    }

    return results;
  }
}

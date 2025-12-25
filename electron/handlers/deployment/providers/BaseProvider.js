/**
 * Base class for deployment providers
 * Each AI system (Claude Code, Gemini CLI, Cline) extends this class
 */
export class BaseProvider {
  constructor(projectPath) {
    if (new.target === BaseProvider) {
      throw new Error('BaseProvider is an abstract class and cannot be instantiated directly');
    }
    this.projectPath = projectPath;
  }

  /**
   * Get the system identifier
   * @returns {string} The system ID (e.g., 'claude-code', 'gemini-cli', 'cline')
   */
  getSystemId() {
    throw new Error('getSystemId() must be implemented');
  }

  /**
   * Get output paths for this system
   * @returns {Object} Object containing paths for different components
   */
  getOutputPaths() {
    throw new Error('getOutputPaths() must be implemented');
  }

  /**
   * Get capabilities supported by this system
   * @returns {Object} Object with boolean flags for each capability
   */
  getCapabilities() {
    return {
      agents: false,
      constitution: false,
      skills: false,
      hooks: false,
      mcpServers: false,
      memory: false,
    };
  }

  /**
   * Prepare output directories (create if needed, optionally clear)
   * @param {Object} paths - Paths object from getOutputPaths()
   * @param {Object} options - Options for preparation
   */
  async prepareDirectories(paths, options = {}) {
    throw new Error('prepareDirectories() must be implemented');
  }

  /**
   * Deploy constitution content
   * @param {string} content - The constitution content
   * @param {Object} options - Deployment options
   */
  async deployConstitution(content, options = {}) {
    if (!this.getCapabilities().constitution) {
      console.log(`[${this.getSystemId()}] Constitution not supported`);
      return { skipped: true, reason: 'Not supported' };
    }
    throw new Error('deployConstitution() must be implemented');
  }

  /**
   * Deploy agents
   * @param {Array} agents - Array of agent configurations
   * @param {Object} options - Deployment options
   */
  async deployAgents(agents, options = {}) {
    if (!this.getCapabilities().agents) {
      console.log(`[${this.getSystemId()}] Agents not supported`);
      return { skipped: true, reason: 'Not supported' };
    }
    throw new Error('deployAgents() must be implemented');
  }

  /**
   * Deploy skills
   * @param {Array} skills - Array of skill configurations
   * @param {Object} options - Deployment options
   */
  async deploySkills(skills, options = {}) {
    if (!this.getCapabilities().skills) {
      console.log(`[${this.getSystemId()}] Skills not supported`);
      return { skipped: true, reason: 'Not supported' };
    }
    throw new Error('deploySkills() must be implemented');
  }

  /**
   * Deploy hooks
   * @param {Array} hooks - Array of hook configurations
   * @param {Object} options - Deployment options
   */
  async deployHooks(hooks, options = {}) {
    if (!this.getCapabilities().hooks) {
      console.log(`[${this.getSystemId()}] Hooks not supported`);
      return { skipped: true, reason: 'Not supported' };
    }
    throw new Error('deployHooks() must be implemented');
  }

  /**
   * Deploy MCP server configurations
   * @param {Array} mcpServers - Array of MCP server configurations
   * @param {Object} options - Deployment options
   */
  async deployMcpServers(mcpServers, options = {}) {
    if (!this.getCapabilities().mcpServers) {
      console.log(`[${this.getSystemId()}] MCP Servers not supported`);
      return { skipped: true, reason: 'Not supported' };
    }
    throw new Error('deployMcpServers() must be implemented');
  }

  /**
   * Deploy settings
   * @param {Object} settings - Settings configuration
   * @param {Object} options - Deployment options
   */
  async deploySettings(settings, options = {}) {
    throw new Error('deploySettings() must be implemented');
  }

  /**
   * Main deployment method
   * @param {Object} team - The team configuration to deploy
   * @param {Object} options - Deployment options
   * @returns {Object} Deployment result with status and details
   */
  async deploy(team, options = {}) {
    const results = {
      system: this.getSystemId(),
      success: true,
      details: {},
    };

    try {
      const paths = this.getOutputPaths();
      await this.prepareDirectories(paths, options);

      // Deploy each component
      if (team.constitution) {
        results.details.constitution = await this.deployConstitution(team.constitution, options);
      }

      if (team.agents?.length) {
        results.details.agents = await this.deployAgents(team.agents, options);
      }

      if (team.skills?.length) {
        results.details.skills = await this.deploySkills(team.skills, options);
      }

      if (team.hooks?.length) {
        results.details.hooks = await this.deployHooks(team.hooks, options);
      }

      if (team.mcpServers?.length) {
        results.details.mcpServers = await this.deployMcpServers(team.mcpServers, options);
      }

      if (team.settings) {
        results.details.settings = await this.deploySettings(team.settings, options);
      }

    } catch (error) {
      results.success = false;
      results.error = error.message;
    }

    return results;
  }
}

import { ClaudeCodeProvider } from './providers/ClaudeCodeProvider.js';
import { GeminiCliProvider } from './providers/GeminiCliProvider.js';
import { ClineProvider } from './providers/ClineProvider.js';

/**
 * DeploymentService - Orchestrates deployment to multiple AI systems
 *
 * This service manages deployment providers and handles:
 * - Single-target deployment
 * - Multi-target deployment
 * - Deployment validation
 * - Compatibility warnings
 */
export class DeploymentService {
  constructor() {
    this.providers = {
      'claude-code': ClaudeCodeProvider,
      'gemini-cli': GeminiCliProvider,
      'cline': ClineProvider,
    };
  }

  /**
   * Get list of available systems
   * @returns {Array} Array of system identifiers
   */
  getAvailableSystems() {
    return Object.keys(this.providers);
  }

  /**
   * Get capabilities for a specific system
   * @param {string} system - System identifier
   * @param {string} projectPath - Project path (for provider instantiation)
   * @returns {Object} Capabilities object
   */
  getSystemCapabilities(system, projectPath) {
    const Provider = this.providers[system];
    if (!Provider) {
      throw new Error(`Unknown system: ${system}`);
    }

    const provider = new Provider(projectPath);
    return provider.getCapabilities();
  }

  /**
   * Get all systems with their capabilities
   * @param {string} projectPath - Project path
   * @returns {Object} Map of system -> capabilities
   */
  getAllSystemCapabilities(projectPath) {
    const result = {};
    for (const system of Object.keys(this.providers)) {
      result[system] = this.getSystemCapabilities(system, projectPath);
    }
    return result;
  }

  /**
   * Get a provider instance for a specific system
   * @param {string} system - System identifier
   * @param {string} projectPath - Project path
   * @returns {BaseProvider} Provider instance
   */
  getProvider(system, projectPath) {
    const Provider = this.providers[system];
    if (!Provider) {
      throw new Error(`Unknown system: ${system}`);
    }
    return new Provider(projectPath);
  }

  /**
   * Validate deployment configuration before deployment
   * @param {Object} team - Team configuration
   * @param {Array} targetSystems - Target systems
   * @param {string} projectPath - Project path
   * @returns {Object} Validation result with warnings
   */
  validateDeployment(team, targetSystems, projectPath) {
    const result = {
      valid: true,
      warnings: [],
      errors: [],
    };

    for (const system of targetSystems) {
      const capabilities = this.getSystemCapabilities(system, projectPath);

      // Check for unsupported features
      if (team.agents?.length && !capabilities.agents) {
        result.warnings.push({
          system,
          feature: 'agents',
          message: `${system} does not support sub-agents. ${team.agents.length} agent(s) will be skipped.`,
        });
      }

      if (team.hooks?.length && !capabilities.hooks) {
        result.warnings.push({
          system,
          feature: 'hooks',
          message: `${system} does not support hooks. ${team.hooks.length} hook(s) will be skipped.`,
        });
      }

      if (team.skills?.length && !capabilities.skills) {
        result.warnings.push({
          system,
          feature: 'skills',
          message: `${system} does not support skills. ${team.skills.length} skill(s) will be skipped.`,
        });
      }

      if (team.constitution && !capabilities.constitution) {
        result.warnings.push({
          system,
          feature: 'constitution',
          message: `${system} does not support constitution. Constitution will be skipped.`,
        });
      }

      if (team.mcpServers?.length && !capabilities.mcpServers) {
        result.warnings.push({
          system,
          feature: 'mcpServers',
          message: `${system} does not support MCP servers. ${team.mcpServers.length} server(s) will be skipped.`,
        });
      }
    }

    return result;
  }

  /**
   * Deploy to a single target system
   * @param {Object} team - Team configuration
   * @param {string} targetSystem - Target system identifier
   * @param {string} projectPath - Project path
   * @param {Object} options - Deployment options
   * @returns {Object} Deployment result
   */
  async deploy(team, targetSystem, projectPath, options = {}) {
    console.log(`[DeploymentService] Deploying to ${targetSystem}...`);

    const provider = this.getProvider(targetSystem, projectPath);
    return await provider.deploy(team, options);
  }

  /**
   * Deploy to multiple target systems
   * @param {Object} team - Team configuration
   * @param {Array} targetSystems - Array of target system identifiers
   * @param {string} projectPath - Project path
   * @param {Object} options - Deployment options
   * @returns {Object} Map of system -> deployment result
   */
  async deployToMultiple(team, targetSystems, projectPath, options = {}) {
    console.log(`[DeploymentService] Deploying to ${targetSystems.length} system(s): ${targetSystems.join(', ')}`);

    const results = {};
    const errors = [];

    // Validate first
    const validation = this.validateDeployment(team, targetSystems, projectPath);
    if (validation.warnings.length > 0) {
      console.log('[DeploymentService] Deployment warnings:', validation.warnings);
    }

    // Deploy to each system
    for (const system of targetSystems) {
      try {
        results[system] = await this.deploy(team, system, projectPath, options);
      } catch (error) {
        console.error(`[DeploymentService] Failed to deploy to ${system}:`, error);
        results[system] = {
          system,
          success: false,
          error: error.message,
        };
        errors.push({ system, error: error.message });
      }
    }

    return {
      results,
      validation,
      errors,
      success: errors.length === 0,
    };
  }
}

// Export singleton instance
export const deploymentService = new DeploymentService();

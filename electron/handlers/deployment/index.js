/**
 * Deployment Module - Multi-AI System Deployment Support
 *
 * This module provides a unified deployment interface for multiple AI systems:
 * - Claude Code (.claude/, CLAUDE.md)
 * - Gemini CLI (.gemini/, GEMINI.md)
 * - Cline (.clinerules, memory-bank/)
 *
 * Usage:
 *   import { DeploymentService, deploymentService } from './deployment/index.js';
 *
 *   // Deploy to multiple systems
 *   const result = await deploymentService.deployToMultiple(
 *     team,
 *     ['claude-code', 'gemini-cli'],
 *     projectPath
 *   );
 */

export { BaseProvider } from './providers/BaseProvider.js';
export { ClaudeCodeProvider } from './providers/ClaudeCodeProvider.js';
export { GeminiCliProvider } from './providers/GeminiCliProvider.js';
export { ClineProvider } from './providers/ClineProvider.js';
export { DeploymentService, deploymentService } from './DeploymentService.js';

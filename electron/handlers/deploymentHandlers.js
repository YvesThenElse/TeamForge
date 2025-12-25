import { deploymentService } from './deployment/index.js';

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
}

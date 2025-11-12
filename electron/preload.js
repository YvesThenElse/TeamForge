import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),

  // Git commands
  cloneRepo: (url, path) => ipcRenderer.invoke('git:clone', { url, path }),
  isGitRepo: (path) => ipcRenderer.invoke('git:isRepo', { path }),
  getRepoStatus: (path) => ipcRenderer.invoke('git:status', { path }),
  createGitCommit: (path, message, files) =>
    ipcRenderer.invoke('git:commit', { path, message, files }),

  // Project commands
  analyzeProject: (path) => ipcRenderer.invoke('project:analyze', { path }),

  // Agent commands
  getAgentLibrary: () => ipcRenderer.invoke('agent:getLibrary'),
  getAgentsByCategory: (category) =>
    ipcRenderer.invoke('agent:getByCategory', { category }),
  searchAgents: (keyword) => ipcRenderer.invoke('agent:search', { keyword }),
  getAgentById: (id) => ipcRenderer.invoke('agent:getById', { id }),
  generateAgentFile: (agentId, customInstructions) =>
    ipcRenderer.invoke('agent:generate', { agentId, customInstructions }),
  saveAgentFile: (agentContent, filePath) =>
    ipcRenderer.invoke('agent:save', { agentContent, filePath }),
  getSuggestedAgents: (technologies) =>
    ipcRenderer.invoke('agent:getSuggested', { technologies }),

  // Config commands
  loadTeamforgeConfig: (projectPath) =>
    ipcRenderer.invoke('config:load', { projectPath }),
  saveTeamforgeConfig: (config, projectPath) =>
    ipcRenderer.invoke('config:save', { config, projectPath }),
  createDefaultTeamforgeConfig: (
    projectName,
    projectType,
    projectPath,
    detectedTechnologies
  ) =>
    ipcRenderer.invoke('config:createDefault', {
      projectName,
      projectType,
      projectPath,
      detectedTechnologies,
    }),
  validateTeamforgeConfig: (config) =>
    ipcRenderer.invoke('config:validate', { config }),
  teamforgeExists: (projectPath) =>
    ipcRenderer.invoke('config:exists', { projectPath }),
  initializeTeamforge: (projectPath) =>
    ipcRenderer.invoke('config:initialize', { projectPath }),
  ensureClaudeAgentsDir: (projectPath) =>
    ipcRenderer.invoke('config:ensureAgentsDir', { projectPath }),
});

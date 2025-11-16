const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  openFolder: (folderPath) => ipcRenderer.invoke('folder:open', { folderPath }),

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

  // Agent File commands
  listAgentFiles: (projectPath) =>
    ipcRenderer.invoke('agentFile:list', { projectPath }),
  readAgentFile: (projectPath, agentId) =>
    ipcRenderer.invoke('agentFile:read', { projectPath, agentId }),
  saveAgentFileContent: (projectPath, agentId, frontmatter, systemPrompt) =>
    ipcRenderer.invoke('agentFile:save', {
      projectPath,
      agentId,
      frontmatter,
      systemPrompt,
    }),
  deleteAgentFile: (projectPath, agentId) =>
    ipcRenderer.invoke('agentFile:delete', { projectPath, agentId }),
  agentFileDirExists: (projectPath) =>
    ipcRenderer.invoke('agentFile:dirExists', { projectPath }),
  loadTemplateAgents: () =>
    ipcRenderer.invoke('agentFile:loadTemplates'),
  getClaudeInfo: (projectPath) =>
    ipcRenderer.invoke('agentFile:getClaudeInfo', { projectPath }),
  getGlobalClaudeInfo: () =>
    ipcRenderer.invoke('agentFile:getGlobalClaudeInfo'),

  // Skill commands
  listSkills: (projectPath) =>
    ipcRenderer.invoke('skill:list', { projectPath }),
  readSkill: (projectPath, skillId) =>
    ipcRenderer.invoke('skill:read', { projectPath, skillId }),
  saveSkill: (projectPath, skillId, frontmatter, instructions) =>
    ipcRenderer.invoke('skill:save', {
      projectPath,
      skillId,
      frontmatter,
      instructions,
    }),
  deleteSkill: (projectPath, skillId) =>
    ipcRenderer.invoke('skill:delete', { projectPath, skillId }),
  skillDirExists: (projectPath) =>
    ipcRenderer.invoke('skill:dirExists', { projectPath }),
  ensureSkillsDir: (projectPath) =>
    ipcRenderer.invoke('skill:ensureDir', { projectPath }),

  // Team commands
  listTeams: (projectPath) =>
    ipcRenderer.invoke('team:list', { projectPath }),
  loadTeam: (projectPath, teamId) =>
    ipcRenderer.invoke('team:load', { projectPath, teamId }),
  saveTeam: (projectPath, team) =>
    ipcRenderer.invoke('team:save', { projectPath, team }),
  deleteTeam: (projectPath, teamId) =>
    ipcRenderer.invoke('team:delete', { projectPath, teamId }),
  deployTeam: (projectPath, team, agentLibrary) =>
    ipcRenderer.invoke('team:deploy', { projectPath, team, agentLibrary }),
});

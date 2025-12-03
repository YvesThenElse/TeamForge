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
  getAgentLibrary: (devMode, cachePath, devPath, projectPath, sourcePath) => ipcRenderer.invoke('agent:getLibrary', { devMode, cachePath, devPath, projectPath, sourcePath }),
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
  // Developer mode CRUD
  createAgentTemplate: (agent, devPath, projectPath) =>
    ipcRenderer.invoke('agent:createTemplate', { agent, devPath, projectPath }),
  updateAgentTemplate: (agentId, agent, devPath, projectPath) =>
    ipcRenderer.invoke('agent:updateTemplate', { agentId, agent, devPath, projectPath }),
  deleteAgentTemplate: (agentId, devPath, projectPath) =>
    ipcRenderer.invoke('agent:deleteTemplate', { agentId, devPath, projectPath }),
  openAgentTemplateFile: (agentId, devPath, projectPath) =>
    ipcRenderer.invoke('agent:openTemplateFile', { agentId, devPath, projectPath }),

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
  loadTemplateSkills: (devMode, cachePath, devPath, projectPath, sourcePath) =>
    ipcRenderer.invoke('skill:loadTemplates', { devMode, cachePath, devPath, projectPath, sourcePath }),
  // Developer mode CRUD
  createSkillTemplate: (skill) =>
    ipcRenderer.invoke('skill:createTemplate', { skill }),
  updateSkillTemplate: (skillId, skill) =>
    ipcRenderer.invoke('skill:updateTemplate', { skillId, skill }),
  deleteSkillTemplate: (skillId) =>
    ipcRenderer.invoke('skill:deleteTemplate', { skillId }),
  openSkillTemplateFile: (skillId, devPath, projectPath) =>
    ipcRenderer.invoke('skill:openTemplateFile', { skillId, devPath, projectPath }),

  // Team commands
  listTeams: (projectPath) =>
    ipcRenderer.invoke('team:list', { projectPath }),
  loadTeam: (projectPath, teamId) =>
    ipcRenderer.invoke('team:load', { projectPath, teamId }),
  saveTeam: (projectPath, team) =>
    ipcRenderer.invoke('team:save', { projectPath, team }),
  deleteTeam: (projectPath, teamId) =>
    ipcRenderer.invoke('team:delete', { projectPath, teamId }),
  deployTeam: (projectPath, teamId) =>
    ipcRenderer.invoke('team:deploy', { projectPath, teamId }),
  getDeployedTeam: (projectPath) =>
    ipcRenderer.invoke('team:getDeployed', { projectPath }),
  generateTeamAgents: (projectPath, teamId, agentLibrary) =>
    ipcRenderer.invoke('team:generateAgents', { projectPath, teamId, agentLibrary }),
  generateTeamMcpConfig: (projectPath, teamId, mcpLibrary) =>
    ipcRenderer.invoke('team:generateMcpConfig', { projectPath, teamId, mcpLibrary }),

  // Agent Repository commands
  syncAgentRepository: (repoUrl, branch, cachePath, projectPath, sourcePath) =>
    ipcRenderer.invoke('agentRepo:sync', { repoUrl, branch, cachePath, projectPath, sourcePath }),
  getAgentRepositoryPath: () =>
    ipcRenderer.invoke('agentRepo:getPath'),
  getAgentRepositoryStatus: () =>
    ipcRenderer.invoke('agentRepo:status'),
  getAgentRepositoryStats: (cachePath, projectPath, sourcePath) =>
    ipcRenderer.invoke('agentRepo:stats', { cachePath, projectPath, sourcePath }),
  deleteAgentRepository: (cachePath, projectPath) =>
    ipcRenderer.invoke('agentRepo:delete', { cachePath, projectPath }),
  reloadAgents: (devMode, cachePath, devPath, projectPath, sourcePath) =>
    ipcRenderer.invoke('agent:reload', { devMode, cachePath, devPath, projectPath, sourcePath }),

  // Hook commands
  loadTemplateHooks: (devMode, cachePath, devPath, projectPath, sourcePath) =>
    ipcRenderer.invoke('hook:loadTemplates', { devMode, cachePath, devPath, projectPath, sourcePath }),
  listHooks: (projectPath, settingsFileName) =>
    ipcRenderer.invoke('hook:list', { projectPath, settingsFileName }),
  deployHook: (projectPath, hook, settingsFileName) =>
    ipcRenderer.invoke('hook:deploy', { projectPath, hook, settingsFileName }),
  removeHook: (projectPath, hookEvent, matcher, command, settingsFileName) =>
    ipcRenderer.invoke('hook:remove', { projectPath, hookEvent, matcher, command, settingsFileName }),
  hookDirExists: (projectPath) =>
    ipcRenderer.invoke('hook:dirExists', { projectPath }),
  ensureHooksDir: (projectPath) =>
    ipcRenderer.invoke('hook:ensureDir', { projectPath }),
  // Developer mode CRUD
  createHookTemplate: (hook) =>
    ipcRenderer.invoke('hook:createTemplate', { hook }),
  updateHookTemplate: (hookId, hook) =>
    ipcRenderer.invoke('hook:updateTemplate', { hookId, hook }),
  deleteHookTemplate: (hookId) =>
    ipcRenderer.invoke('hook:deleteTemplate', { hookId }),
  openHookTemplateFile: (devPath, projectPath) =>
    ipcRenderer.invoke('hook:openTemplateFile', { devPath, projectPath }),

  // MCP Server commands
  listMcpServers: (projectPath) =>
    ipcRenderer.invoke('mcp:list', { projectPath }),
  loadTemplateMcps: (devMode, cachePath, devPath, projectPath, sourcePath) =>
    ipcRenderer.invoke('mcp:loadTemplates', { devMode, cachePath, devPath, projectPath, sourcePath }),
  // Developer mode CRUD
  createMcpTemplate: (mcp, devPath, projectPath) =>
    ipcRenderer.invoke('mcp:createTemplate', { mcp, devPath, projectPath }),
  updateMcpTemplate: (mcpId, mcp, devPath, projectPath) =>
    ipcRenderer.invoke('mcp:updateTemplate', { mcpId, mcp, devPath, projectPath }),
  deleteMcpTemplate: (mcpId, devPath, projectPath) =>
    ipcRenderer.invoke('mcp:deleteTemplate', { mcpId, devPath, projectPath }),
  openMcpTemplateFile: (mcpId, devPath, projectPath) =>
    ipcRenderer.invoke('mcp:openTemplateFile', { mcpId, devPath, projectPath }),

  // TeamForge Settings commands (project-level settings.json)
  loadTeamforgeSettings: (projectPath) =>
    ipcRenderer.invoke('teamforgeSettings:load', { projectPath }),
  saveTeamforgeSettings: (projectPath, settings) =>
    ipcRenderer.invoke('teamforgeSettings:save', { projectPath, settings }),
  teamforgeSettingsExists: (projectPath) =>
    ipcRenderer.invoke('teamforgeSettings:exists', { projectPath }),

  // Claude Settings commands
  loadClaudeSettings: (projectPath, settingsFileName) =>
    ipcRenderer.invoke('claudeSettings:load', { projectPath, settingsFileName }),
  saveClaudeSettings: (projectPath, settings, settingsFileName) =>
    ipcRenderer.invoke('claudeSettings:save', { projectPath, settings, settingsFileName }),
  loadUserClaudeSettings: () =>
    ipcRenderer.invoke('claudeSettings:loadUser'),
  loadAllClaudeSettings: (projectPath) =>
    ipcRenderer.invoke('claudeSettings:loadAll', { projectPath }),
  claudeSettingsExists: (projectPath, settingsFileName) =>
    ipcRenderer.invoke('claudeSettings:exists', { projectPath, settingsFileName }),
  ensureClaudeSettingsDir: (projectPath) =>
    ipcRenderer.invoke('claudeSettings:ensureDir', { projectPath }),
  validateClaudeSettings: (settings) =>
    ipcRenderer.invoke('claudeSettings:validate', { settings }),
});

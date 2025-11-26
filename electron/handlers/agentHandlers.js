import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load agent library from Git repository based on configuration
let agentLibrary = null;
let agentLibraryDev = null;

// Default cache path for agent repository
function getDefaultCachePath() {
  const homeDir = os.homedir();
  return path.join(homeDir, '.teamforge', 'cache', 'agents');
}

// Get dev path for local development
function getDevPath(devPath = null) {
  return devPath || null;
}

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, template: content };
  }

  const frontmatterText = match[1];
  const template = match[2].trim();

  // Simple YAML parser for our frontmatter
  const frontmatter = {};
  const lines = frontmatterText.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Parse arrays [item1, item2, ...]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim());
    }

    frontmatter[key] = value;
  }

  return { frontmatter, template };
}

async function scanAgentDirectory(dir, category = null, baseDir = null) {
  const agents = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  // Set baseDir on first call
  if (baseDir === null) {
    baseDir = dir;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const subCategory = category || entry.name;
      const subAgents = await scanAgentDirectory(fullPath, subCategory, baseDir);
      agents.push(...subAgents);
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name.toLowerCase() !== 'readme.md') {
      // Skip README.md files, parse agent files only
      const content = await fs.readFile(fullPath, 'utf-8');
      const { frontmatter, template } = parseFrontmatter(content);

      // Generate ID from relative path to ensure uniqueness
      const relativePath = path.relative(baseDir, fullPath);
      const id = relativePath.replace(/\\/g, '/').replace('.md', '').replace(/\//g, '-');

      agents.push({
        id,
        name: frontmatter.name || entry.name.replace('.md', ''),
        description: frontmatter.description || '',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        category: frontmatter.category || category || 'general',
        template,
        suggestedFor: Array.isArray(frontmatter['suggested-for'])
          ? frontmatter['suggested-for']
          : [],
        tools: frontmatter.tools || '*',
        model: frontmatter.model || 'sonnet',
      });
    }
  }

  return agents;
}

async function loadAgentLibrary(forceReload = false, devMode = false, cachePath = null, devPath = null, projectPath = null, sourcePath = null) {
  // Use separate cache for dev mode vs normal mode
  const currentCache = devMode ? agentLibraryDev : agentLibrary;

  if (!currentCache || forceReload) {
    let templatesDir;
    let source;

    if (devMode) {
      // In dev mode, use the dev path
      let resolvedDevPath = getDevPath(devPath);
      if (!resolvedDevPath) {
        throw new Error('Developer mode is enabled but no Dev Path is configured. Please set a Dev Path in Settings > Agents.');
      }
      // Resolve relative paths from project path
      if (!path.isAbsolute(resolvedDevPath)) {
        if (projectPath) {
          resolvedDevPath = path.join(projectPath, resolvedDevPath);
        } else {
          throw new Error('Developer mode with relative path requires a project to be selected.');
        }
      }
      templatesDir = resolvedDevPath;
      source = 'dev';
      console.log('[AgentHandlers] Developer mode: Loading agents from:', templatesDir);
    } else {
      // Use cache path (from settings or default)
      let repoPath = cachePath || getDefaultCachePath();
      // Resolve relative paths from project path
      if (repoPath && !path.isAbsolute(repoPath)) {
        if (projectPath) {
          repoPath = path.join(projectPath, repoPath);
        } else {
          // Fallback to home directory if no project selected
          repoPath = path.join(os.homedir(), repoPath);
        }
      }
      try {
        // Check if cache directory exists
        await fs.access(repoPath);
        // Apply sourcePath if provided (subdirectory within the repo)
        if (sourcePath) {
          templatesDir = path.join(repoPath, sourcePath);
          console.log('[AgentHandlers] Using sourcePath, loading from:', templatesDir);
        } else {
          templatesDir = repoPath;
        }
        source = 'cache';
        console.log('[AgentHandlers] Loading agents from cache:', templatesDir);
      } catch {
        console.log('[AgentHandlers] Cache not found at:', repoPath);
        // Return empty library instead of throwing error (consistent with Skills and Hooks)
        const emptyLibrary = {
          version: '2.0.0',
          agents: [],
          categories: [],
          source: 'none',
          loadedFrom: null,
        };
        if (devMode) {
          agentLibraryDev = emptyLibrary;
        } else {
          agentLibrary = emptyLibrary;
        }
        return emptyLibrary;
      }
    }

    const agents = await scanAgentDirectory(templatesDir);

    // Extract unique categories
    const categoriesSet = new Set(agents.map((agent) => agent.category));
    const categories = Array.from(categoriesSet).sort();

    const libraryData = {
      version: '2.0.0',
      agents,
      categories,
      source, // 'git', 'local', or 'dev'
      loadedFrom: templatesDir,
    };

    // Save to appropriate cache
    if (devMode) {
      agentLibraryDev = libraryData;
    } else {
      agentLibrary = libraryData;
    }

    console.log(`[AgentHandlers] Loaded ${agents.length} agents from ${source} (${templatesDir})`);
  }

  // Return the appropriate cache
  return devMode ? agentLibraryDev : agentLibrary;
}

export function registerAgentHandlers(ipcMain) {
  // Get full agent library
  ipcMain.handle('agent:getLibrary', async (event, { devMode = false, cachePath = null, devPath = null, projectPath = null, sourcePath = null } = {}) => {
    console.log('[agent:getLibrary] Called with devMode:', devMode, 'cachePath:', cachePath, 'projectPath:', projectPath, 'sourcePath:', sourcePath);
    // Always force reload to ensure we get the correct directory
    const library = await loadAgentLibrary(true, devMode, cachePath, devPath, projectPath, sourcePath);
    console.log('[agent:getLibrary] Returning library from:', library.loadedFrom, 'source:', library.source);
    return {
      version: library.version,
      agents: library.agents,
      categories: library.categories,
      source: library.source,
      loadedFrom: library.loadedFrom,
    };
  });

  // Get agents by category
  ipcMain.handle('agent:getByCategory', async (event, { category }) => {
    const library = await loadAgentLibrary();
    return library.agents.filter((agent) => agent.category === category);
  });

  // Search agents by keyword
  ipcMain.handle('agent:search', async (event, { keyword }) => {
    const library = await loadAgentLibrary();
    const keywordLower = keyword.toLowerCase();

    return library.agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(keywordLower) ||
        agent.description.toLowerCase().includes(keywordLower) ||
        agent.tags.some((tag) => tag.toLowerCase().includes(keywordLower))
    );
  });

  // Get agent by ID
  ipcMain.handle('agent:getById', async (event, { id }) => {
    const library = await loadAgentLibrary();
    return library.agents.find((agent) => agent.id === id) || null;
  });

  // Generate agent file content
  ipcMain.handle('agent:generate', async (event, { agentId, customInstructions }) => {
    const library = await loadAgentLibrary();
    const agent = library.agents.find((a) => a.id === agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Generate frontmatter
    let frontmatter = `---
name: ${agent.name}
description: ${agent.description}
tags: [${agent.tags.join(', ')}]
tools: ${JSON.stringify(agent.tools)}
model: ${agent.model}
---

`;

    // Add template content
    let content = agent.template;

    // Add custom instructions if provided
    if (customInstructions) {
      content += '\n\n## Custom Instructions\n\n';
      content += customInstructions;
    }

    return frontmatter + content;
  });

  // Save agent file
  ipcMain.handle('agent:save', async (event, { agentContent, filePath }) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(filePath, agentContent, 'utf-8');

      return `Agent saved to ${filePath}`;
    } catch (error) {
      throw new Error(`Failed to save agent file: ${error.message}`);
    }
  });

  // Get suggested agents for technologies
  ipcMain.handle('agent:getSuggested', async (event, { technologies }) => {
    const library = await loadAgentLibrary();

    return library.agents.filter((agent) =>
      agent.suggestedFor.some((tech) =>
        technologies.some(
          (t) =>
            t.toLowerCase().includes(tech.toLowerCase()) ||
            tech.toLowerCase().includes(t.toLowerCase())
        )
      )
    );
  });

  // Reload agent library (hot reload)
  ipcMain.handle('agent:reload', async (event, { devMode = false, cachePath = null, devPath = null, projectPath = null, sourcePath = null } = {}) => {
    console.log('[AgentHandlers] Reloading agent library... cachePath:', cachePath, 'projectPath:', projectPath, 'sourcePath:', sourcePath);
    const library = await loadAgentLibrary(true, devMode, cachePath, devPath, projectPath, sourcePath); // Force reload
    return {
      success: true,
      agentCount: library.agents.length,
      source: library.source,
      loadedFrom: library.loadedFrom,
    };
  });

  // ========== DEVELOPER MODE CRUD OPERATIONS ==========

  // Create new agent template in dev directory
  ipcMain.handle('agent:createTemplate', async (event, { agent, devPath, projectPath }) => {
    if (!devPath) {
      throw new Error('Dev Path is not configured. Please set a Dev Path in Settings > Agents.');
    }

    // Resolve relative paths from project path
    let resolvedDevPath = devPath;
    if (!path.isAbsolute(devPath)) {
      if (projectPath) {
        resolvedDevPath = path.join(projectPath, devPath);
      } else {
        throw new Error('Developer mode with relative path requires a project to be selected.');
      }
    }

    // Generate filename from agent name (sanitize)
    const fileName = agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
    const categoryPath = path.join(resolvedDevPath, agent.category || 'general');
    const fullPath = path.join(categoryPath, fileName);

    // Build frontmatter
    const frontmatter = `---
name: ${agent.name}
description: ${agent.description || ''}
tags: [${Array.isArray(agent.tags) ? agent.tags.join(', ') : ''}]
category: ${agent.category || 'general'}
tools: ${JSON.stringify(agent.tools || '*')}
model: ${agent.model || 'sonnet'}
suggested-for: [${Array.isArray(agent.suggestedFor) ? agent.suggestedFor.join(', ') : ''}]
---

${agent.template || ''}`;

    // Ensure directory exists
    await fs.mkdir(categoryPath, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, frontmatter, 'utf-8');

    console.log(`[AgentHandlers] Created template: ${fullPath}`);

    return {
      success: true,
      path: fullPath,
      agentId: fileName.replace('.md', ''),
      message: `Agent template created: ${fileName}`,
    };
  });

  // Update existing agent template in dev directory
  ipcMain.handle('agent:updateTemplate', async (event, { agentId, agent, devPath, projectPath }) => {
    if (!devPath) {
      throw new Error('Dev Path is not configured. Please set a Dev Path in Settings > Agents.');
    }

    // Resolve relative paths from project path
    let resolvedDevPath = devPath;
    if (!path.isAbsolute(devPath)) {
      if (projectPath) {
        resolvedDevPath = path.join(projectPath, devPath);
      } else {
        throw new Error('Developer mode with relative path requires a project to be selected.');
      }
    }

    // Find the original file by scanning for the ID
    const agents = await scanAgentDirectory(resolvedDevPath);
    const originalAgent = agents.find((a) => a.id === agentId);

    if (!originalAgent) {
      throw new Error(`Agent template not found: ${agentId}`);
    }

    // Reconstruct the file path from the ID
    const filePath = path.join(resolvedDevPath, agentId.replace(/-/g, '/') + '.md');

    // Build updated frontmatter
    const frontmatter = `---
name: ${agent.name}
description: ${agent.description || ''}
tags: [${Array.isArray(agent.tags) ? agent.tags.join(', ') : ''}]
category: ${agent.category || 'general'}
tools: ${JSON.stringify(agent.tools || '*')}
model: ${agent.model || 'sonnet'}
suggested-for: [${Array.isArray(agent.suggestedFor) ? agent.suggestedFor.join(', ') : ''}]
---

${agent.template || ''}`;

    // Write file
    await fs.writeFile(filePath, frontmatter, 'utf-8');

    console.log(`[AgentHandlers] Updated template: ${filePath}`);

    return {
      success: true,
      path: filePath,
      message: `Agent template updated: ${agent.name}`,
    };
  });

  // Delete agent template from dev directory
  ipcMain.handle('agent:deleteTemplate', async (event, { agentId, devPath, projectPath }) => {
    if (!devPath) {
      throw new Error('Dev Path is not configured. Please set a Dev Path in Settings > Agents.');
    }

    // Resolve relative paths from project path
    let resolvedDevPath = devPath;
    if (!path.isAbsolute(devPath)) {
      if (projectPath) {
        resolvedDevPath = path.join(projectPath, devPath);
      } else {
        throw new Error('Developer mode with relative path requires a project to be selected.');
      }
    }

    // Reconstruct the file path from the ID
    const filePath = path.join(resolvedDevPath, agentId.replace(/-/g, '/') + '.md');

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`Agent template not found: ${agentId}`);
    }

    // Delete file
    await fs.unlink(filePath);

    console.log(`[AgentHandlers] Deleted template: ${filePath}`);

    return {
      success: true,
      message: `Agent template deleted: ${agentId}`,
    };
  });
}

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load agent library from Git repository or fallback to local agents_template
let agentLibrary = null;
let agentLibraryDev = null;

// Get path to agent repository
function getAgentRepoPath() {
  const homeDir = os.homedir();
  return path.join(homeDir, '.teamforge', 'agent-templates');
}

// Fallback to local agents_template if Git repo doesn't exist
function getFallbackAgentPath(devMode = false) {
  // __dirname is electron/handlers/, so go up two levels to project root
  const dirName = devMode ? 'agents_dev' : 'agents_template';
  return path.join(__dirname, '..', '..', dirName);
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

async function loadAgentLibrary(forceReload = false, devMode = false) {
  // Use separate cache for dev mode vs normal mode
  const currentCache = devMode ? agentLibraryDev : agentLibrary;

  if (!currentCache || forceReload) {
    // In dev mode, only use local _dev directory (no Git repo)
    const fallbackPath = getFallbackAgentPath(devMode);

    let templatesDir = fallbackPath;
    let source = devMode ? 'dev' : 'local';

    // Only try Git repo if NOT in dev mode
    if (!devMode) {
      const gitRepoPath = getAgentRepoPath();
      try {
        // Check if Git repo exists
        await fs.access(gitRepoPath);
        templatesDir = gitRepoPath;
        source = 'git';
        console.log('[AgentHandlers] Loading agents from Git repository:', gitRepoPath);
      } catch {
        console.log('[AgentHandlers] Git repository not found, using local fallback:', fallbackPath);
      }
    } else {
      console.log('[AgentHandlers] Developer mode: Loading agents from:', fallbackPath);
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
  ipcMain.handle('agent:getLibrary', async (event, { devMode = false } = {}) => {
    console.log('[agent:getLibrary] Called with devMode:', devMode);
    // Always force reload to ensure we get the correct directory
    const library = await loadAgentLibrary(true, devMode);
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
  ipcMain.handle('agent:reload', async (event, { devMode = false } = {}) => {
    console.log('[AgentHandlers] Reloading agent library...');
    const library = await loadAgentLibrary(true, devMode); // Force reload
    return {
      success: true,
      agentCount: library.agents.length,
      source: library.source,
      loadedFrom: library.loadedFrom,
    };
  });

  // ========== DEVELOPER MODE CRUD OPERATIONS ==========

  // Create new agent template in agents_dev/
  ipcMain.handle('agent:createTemplate', async (event, { agent }) => {
    const devPath = getFallbackAgentPath(true); // agents_dev/

    // Generate filename from agent name (sanitize)
    const fileName = agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
    const categoryPath = path.join(devPath, agent.category || 'general');
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
      message: `Agent template created: ${fileName}`,
    };
  });

  // Update existing agent template in agents_dev/
  ipcMain.handle('agent:updateTemplate', async (event, { agentId, agent }) => {
    const devPath = getFallbackAgentPath(true); // agents_dev/

    // Find the original file by scanning for the ID
    const agents = await scanAgentDirectory(devPath);
    const originalAgent = agents.find((a) => a.id === agentId);

    if (!originalAgent) {
      throw new Error(`Agent template not found: ${agentId}`);
    }

    // Reconstruct the file path from the ID
    const filePath = path.join(devPath, agentId.replace(/-/g, '/') + '.md');

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

  // Delete agent template from agents_dev/
  ipcMain.handle('agent:deleteTemplate', async (event, { agentId }) => {
    const devPath = getFallbackAgentPath(true); // agents_dev/

    // Reconstruct the file path from the ID
    const filePath = path.join(devPath, agentId.replace(/-/g, '/') + '.md');

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

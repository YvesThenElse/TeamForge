import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load agent library from agents_template directory
let agentLibrary = null;

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

async function scanAgentDirectory(dir, category = null) {
  const agents = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const subCategory = category || entry.name;
      const subAgents = await scanAgentDirectory(fullPath, subCategory);
      agents.push(...subAgents);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Parse agent file
      const content = await fs.readFile(fullPath, 'utf-8');
      const { frontmatter, template } = parseFrontmatter(content);

      // Generate ID from filename
      const id = entry.name.replace('.md', '');

      agents.push({
        id,
        name: frontmatter.name || id,
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

async function loadAgentLibrary() {
  if (!agentLibrary) {
    const templatesDir = path.join(__dirname, 'agents_template');
    const agents = await scanAgentDirectory(templatesDir);

    // Extract unique categories
    const categoriesSet = new Set(agents.map((agent) => agent.category));
    const categories = Array.from(categoriesSet).sort();

    agentLibrary = {
      version: '2.0.0',
      agents,
      categories,
    };
  }

  return agentLibrary;
}

export function registerAgentHandlers(ipcMain) {
  // Get full agent library
  ipcMain.handle('agent:getLibrary', async () => {
    const library = await loadAgentLibrary();
    return {
      version: library.version,
      agents: library.agents,
      categories: library.categories,
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
}

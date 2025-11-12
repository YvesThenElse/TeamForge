import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load agent library
let agentLibrary = null;

async function loadAgentLibrary() {
  if (!agentLibrary) {
    const libraryPath = path.join(__dirname, 'agents', 'library.json');
    const content = await fs.readFile(libraryPath, 'utf-8');
    agentLibrary = JSON.parse(content);
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
      agent.suggested_for.some((tech) =>
        technologies.some(
          (t) =>
            t.toLowerCase().includes(tech.toLowerCase()) ||
            tech.toLowerCase().includes(t.toLowerCase())
        )
      )
    );
  });
}

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Parse agent markdown file with YAML frontmatter
 * @param {string} content - Raw file content
 * @returns {Object} Parsed agent data
 */
function parseAgentFile(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    // No frontmatter, just content
    return {
      frontmatter: {},
      systemPrompt: content.trim(),
    };
  }

  const frontmatterContent = match[1];
  const systemPrompt = match[2].trim();

  try {
    const frontmatter = yaml.load(frontmatterContent) || {};
    return { frontmatter, systemPrompt };
  } catch (err) {
    console.error('Failed to parse YAML frontmatter:', err);
    return {
      frontmatter: {},
      systemPrompt: systemPrompt,
    };
  }
}

/**
 * Format agent data to markdown file with YAML frontmatter
 * @param {Object} frontmatter - Agent metadata
 * @param {string} systemPrompt - Agent system prompt
 * @returns {string} Formatted markdown content
 */
function formatAgentFile(frontmatter, systemPrompt) {
  const yamlContent = yaml.dump(frontmatter, { lineWidth: -1 });
  return `---\n${yamlContent}---\n\n${systemPrompt}`;
}

/**
 * Register all agent file handlers
 * @param {import('electron').IpcMain} ipcMain
 */
export function registerAgentFileHandlers(ipcMain) {
  // List all agents in project .claude/agents/ directory
  ipcMain.handle('agentFile:list', async (event, { projectPath }) => {
    try {
      const agentsDir = path.join(projectPath, '.claude', 'agents');

      // Check if directory exists
      try {
        await fs.access(agentsDir);
      } catch {
        return []; // Directory doesn't exist, return empty array
      }

      const files = await fs.readdir(agentsDir);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      const agents = await Promise.all(
        mdFiles.map(async (filename) => {
          const filePath = path.join(agentsDir, filename);
          const content = await fs.readFile(filePath, 'utf-8');
          const { frontmatter, systemPrompt } = parseAgentFile(content);

          return {
            id: path.basename(filename, '.md'),
            filename,
            filePath,
            name: frontmatter.name || path.basename(filename, '.md'),
            description: frontmatter.description || '',
            tools: frontmatter.tools || 'all',
            model: frontmatter.model || 'inherit',
            systemPrompt,
            frontmatter,
          };
        })
      );

      return agents;
    } catch (err) {
      console.error('Failed to list agents:', err);
      throw err;
    }
  });

  // Read a single agent file
  ipcMain.handle('agentFile:read', async (event, { projectPath, agentId }) => {
    try {
      const agentsDir = path.join(projectPath, '.claude', 'agents');
      const filePath = path.join(agentsDir, `${agentId}.md`);

      const content = await fs.readFile(filePath, 'utf-8');
      const { frontmatter, systemPrompt } = parseAgentFile(content);

      return {
        id: agentId,
        filename: `${agentId}.md`,
        filePath,
        name: frontmatter.name || agentId,
        description: frontmatter.description || '',
        tools: frontmatter.tools || 'all',
        model: frontmatter.model || 'inherit',
        systemPrompt,
        frontmatter,
      };
    } catch (err) {
      console.error('Failed to read agent:', err);
      throw err;
    }
  });

  // Save/create agent file
  ipcMain.handle(
    'agentFile:save',
    async (event, { projectPath, agentId, frontmatter, systemPrompt }) => {
      try {
        const agentsDir = path.join(projectPath, '.claude', 'agents');

        // Ensure directory exists
        await fs.mkdir(agentsDir, { recursive: true });

        const filePath = path.join(agentsDir, `${agentId}.md`);
        const content = formatAgentFile(frontmatter, systemPrompt);

        await fs.writeFile(filePath, content, 'utf-8');

        return {
          success: true,
          filePath,
        };
      } catch (err) {
        console.error('Failed to save agent:', err);
        throw err;
      }
    }
  );

  // Delete agent file
  ipcMain.handle('agentFile:delete', async (event, { projectPath, agentId }) => {
    try {
      const agentsDir = path.join(projectPath, '.claude', 'agents');
      const filePath = path.join(agentsDir, `${agentId}.md`);

      await fs.unlink(filePath);

      return { success: true };
    } catch (err) {
      console.error('Failed to delete agent:', err);
      throw err;
    }
  });

  // Check if .claude/agents/ directory exists
  ipcMain.handle('agentFile:dirExists', async (event, { projectPath }) => {
    try {
      const agentsDir = path.join(projectPath, '.claude', 'agents');
      await fs.access(agentsDir);
      return true;
    } catch {
      return false;
    }
  });
}

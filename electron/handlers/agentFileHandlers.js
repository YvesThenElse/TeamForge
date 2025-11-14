import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Get Claude configuration info
  ipcMain.handle('agentFile:getClaudeInfo', async (event, { projectPath }) => {
    try {
      const claudeDir = path.join(projectPath, '.claude');

      // Check if .claude directory exists
      try {
        await fs.access(claudeDir);
      } catch {
        return {
          exists: false,
          agentsDir: false,
          settingsFile: false,
          settings: null,
        };
      }

      // Check for agents directory
      let agentsDirExists = false;
      try {
        await fs.access(path.join(claudeDir, 'agents'));
        agentsDirExists = true;
      } catch {}

      // Check for settings file
      let settingsFileExists = false;
      let settings = null;
      const settingsPath = path.join(claudeDir, 'settings');

      try {
        await fs.access(settingsPath);
        settingsFileExists = true;

        // Try to read settings file
        const content = await fs.readFile(settingsPath, 'utf-8');

        // Settings can be JSON or plain text
        try {
          settings = JSON.parse(content);
        } catch {
          // If not JSON, parse as key-value pairs
          settings = {};
          content.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
              settings[key.trim()] = values.join('=').trim();
            }
          });
        }
      } catch {}

      return {
        exists: true,
        agentsDir: agentsDirExists,
        settingsFile: settingsFileExists,
        settings,
        claudePath: claudeDir,
      };
    } catch (err) {
      console.error('[agentFile:getClaudeInfo] Failed:', err);
      return {
        exists: false,
        agentsDir: false,
        settingsFile: false,
        settings: null,
      };
    }
  });

  // Get global Claude configuration info from user home directory
  ipcMain.handle('agentFile:getGlobalClaudeInfo', async () => {
    try {
      const os = await import('os');
      const homeDir = os.homedir();
      const claudeDir = path.join(homeDir, '.claude');

      console.log('[agentFile:getGlobalClaudeInfo] Checking:', claudeDir);

      // Check if .claude directory exists
      try {
        await fs.access(claudeDir);
      } catch {
        return {
          exists: false,
          agentsDir: false,
          settingsJsonFile: false,
          agentsCount: 0,
          settings: null,
          claudePath: claudeDir,
        };
      }

      // Check for agents directory
      let agentsDirExists = false;
      let agentsCount = 0;
      try {
        const agentsPath = path.join(claudeDir, 'agents');
        await fs.access(agentsPath);
        agentsDirExists = true;

        // Count agent files
        const files = await fs.readdir(agentsPath);
        agentsCount = files.filter((f) => f.endsWith('.md')).length;
      } catch {}

      // Check for settings.json file
      let settingsJsonFileExists = false;
      let settings = null;
      const settingsPath = path.join(claudeDir, 'settings.json');

      try {
        await fs.access(settingsPath);
        settingsJsonFileExists = true;

        // Try to read settings.json file
        const content = await fs.readFile(settingsPath, 'utf-8');
        try {
          settings = JSON.parse(content);
        } catch (parseErr) {
          console.error('[agentFile:getGlobalClaudeInfo] Failed to parse settings.json:', parseErr);
        }
      } catch {}

      return {
        exists: true,
        agentsDir: agentsDirExists,
        settingsJsonFile: settingsJsonFileExists,
        agentsCount,
        settings,
        claudePath: claudeDir,
      };
    } catch (err) {
      console.error('[agentFile:getGlobalClaudeInfo] Failed:', err);
      return {
        exists: false,
        agentsDir: false,
        settingsJsonFile: false,
        agentsCount: 0,
        settings: null,
      };
    }
  });

  // Load template agents from agents_template directory
  ipcMain.handle('agentFile:loadTemplates', async () => {
    try {
      // Go up from handlers directory to project root
      const projectRoot = path.join(__dirname, '..', '..');
      const templatesDir = path.join(projectRoot, 'agents_template');

      console.log('[agentFile:loadTemplates] Loading from:', templatesDir);

      // Check if directory exists
      try {
        await fs.access(templatesDir);
      } catch {
        console.log('[agentFile:loadTemplates] Directory not found');
        return [];
      }

      const files = await fs.readdir(templatesDir);
      const mdFiles = files.filter((f) => f.endsWith('.md') && f !== 'README.md');

      console.log('[agentFile:loadTemplates] Found files:', mdFiles);

      const templates = await Promise.all(
        mdFiles.map(async (filename) => {
          const filePath = path.join(templatesDir, filename);
          const content = await fs.readFile(filePath, 'utf-8');
          const { frontmatter, systemPrompt } = parseAgentFile(content);

          const agentId = path.basename(filename, '.md');

          // Default categories based on agent type
          const categoryMap = {
            'fullstack-developer': 'Development',
            'frontend-specialist': 'Development',
            'backend-specialist': 'Development',
            'code-reviewer': 'Quality',
            'debugger': 'Quality',
            'security-auditor': 'Security',
            'documentation-writer': 'Documentation',
          };

          return {
            id: agentId,
            name: frontmatter.name || agentId,
            description: frontmatter.description || '',
            category: frontmatter.category || categoryMap[agentId] || 'General',
            tools: frontmatter.tools || 'all',
            model: frontmatter.model || 'sonnet',
            template: systemPrompt,
            tags: frontmatter.tags || [],
            suggested_for: frontmatter.suggested_for || [],
          };
        })
      );

      console.log('[agentFile:loadTemplates] Loaded templates:', templates.length);
      return templates;
    } catch (err) {
      console.error('[agentFile:loadTemplates] Failed to load templates:', err);
      return [];
    }
  });
}

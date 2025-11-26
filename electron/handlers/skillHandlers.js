import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse skill SKILL.md file with YAML frontmatter
 * @param {string} content - Raw file content
 * @returns {Object} Parsed skill data
 */
function parseSkillFile(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    // No frontmatter, just content
    return {
      frontmatter: {},
      instructions: content.trim(),
    };
  }

  const frontmatterContent = match[1];
  const instructions = match[2].trim();

  try {
    const frontmatter = yaml.load(frontmatterContent) || {};
    return { frontmatter, instructions };
  } catch (err) {
    console.error('Failed to parse YAML frontmatter:', err);
    return {
      frontmatter: {},
      instructions: instructions,
    };
  }
}

/**
 * Format skill data to SKILL.md file with YAML frontmatter
 * @param {Object} frontmatter - Skill metadata
 * @param {string} instructions - Skill instructions
 * @returns {string} Formatted markdown content
 */
function formatSkillFile(frontmatter, instructions) {
  const yamlContent = yaml.dump(frontmatter, { lineWidth: -1 });
  return `---\n${yamlContent}---\n\n${instructions}`;
}

/**
 * Register all skill handlers
 * @param {import('electron').IpcMain} ipcMain
 */
export function registerSkillHandlers(ipcMain) {
  // List all skills in project .claude/skills/ directory
  ipcMain.handle('skill:list', async (event, { projectPath }) => {
    try {
      const skillsDir = path.join(projectPath, '.claude', 'skills');

      // Check if directory exists
      try {
        await fs.access(skillsDir);
      } catch {
        return []; // Directory doesn't exist, return empty array
      }

      const entries = await fs.readdir(skillsDir, { withFileTypes: true });
      const skillDirs = entries.filter((entry) => entry.isDirectory());

      const skills = await Promise.all(
        skillDirs.map(async (dir) => {
          const skillPath = path.join(skillsDir, dir.name);
          const skillFilePath = path.join(skillPath, 'SKILL.md');

          try {
            const content = await fs.readFile(skillFilePath, 'utf-8');
            const { frontmatter, instructions } = parseSkillFile(content);

            return {
              id: dir.name,
              name: frontmatter.name || dir.name,
              description: frontmatter.description || '',
              allowedTools: frontmatter['allowed-tools'] || null,
              instructions,
              frontmatter,
              skillPath,
            };
          } catch (err) {
            console.error(`Failed to read skill ${dir.name}:`, err);
            // Return basic info even if SKILL.md is missing
            return {
              id: dir.name,
              name: dir.name,
              description: 'Error loading skill',
              allowedTools: null,
              instructions: '',
              frontmatter: {},
              skillPath,
              error: true,
            };
          }
        })
      );

      return skills;
    } catch (err) {
      console.error('Failed to list skills:', err);
      throw err;
    }
  });

  // Read a single skill
  ipcMain.handle('skill:read', async (event, { projectPath, skillId }) => {
    try {
      const skillPath = path.join(projectPath, '.claude', 'skills', skillId);
      const skillFilePath = path.join(skillPath, 'SKILL.md');

      const content = await fs.readFile(skillFilePath, 'utf-8');
      const { frontmatter, instructions } = parseSkillFile(content);

      return {
        id: skillId,
        name: frontmatter.name || skillId,
        description: frontmatter.description || '',
        allowedTools: frontmatter['allowed-tools'] || null,
        instructions,
        frontmatter,
        skillPath,
      };
    } catch (err) {
      console.error('Failed to read skill:', err);
      throw err;
    }
  });

  // Create/Save skill
  ipcMain.handle(
    'skill:save',
    async (event, { projectPath, skillId, frontmatter, instructions }) => {
      try {
        const skillsDir = path.join(projectPath, '.claude', 'skills');
        const skillPath = path.join(skillsDir, skillId);
        const skillFilePath = path.join(skillPath, 'SKILL.md');

        // Ensure skill directory exists
        await fs.mkdir(skillPath, { recursive: true });

        // Format and save SKILL.md
        const content = formatSkillFile(frontmatter, instructions);
        await fs.writeFile(skillFilePath, content, 'utf-8');

        return {
          success: true,
          skillPath,
        };
      } catch (err) {
        console.error('Failed to save skill:', err);
        throw err;
      }
    }
  );

  // Delete skill
  ipcMain.handle('skill:delete', async (event, { projectPath, skillId }) => {
    try {
      const skillPath = path.join(projectPath, '.claude', 'skills', skillId);

      // Remove entire skill directory
      await fs.rm(skillPath, { recursive: true, force: true });

      return { success: true };
    } catch (err) {
      console.error('Failed to delete skill:', err);
      throw err;
    }
  });

  // Check if .claude/skills/ directory exists
  ipcMain.handle('skill:dirExists', async (event, { projectPath }) => {
    try {
      const skillsDir = path.join(projectPath, '.claude', 'skills');
      await fs.access(skillsDir);
      return true;
    } catch {
      return false;
    }
  });

  // Create .claude/skills/ directory
  ipcMain.handle('skill:ensureDir', async (event, { projectPath }) => {
    try {
      const skillsDir = path.join(projectPath, '.claude', 'skills');
      await fs.mkdir(skillsDir, { recursive: true });
      return '.claude/skills/ directory created';
    } catch (error) {
      throw new Error(`Failed to create .claude/skills/ directory: ${error.message}`);
    }
  });

  // Load template skills from configured path
  ipcMain.handle('skill:loadTemplates', async (event, { devMode = false, cachePath = null, devPath = null, projectPath = null, sourcePath = null } = {}) => {
    try {
      let templatesDir;

      if (devMode) {
        // In dev mode, require devPath to be configured
        if (!devPath) {
          throw new Error('Developer mode is enabled but no Dev Path is configured. Please set a Dev Path in Settings > Skills.');
        }
        // Resolve relative paths from project path
        if (!path.isAbsolute(devPath)) {
          if (projectPath) {
            templatesDir = path.join(projectPath, devPath);
          } else {
            throw new Error('Developer mode with relative path requires a project to be selected.');
          }
        } else {
          templatesDir = devPath;
        }
        console.log('[skill:loadTemplates] Developer mode: Loading from:', templatesDir);
      } else {
        // Normal mode: use cachePath
        if (!cachePath) {
          console.log('[skill:loadTemplates] No cache path configured');
          return [];
        }
        // Resolve relative paths from project path
        let repoPath = cachePath;
        if (!path.isAbsolute(repoPath)) {
          if (projectPath) {
            repoPath = path.join(projectPath, repoPath);
          } else {
            console.log('[skill:loadTemplates] Relative path requires a project');
            return [];
          }
        }
        // Apply sourcePath if provided
        templatesDir = sourcePath ? path.join(repoPath, sourcePath) : repoPath;
        console.log('[skill:loadTemplates] Loading from cache:', templatesDir);
      }

      // Check if directory exists
      try {
        await fs.access(templatesDir);
      } catch {
        console.log('[skill:loadTemplates] Directory not found:', templatesDir);
        if (devMode) {
          throw new Error(`Dev directory not found: ${templatesDir}`);
        }
        return [];
      }

      const entries = await fs.readdir(templatesDir, { withFileTypes: true });
      const skillDirs = entries.filter((entry) => entry.isDirectory());

      console.log('[skill:loadTemplates] Found skill directories:', skillDirs.map(d => d.name));

      const templates = await Promise.all(
        skillDirs.map(async (dir) => {
          const skillPath = path.join(templatesDir, dir.name);
          const skillFilePath = path.join(skillPath, 'SKILL.md');

          try {
            const content = await fs.readFile(skillFilePath, 'utf-8');
            const { frontmatter, instructions } = parseSkillFile(content);

            return {
              id: dir.name,
              name: frontmatter.name || dir.name,
              description: frontmatter.description || '',
              allowedTools: frontmatter['allowed-tools'] || null,
              category: frontmatter.category || 'General',
              tags: frontmatter.tags || [],
              instructions,
              frontmatter,
              skillPath,
            };
          } catch (err) {
            console.error(`[skill:loadTemplates] Failed to read skill ${dir.name}:`, err);
            return null;
          }
        })
      );

      const validTemplates = templates.filter(t => t !== null);
      console.log('[skill:loadTemplates] Loaded templates:', validTemplates.length);
      return validTemplates;
    } catch (err) {
      console.error('[skill:loadTemplates] Failed to load templates:', err);
      throw err;
    }
  });

  // ========== DEVELOPER MODE CRUD OPERATIONS ==========

  // Create new skill template in skills_dev/
  ipcMain.handle('skill:createTemplate', async (event, { skill }) => {
    try {
      const projectRoot = path.join(__dirname, '..', '..');
      const devDir = path.join(projectRoot, 'skills_dev');

      // Generate skill ID from name (sanitize)
      const skillId = skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const skillPath = path.join(devDir, skillId);
      const skillFilePath = path.join(skillPath, 'SKILL.md');

      // Check if skill already exists
      try {
        await fs.access(skillPath);
        throw new Error(`Skill already exists: ${skillId}`);
      } catch (err) {
        // Doesn't exist, continue
        if (err.message.includes('already exists')) throw err;
      }

      // Build frontmatter
      const frontmatter = {
        name: skill.name,
        description: skill.description || '',
        category: skill.category || 'General',
        tags: skill.tags || [],
        'allowed-tools': skill.allowedTools || null,
      };

      // Create skill directory and file
      await fs.mkdir(skillPath, { recursive: true });
      const content = formatSkillFile(frontmatter, skill.instructions || '');
      await fs.writeFile(skillFilePath, content, 'utf-8');

      console.log(`[SkillHandlers] Created template: ${skillFilePath}`);

      return {
        success: true,
        path: skillFilePath,
        skillId,
        message: `Skill template created: ${skillId}`,
      };
    } catch (err) {
      console.error('[skill:createTemplate] Failed:', err);
      throw err;
    }
  });

  // Update existing skill template in skills_dev/
  ipcMain.handle('skill:updateTemplate', async (event, { skillId, skill }) => {
    try {
      const projectRoot = path.join(__dirname, '..', '..');
      const devDir = path.join(projectRoot, 'skills_dev');
      const skillPath = path.join(devDir, skillId);
      const skillFilePath = path.join(skillPath, 'SKILL.md');

      // Check if skill exists
      try {
        await fs.access(skillPath);
      } catch {
        throw new Error(`Skill template not found: ${skillId}`);
      }

      // Build updated frontmatter
      const frontmatter = {
        name: skill.name,
        description: skill.description || '',
        category: skill.category || 'General',
        tags: skill.tags || [],
        'allowed-tools': skill.allowedTools || null,
      };

      // Update file
      const content = formatSkillFile(frontmatter, skill.instructions || '');
      await fs.writeFile(skillFilePath, content, 'utf-8');

      console.log(`[SkillHandlers] Updated template: ${skillFilePath}`);

      return {
        success: true,
        path: skillFilePath,
        message: `Skill template updated: ${skill.name}`,
      };
    } catch (err) {
      console.error('[skill:updateTemplate] Failed:', err);
      throw err;
    }
  });

  // Delete skill template from skills_dev/
  ipcMain.handle('skill:deleteTemplate', async (event, { skillId }) => {
    try {
      const projectRoot = path.join(__dirname, '..', '..');
      const devDir = path.join(projectRoot, 'skills_dev');
      const skillPath = path.join(devDir, skillId);

      // Check if skill exists
      try {
        await fs.access(skillPath);
      } catch {
        throw new Error(`Skill template not found: ${skillId}`);
      }

      // Delete skill directory
      await fs.rm(skillPath, { recursive: true, force: true });

      console.log(`[SkillHandlers] Deleted template: ${skillPath}`);

      return {
        success: true,
        message: `Skill template deleted: ${skillId}`,
      };
    } catch (err) {
      console.error('[skill:deleteTemplate] Failed:', err);
      throw err;
    }
  });
}

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for constitution libraries
let constitutionLibrary = null;
let constitutionLibraryDev = null;

// Default cache path for constitution repository
function getDefaultCachePath() {
  const homeDir = os.homedir();
  return path.join(homeDir, '.teamforge', 'cache', 'constitutions');
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

async function scanConstitutionDirectory(dir, category = null, baseDir = null) {
  const constitutions = [];

  try {
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
        const subConstitutions = await scanConstitutionDirectory(fullPath, subCategory, baseDir);
        constitutions.push(...subConstitutions);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name.toLowerCase() !== 'readme.md') {
        // Skip README.md files, parse constitution files only
        const content = await fs.readFile(fullPath, 'utf-8');
        const { frontmatter, template } = parseFrontmatter(content);

        // Generate ID from relative path to ensure uniqueness
        const relativePath = path.relative(baseDir, fullPath);
        const id = relativePath.replace(/\\/g, '/').replace('.md', '').replace(/\//g, '-');

        // Get file stats for timestamps
        const stats = await fs.stat(fullPath);

        constitutions.push({
          id,
          name: frontmatter.name || entry.name.replace('.md', ''),
          description: frontmatter.description || '',
          content: template,
          targetSystem: frontmatter['target-system'] || frontmatter.targetSystem || undefined,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          category: frontmatter.category || category || 'general',
          createdAt: stats.birthtime.toISOString(),
          updatedAt: stats.mtime.toISOString(),
        });
      }
    }
  } catch (err) {
    console.error('[ConstitutionHandlers] Error scanning directory:', dir, err.message);
  }

  return constitutions;
}

async function loadConstitutionLibrary(forceReload = false, devMode = false, cachePath = null, devPath = null, projectPath = null, sourcePath = null) {
  // Use separate cache for dev mode vs normal mode
  const currentCache = devMode ? constitutionLibraryDev : constitutionLibrary;

  if (!currentCache || forceReload) {
    let templatesDir;
    let source;

    if (devMode) {
      // In dev mode, use the dev path
      let resolvedDevPath = devPath;
      if (!resolvedDevPath) {
        throw new Error('Developer mode is enabled but no Dev Path is configured. Please set a Dev Path in Settings > Constitutions.');
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
      console.log('[ConstitutionHandlers] Developer mode: Loading constitutions from:', templatesDir);
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
        templatesDir = repoPath;
        source = 'cache';
        console.log('[ConstitutionHandlers] Loading constitutions from cache:', templatesDir);
      } catch {
        console.log('[ConstitutionHandlers] Cache not found at:', repoPath);
        // Return empty library
        const emptyLibrary = {
          version: '1.0.0',
          constitutions: [],
          categories: [],
          source: 'none',
          loadedFrom: null,
        };
        if (devMode) {
          constitutionLibraryDev = emptyLibrary;
        } else {
          constitutionLibrary = emptyLibrary;
        }
        return emptyLibrary;
      }
    }

    const constitutions = await scanConstitutionDirectory(templatesDir);

    // Extract unique categories
    const categoriesSet = new Set(constitutions.map((c) => c.category));
    const categories = Array.from(categoriesSet).sort();

    const libraryData = {
      version: '1.0.0',
      constitutions,
      categories,
      source,
      loadedFrom: templatesDir,
    };

    // Save to appropriate cache
    if (devMode) {
      constitutionLibraryDev = libraryData;
    } else {
      constitutionLibrary = libraryData;
    }

    console.log(`[ConstitutionHandlers] Loaded ${constitutions.length} constitutions from ${source} (${templatesDir})`);
  }

  // Return the appropriate cache
  return devMode ? constitutionLibraryDev : constitutionLibrary;
}

export function registerConstitutionHandlers(ipcMain) {
  // Get full constitution library
  ipcMain.handle('constitution:getLibrary', async (event, { devMode = false, cachePath = null, devPath = null, projectPath = null, sourcePath = null } = {}) => {
    console.log('[constitution:getLibrary] Called with devMode:', devMode, 'cachePath:', cachePath, 'projectPath:', projectPath);
    return loadConstitutionLibrary(false, devMode, cachePath, devPath, projectPath, sourcePath);
  });

  // Reload constitution library (force refresh)
  ipcMain.handle('constitution:reload', async (event, { devMode = false, cachePath = null, devPath = null, projectPath = null, sourcePath = null } = {}) => {
    console.log('[constitution:reload] Reloading constitution library');
    return loadConstitutionLibrary(true, devMode, cachePath, devPath, projectPath, sourcePath);
  });

  // Get single constitution by ID
  ipcMain.handle('constitution:getById', async (event, { id, devMode = false, cachePath = null, devPath = null, projectPath = null, sourcePath = null }) => {
    const library = await loadConstitutionLibrary(false, devMode, cachePath, devPath, projectPath, sourcePath);
    return library.constitutions.find((c) => c.id === id) || null;
  });

  // Create new constitution template (dev mode only)
  ipcMain.handle('constitution:createTemplate', async (event, { name, description, content, category, tags, targetSystem, devPath, projectPath }) => {
    if (!devPath) {
      throw new Error('Dev Path is required to create a constitution template');
    }

    // Resolve the dev path
    let resolvedPath = devPath;
    if (!path.isAbsolute(resolvedPath)) {
      if (projectPath) {
        resolvedPath = path.join(projectPath, resolvedPath);
      } else {
        throw new Error('Creating constitution with relative path requires a project to be selected.');
      }
    }

    // Create category folder if needed
    const categoryFolder = path.join(resolvedPath, category || 'general');
    await fs.mkdir(categoryFolder, { recursive: true });

    // Generate filename from name
    const filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.md';
    const filepath = path.join(categoryFolder, filename);

    // Generate frontmatter
    const frontmatter = [
      '---',
      `name: ${name}`,
      `description: ${description || ''}`,
      `category: ${category || 'general'}`,
    ];

    if (targetSystem) {
      frontmatter.push(`target-system: ${targetSystem}`);
    }

    if (tags && tags.length > 0) {
      frontmatter.push(`tags: [${tags.join(', ')}]`);
    }

    frontmatter.push('---', '');

    const fileContent = frontmatter.join('\n') + (content || '');

    await fs.writeFile(filepath, fileContent, 'utf-8');

    console.log('[constitution:createTemplate] Created constitution at:', filepath);

    return { success: true, filePath: filepath };
  });

  // Update constitution template (dev mode only)
  ipcMain.handle('constitution:updateTemplate', async (event, { id, name, description, content, category, tags, targetSystem, devPath, projectPath }) => {
    if (!devPath) {
      throw new Error('Dev Path is required to update a constitution template');
    }

    // Resolve the dev path
    let resolvedPath = devPath;
    if (!path.isAbsolute(resolvedPath)) {
      if (projectPath) {
        resolvedPath = path.join(projectPath, resolvedPath);
      } else {
        throw new Error('Updating constitution with relative path requires a project to be selected.');
      }
    }

    // Find the file by ID
    const idParts = id.split('-');
    const relativePath = idParts.join('/') + '.md';
    const filepath = path.join(resolvedPath, relativePath);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      throw new Error(`Constitution file not found: ${filepath}`);
    }

    // Generate frontmatter
    const frontmatter = [
      '---',
      `name: ${name}`,
      `description: ${description || ''}`,
      `category: ${category || 'general'}`,
    ];

    if (targetSystem) {
      frontmatter.push(`target-system: ${targetSystem}`);
    }

    if (tags && tags.length > 0) {
      frontmatter.push(`tags: [${tags.join(', ')}]`);
    }

    frontmatter.push('---', '');

    const fileContent = frontmatter.join('\n') + (content || '');

    await fs.writeFile(filepath, fileContent, 'utf-8');

    console.log('[constitution:updateTemplate] Updated constitution at:', filepath);

    return { success: true, filePath: filepath };
  });

  // Delete constitution template (dev mode only)
  ipcMain.handle('constitution:deleteTemplate', async (event, { id, devPath, projectPath }) => {
    if (!devPath) {
      throw new Error('Dev Path is required to delete a constitution template');
    }

    // Resolve the dev path
    let resolvedPath = devPath;
    if (!path.isAbsolute(resolvedPath)) {
      if (projectPath) {
        resolvedPath = path.join(projectPath, resolvedPath);
      } else {
        throw new Error('Deleting constitution with relative path requires a project to be selected.');
      }
    }

    // Find the file by ID
    const idParts = id.split('-');
    const relativePath = idParts.join('/') + '.md';
    const filepath = path.join(resolvedPath, relativePath);

    // Delete the file
    await fs.unlink(filepath);

    console.log('[constitution:deleteTemplate] Deleted constitution at:', filepath);

    return { success: true };
  });
}

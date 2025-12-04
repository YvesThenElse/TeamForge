import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import simpleGit from 'simple-git';
import os from 'os';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default local path for agent repository
const getDefaultAgentRepoPath = () => {
  const homeDir = os.homedir();
  return path.join(homeDir, '.teamforge', 'cache', 'agents');
};

// Recursively copy a directory
async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip .git folder and other hidden files
    if (entry.name.startsWith('.')) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Count categories (folders) and files in a directory
async function countRepoStats(repoPath) {
  try {
    const entries = await fs.readdir(repoPath, { withFileTypes: true });

    // Count directories (excluding .git and hidden folders)
    const categories = entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).length;

    // Count all markdown files recursively
    const files = await glob('**/*.md', {
      cwd: repoPath,
      ignore: ['**/node_modules/**', '**/.git/**'],
      nodir: true,
    });

    return {
      categories,
      files: files.length,
    };
  } catch (error) {
    console.error('[AgentRepo] Error counting stats:', error);
    return { categories: 0, files: 0 };
  }
}

export function registerAgentRepositoryHandlers(ipcMain) {
  // Clone or update agent repository (clone to temp, then copy files)
  ipcMain.handle('agentRepo:sync', async (event, { repoUrl, branch = 'main', cachePath, projectPath, sourcePath }) => {
    // Clean up URL - remove trailing slashes
    const cleanRepoUrl = repoUrl?.trim().replace(/\/+$/, '');
    console.log('[AgentRepo] Sync called with:', { repoUrl: cleanRepoUrl, branch, cachePath, projectPath, sourcePath });

    // Create a unique temp folder for cloning
    const tempDir = path.join(os.tmpdir(), `teamforge-sync-${Date.now()}`);

    try {
      // Resolve cache path - if relative, make it absolute from project path
      let localPath = cachePath || getDefaultAgentRepoPath();
      if (localPath && !path.isAbsolute(localPath)) {
        if (projectPath) {
          localPath = path.join(projectPath, localPath);
        } else {
          // Fallback to home directory if no project selected
          localPath = path.join(os.homedir(), localPath);
        }
      }
      console.log('[AgentRepo] Resolved local path:', localPath);

      const git = simpleGit();

      // Step 1: Clone repo to temp folder
      console.log('[AgentRepo] Cloning repository to temp folder:', tempDir);
      await fs.mkdir(tempDir, { recursive: true });
      await git.clone(cleanRepoUrl, tempDir, ['--branch', branch, '--depth', '1']);

      // Step 2: Determine source folder in temp
      let sourceFolder = tempDir;
      if (sourcePath) {
        sourceFolder = path.join(tempDir, sourcePath);
      }

      // Verify source folder exists
      const sourceExists = await fs
        .access(sourceFolder)
        .then(() => true)
        .catch(() => false);

      if (!sourceExists) {
        // List available directories to help the user
        const entries = await fs.readdir(tempDir, { withFileTypes: true });
        const availableDirs = entries
          .filter(e => e.isDirectory() && !e.name.startsWith('.'))
          .map(e => e.name);

        const suggestion = availableDirs.length > 0
          ? `Available directories: ${availableDirs.join(', ')}`
          : 'Repository appears to be empty or contains only files at root level';

        throw new Error(`Source path "${sourcePath}" not found in repository. ${suggestion}`);
      }

      // Step 3: Clear existing cache and copy files
      console.log('[AgentRepo] Clearing existing cache at:', localPath);
      await fs.rm(localPath, { recursive: true, force: true });

      console.log('[AgentRepo] Copying files from', sourceFolder, 'to', localPath);
      await copyDirectory(sourceFolder, localPath);

      // Count stats after sync
      const stats = await countRepoStats(localPath);

      return {
        success: true,
        path: localPath,
        message: `Repository synced successfully (${stats.categories} categories, ${stats.files} files)`,
        timestamp: new Date().toISOString(),
        categories: stats.categories,
        files: stats.files,
      };
    } catch (error) {
      console.error('[AgentRepo] Sync failed:', error);
      throw new Error(`Failed to sync agent repository: ${error.message}`);
    } finally {
      // Step 4: Clean up temp folder
      try {
        console.log('[AgentRepo] Cleaning up temp folder:', tempDir);
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('[AgentRepo] Failed to clean up temp folder:', cleanupError);
      }
    }
  });

  // Get local repository path
  ipcMain.handle('agentRepo:getPath', async () => {
    return getDefaultAgentRepoPath();
  });

  // Check cache status (no longer a git repo, just file cache)
  ipcMain.handle('agentRepo:status', async () => {
    try {
      const localPath = getDefaultAgentRepoPath();

      const exists = await fs
        .access(localPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        return {
          exists: false,
          path: localPath,
          message: 'Cache not synced yet',
        };
      }

      const stats = await countRepoStats(localPath);

      return {
        exists: true,
        path: localPath,
        categories: stats.categories,
        files: stats.files,
        message: `Cache contains ${stats.categories} categories and ${stats.files} files`,
      };
    } catch (error) {
      console.error('[AgentRepo] Status check failed:', error);
      return {
        exists: false,
        error: error.message,
      };
    }
  });

  // Get repository stats for a given path
  ipcMain.handle('agentRepo:stats', async (event, { cachePath, projectPath, sourcePath }) => {
    try {
      // Resolve cache path - if relative, make it absolute from project path
      let localPath = cachePath || getDefaultAgentRepoPath();
      if (localPath && !path.isAbsolute(localPath)) {
        if (projectPath) {
          localPath = path.join(projectPath, localPath);
        } else {
          localPath = path.join(os.homedir(), localPath);
        }
      }

      // Note: sourcePath is only used during sync - the cache already contains
      // the extracted files from sourcePath, so we read stats directly from cache root

      console.log('[AgentRepo] Getting stats for path:', localPath);

      // Check if directory exists
      const exists = await fs
        .access(localPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        return {
          exists: false,
          categories: 0,
          files: 0,
        };
      }

      const stats = await countRepoStats(localPath);
      return {
        exists: true,
        path: localPath,
        categories: stats.categories,
        files: stats.files,
      };
    } catch (error) {
      console.error('[AgentRepo] Stats failed:', error);
      return {
        exists: false,
        categories: 0,
        files: 0,
        error: error.message,
      };
    }
  });

  // Delete local repository
  ipcMain.handle('agentRepo:delete', async (event, { cachePath, projectPath }) => {
    try {
      // Resolve cache path - if relative, make it absolute from project path
      let localPath = cachePath || getDefaultAgentRepoPath();
      if (localPath && !path.isAbsolute(localPath)) {
        if (projectPath) {
          localPath = path.join(projectPath, localPath);
        } else {
          localPath = path.join(os.homedir(), localPath);
        }
      }

      console.log('[AgentRepo] Deleting repository at:', localPath);
      await fs.rm(localPath, { recursive: true, force: true });
      return {
        success: true,
        message: 'Local repository deleted',
        path: localPath,
      };
    } catch (error) {
      throw new Error(`Failed to delete repository: ${error.message}`);
    }
  });
}

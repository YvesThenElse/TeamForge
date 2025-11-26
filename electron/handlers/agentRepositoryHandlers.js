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
  // Clone or update agent repository
  ipcMain.handle('agentRepo:sync', async (event, { repoUrl, branch = 'main', cachePath, projectPath, sourcePath }) => {
    // Clean up URL - remove trailing slashes
    const cleanRepoUrl = repoUrl?.trim().replace(/\/+$/, '');
    console.log('[AgentRepo] Sync called with:', { repoUrl: cleanRepoUrl, branch, cachePath, projectPath });

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

      // Check if directory exists
      const exists = await fs
        .access(localPath)
        .then(() => true)
        .catch(() => false);

      const git = simpleGit();

      if (exists) {
        // Directory exists, try to pull
        console.log('[AgentRepo] Directory exists, pulling latest changes from', cleanRepoUrl);
        const repoGit = simpleGit(localPath);

        // Check if it's a git repo
        const isRepo = await repoGit.checkIsRepo();
        if (!isRepo) {
          // Not a repo, delete and clone fresh
          console.log('[AgentRepo] Not a git repo, cloning fresh');
          await fs.rm(localPath, { recursive: true, force: true });
          await git.clone(cleanRepoUrl, localPath, ['--branch', branch]);
        } else {
          // Pull latest changes
          console.log('[AgentRepo] Pulling from origin', branch);
          await repoGit.fetch();
          await repoGit.checkout(branch);
          await repoGit.pull('origin', branch);
        }
      } else {
        // Directory doesn't exist, clone
        console.log('[AgentRepo] Cloning repository from', cleanRepoUrl, 'to', localPath);
        await fs.mkdir(localPath, { recursive: true });
        await git.clone(cleanRepoUrl, localPath, ['--branch', branch]);
      }

      // Count stats after sync - use sourcePath if provided
      let statsPath = localPath;
      if (sourcePath) {
        statsPath = path.join(localPath, sourcePath);
      }
      const stats = await countRepoStats(statsPath);

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
    }
  });

  // Get local repository path
  ipcMain.handle('agentRepo:getPath', async () => {
    return getDefaultAgentRepoPath();
  });

  // Check repository status
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
          message: 'Repository not cloned yet',
        };
      }

      const git = simpleGit(localPath);
      const isRepo = await git.checkIsRepo();

      if (!isRepo) {
        return {
          exists: true,
          isRepo: false,
          path: localPath,
          message: 'Directory exists but is not a git repository',
        };
      }

      const status = await git.status();
      const remotes = await git.getRemotes(true);

      return {
        exists: true,
        isRepo: true,
        path: localPath,
        branch: status.current,
        ahead: status.ahead,
        behind: status.behind,
        remotes: remotes.map((r) => ({ name: r.name, url: r.refs.fetch })),
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

      // Add source path subdirectory if specified
      if (sourcePath) {
        localPath = path.join(localPath, sourcePath);
      }

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

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import simpleGit from 'simple-git';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default local path for agent repository
const getDefaultAgentRepoPath = () => {
  const homeDir = os.homedir();
  return path.join(homeDir, '.teamforge', 'agent-templates');
};

export function registerAgentRepositoryHandlers(ipcMain) {
  // Clone or update agent repository
  ipcMain.handle('agentRepo:sync', async (event, { repoUrl, branch = 'main' }) => {
    try {
      const localPath = getDefaultAgentRepoPath();

      // Check if directory exists
      const exists = await fs
        .access(localPath)
        .then(() => true)
        .catch(() => false);

      const git = simpleGit();

      if (exists) {
        // Directory exists, try to pull
        console.log('[AgentRepo] Pulling latest changes from', repoUrl);
        const repoGit = simpleGit(localPath);

        // Check if it's a git repo
        const isRepo = await repoGit.checkIsRepo();
        if (!isRepo) {
          // Not a repo, delete and clone fresh
          await fs.rm(localPath, { recursive: true, force: true });
          await git.clone(repoUrl, localPath, ['--branch', branch]);
        } else {
          // Pull latest changes
          await repoGit.fetch();
          await repoGit.checkout(branch);
          await repoGit.pull('origin', branch);
        }
      } else {
        // Directory doesn't exist, clone
        console.log('[AgentRepo] Cloning repository from', repoUrl);
        await fs.mkdir(localPath, { recursive: true });
        await git.clone(repoUrl, localPath, ['--branch', branch]);
      }

      return {
        success: true,
        path: localPath,
        message: 'Agent repository synced successfully',
        timestamp: new Date().toISOString(),
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

  // Delete local repository
  ipcMain.handle('agentRepo:delete', async () => {
    try {
      const localPath = getDefaultAgentRepoPath();
      await fs.rm(localPath, { recursive: true, force: true });
      return {
        success: true,
        message: 'Local repository deleted',
      };
    } catch (error) {
      throw new Error(`Failed to delete repository: ${error.message}`);
    }
  });
}

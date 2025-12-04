import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

export function registerGitHandlers(ipcMain) {
  // Check if directory is a git repository (read-only)
  ipcMain.handle('git:isRepo', async (event, { path: repoPath }) => {
    try {
      const gitDir = path.join(repoPath, '.git');
      await fs.access(gitDir);
      return true;
    } catch {
      return false;
    }
  });

  // Get repository status (read-only)
  ipcMain.handle('git:status', async (event, { path: repoPath }) => {
    try {
      const git = simpleGit(repoPath);
      const status = await git.status();

      // Collect all changed files
      const changedFiles = [
        ...status.modified.map(f => `Modified: ${f}`),
        ...status.created.map(f => `Created: ${f}`),
        ...status.deleted.map(f => `Deleted: ${f}`),
        ...status.renamed.map(r => `Renamed: ${r.from} -> ${r.to}`),
        ...status.not_added.map(f => `Untracked: ${f}`),
      ];

      return changedFiles;
    } catch (error) {
      throw new Error(`Failed to get repository status: ${error.message}`);
    }
  });
}

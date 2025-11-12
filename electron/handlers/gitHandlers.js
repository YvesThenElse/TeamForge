import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

export function registerGitHandlers(ipcMain) {
  // Clone repository
  ipcMain.handle('git:clone', async (event, { url, path: repoPath }) => {
    try {
      const git = simpleGit();
      await git.clone(url, repoPath);
      return `Successfully cloned repository to ${repoPath}`;
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  });

  // Check if directory is a git repository
  ipcMain.handle('git:isRepo', async (event, { path: repoPath }) => {
    try {
      const gitDir = path.join(repoPath, '.git');
      await fs.access(gitDir);
      return true;
    } catch {
      return false;
    }
  });

  // Get repository status
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

  // Create git commit
  ipcMain.handle(
    'git:commit',
    async (event, { path: repoPath, message, files }) => {
      try {
        const git = simpleGit(repoPath);

        // Add specified files
        if (files && files.length > 0) {
          await git.add(files);
        } else {
          // Add all changes if no files specified
          await git.add('.');
        }

        // Create commit
        const result = await git.commit(message);

        return result.commit;
      } catch (error) {
        throw new Error(`Failed to create commit: ${error.message}`);
      }
    }
  );
}

use anyhow::{Context, Result};
use git2::Repository;
use std::path::Path;

pub struct GitService;

impl GitService {
    pub fn new() -> Self {
        GitService
    }

    /// Clone a repository from URL to a local path
    pub fn clone_repository(&self, url: &str, path: &Path) -> Result<Repository> {
        Repository::clone(url, path)
            .with_context(|| format!("Failed to clone repository from {} to {:?}", url, path))
    }

    /// Open an existing repository
    pub fn open_repository(&self, path: &Path) -> Result<Repository> {
        Repository::open(path)
            .with_context(|| format!("Failed to open repository at {:?}", path))
    }

    /// Check if a directory is a git repository
    pub fn is_repository(&self, path: &Path) -> bool {
        Repository::open(path).is_ok()
    }

    /// Create a commit with the given message
    pub fn create_commit(
        &self,
        repo: &Repository,
        message: &str,
        files: &[&str],
    ) -> Result<git2::Oid> {
        let mut index = repo.index()?;

        // Add files to index
        for file in files {
            index.add_path(Path::new(file))?;
        }
        index.write()?;

        let tree_id = index.write_tree()?;
        let tree = repo.find_tree(tree_id)?;

        let signature = repo.signature()?;
        let parent_commit = repo.head()?.peel_to_commit()?;

        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            &[&parent_commit],
        )
        .with_context(|| "Failed to create commit")
    }

    /// Get repository status
    pub fn get_status(&self, repo: &Repository) -> Result<Vec<String>> {
        let statuses = repo.statuses(None)?;
        let mut files = Vec::new();

        for entry in statuses.iter() {
            if let Some(path) = entry.path() {
                files.push(path.to_string());
            }
        }

        Ok(files)
    }
}

impl Default for GitService {
    fn default() -> Self {
        Self::new()
    }
}

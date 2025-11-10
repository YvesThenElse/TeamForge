use crate::services::GitService;
use std::path::PathBuf;

#[tauri::command]
pub fn clone_repo(url: String, path: String) -> Result<String, String> {
    let git_service = GitService::new();
    let path_buf = PathBuf::from(&path);

    git_service
        .clone_repository(&url, &path_buf)
        .map(|_| format!("Successfully cloned repository to {}", path))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn is_git_repo(path: String) -> Result<bool, String> {
    let git_service = GitService::new();
    let path_buf = PathBuf::from(&path);

    Ok(git_service.is_repository(&path_buf))
}

#[tauri::command]
pub fn get_repo_status(path: String) -> Result<Vec<String>, String> {
    let git_service = GitService::new();
    let path_buf = PathBuf::from(&path);

    let repo = git_service
        .open_repository(&path_buf)
        .map_err(|e| e.to_string())?;

    git_service.get_status(&repo).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_git_commit(
    path: String,
    message: String,
    files: Vec<String>,
) -> Result<String, String> {
    let git_service = GitService::new();
    let path_buf = PathBuf::from(&path);

    let repo = git_service
        .open_repository(&path_buf)
        .map_err(|e| e.to_string())?;

    let file_refs: Vec<&str> = files.iter().map(|s| s.as_str()).collect();

    git_service
        .create_commit(&repo, &message, &file_refs)
        .map(|oid| oid.to_string())
        .map_err(|e| e.to_string())
}

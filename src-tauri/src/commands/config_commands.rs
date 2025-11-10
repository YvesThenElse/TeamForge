use crate::models::TeamForgeConfig;
use crate::services::ConfigService;
use std::path::PathBuf;

#[tauri::command]
pub fn load_teamforge_config(project_path: String) -> Result<TeamForgeConfig, String> {
    let config_service = ConfigService::new();
    let path_buf = PathBuf::from(&project_path);

    config_service
        .load_config(&path_buf)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_teamforge_config(
    config: TeamForgeConfig,
    project_path: String,
) -> Result<String, String> {
    let config_service = ConfigService::new();
    let path_buf = PathBuf::from(&project_path);

    config_service
        .save_config(&config, &path_buf)
        .map(|_| "Config saved successfully".to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_default_teamforge_config(
    project_name: String,
    project_type: String,
    project_path: String,
    detected_technologies: Vec<String>,
) -> Result<TeamForgeConfig, String> {
    let config_service = ConfigService::new();

    Ok(config_service.create_default_config(
        &project_name,
        &project_type,
        &project_path,
        detected_technologies,
    ))
}

#[tauri::command]
pub fn validate_teamforge_config(config: TeamForgeConfig) -> Result<Vec<String>, String> {
    let config_service = ConfigService::new();

    config_service
        .validate_config(&config)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn teamforge_exists(project_path: String) -> Result<bool, String> {
    let config_service = ConfigService::new();
    let path_buf = PathBuf::from(&project_path);

    Ok(config_service.teamforge_exists(&path_buf))
}

#[tauri::command]
pub fn initialize_teamforge(project_path: String) -> Result<String, String> {
    let config_service = ConfigService::new();
    let path_buf = PathBuf::from(&project_path);

    config_service
        .initialize_teamforge(&path_buf)
        .map(|_| "TeamForge initialized successfully".to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn ensure_claude_agents_dir(project_path: String) -> Result<String, String> {
    let config_service = ConfigService::new();
    let path_buf = PathBuf::from(&project_path);

    config_service
        .ensure_claude_agents_dir(&path_buf)
        .map(|_| ".claude/agents/ directory created".to_string())
        .map_err(|e| e.to_string())
}

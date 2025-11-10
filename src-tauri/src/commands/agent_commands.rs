use crate::embedded::AgentTemplate;
use crate::services::AgentService;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentLibraryResponse {
    pub version: String,
    pub agents: Vec<AgentTemplate>,
    pub categories: Vec<String>,
}

#[tauri::command]
pub fn get_agent_library() -> Result<AgentLibraryResponse, String> {
    let agent_service = AgentService::new();

    let library = agent_service
        .get_embedded_library()
        .map_err(|e| e.to_string())?;

    Ok(AgentLibraryResponse {
        version: library.version,
        agents: library.agents,
        categories: library.categories,
    })
}

#[tauri::command]
pub fn get_agents_by_category(category: String) -> Result<Vec<AgentTemplate>, String> {
    let agent_service = AgentService::new();

    agent_service
        .get_agents_by_category(&category)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn search_agents(keyword: String) -> Result<Vec<AgentTemplate>, String> {
    let agent_service = AgentService::new();

    agent_service
        .search_agents(&keyword)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_agent_by_id(id: String) -> Result<Option<AgentTemplate>, String> {
    let agent_service = AgentService::new();

    agent_service
        .get_agent_by_id(&id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn generate_agent_file(
    agent_id: String,
    custom_instructions: Option<String>,
) -> Result<String, String> {
    let agent_service = AgentService::new();

    let agent = agent_service
        .get_agent_by_id(&agent_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Agent not found: {}", agent_id))?;

    Ok(agent_service.generate_agent_file(&agent, custom_instructions.as_deref()))
}

#[tauri::command]
pub fn save_agent_file(
    agent_content: String,
    file_path: String,
) -> Result<String, String> {
    let agent_service = AgentService::new();
    let path_buf = PathBuf::from(&file_path);

    agent_service
        .save_agent_to_file(&agent_content, &path_buf)
        .map(|_| format!("Agent saved to {}", file_path))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_suggested_agents(technologies: Vec<String>) -> Result<Vec<AgentTemplate>, String> {
    let agent_service = AgentService::new();

    agent_service
        .get_suggested_agents_for_technologies(&technologies)
        .map_err(|e| e.to_string())
}

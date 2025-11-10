use serde::{Deserialize, Serialize};

// Agent model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub description: String,
    pub tags: Vec<String>,
    pub category: String,
    pub template: String,
    pub suggested_for: Vec<String>,
}

// Project model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub name: String,
    pub path: String,
    pub project_type: ProjectType,
    pub detected_technologies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProjectType {
    WebFullstack,
    BackendApi,
    Frontend,
    Mobile,
    Desktop,
    Library,
    Unknown,
}

// Config model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamForgeConfig {
    pub version: String,
    pub project: ProjectInfo,
    pub active_agents: Vec<String>,
    pub customizations: std::collections::HashMap<String, serde_json::Value>,
    pub last_analyzed: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectInfo {
    pub name: String,
    pub project_type: String,
    pub path: String,
    pub detected_technologies: Vec<String>,
}

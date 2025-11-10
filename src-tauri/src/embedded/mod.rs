use serde::{Deserialize, Serialize};
use anyhow::Result;

pub const AGENT_LIBRARY_JSON: &str = include_str!("agents/library.json");

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentLibrary {
    pub version: String,
    pub agents: Vec<AgentTemplate>,
    pub categories: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub tags: Vec<String>,
    pub category: String,
    pub template: String,
    pub suggested_for: Vec<String>,
}

pub fn load_embedded_library() -> Result<AgentLibrary> {
    serde_json::from_str(AGENT_LIBRARY_JSON).map_err(Into::into)
}

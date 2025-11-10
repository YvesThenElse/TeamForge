use crate::models::TeamForgeConfig;
use anyhow::{Context, Result};
use std::fs;
use std::path::Path;

pub struct ConfigService;

impl ConfigService {
    pub fn new() -> Self {
        ConfigService
    }

    /// Load TeamForge config from .teamforge/config.json
    pub fn load_config(&self, project_path: &Path) -> Result<TeamForgeConfig> {
        let config_path = project_path.join(".teamforge").join("config.json");

        let content = fs::read_to_string(&config_path)
            .with_context(|| format!("Failed to read config at {:?}", config_path))?;

        serde_json::from_str(&content)
            .with_context(|| "Failed to parse TeamForge config")
    }

    /// Save TeamForge config to .teamforge/config.json
    pub fn save_config(&self, config: &TeamForgeConfig, project_path: &Path) -> Result<()> {
        let teamforge_dir = project_path.join(".teamforge");

        // Create .teamforge directory if it doesn't exist
        if !teamforge_dir.exists() {
            fs::create_dir_all(&teamforge_dir)?;
        }

        let config_path = teamforge_dir.join("config.json");
        let content = serde_json::to_string_pretty(config)?;

        fs::write(&config_path, content)
            .with_context(|| format!("Failed to write config to {:?}", config_path))
    }

    /// Create default TeamForge config
    pub fn create_default_config(
        &self,
        project_name: &str,
        project_type: &str,
        project_path: &str,
        detected_technologies: Vec<String>,
    ) -> TeamForgeConfig {
        use chrono::Utc;
        use std::collections::HashMap;

        TeamForgeConfig {
            version: "1.0.0".to_string(),
            project: crate::models::ProjectInfo {
                name: project_name.to_string(),
                project_type: project_type.to_string(),
                path: project_path.to_string(),
                detected_technologies,
            },
            active_agents: Vec::new(),
            customizations: HashMap::new(),
            last_analyzed: Utc::now().to_rfc3339(),
        }
    }

    /// Validate TeamForge config
    pub fn validate_config(&self, config: &TeamForgeConfig) -> Result<Vec<String>> {
        let mut warnings = Vec::new();

        // Check version
        if config.version.is_empty() {
            warnings.push("Config version is empty".to_string());
        }

        // Check project info
        if config.project.name.is_empty() {
            warnings.push("Project name is empty".to_string());
        }

        if config.project.path.is_empty() {
            warnings.push("Project path is empty".to_string());
        }

        // Check active agents
        if config.active_agents.is_empty() {
            warnings.push("No active agents configured".to_string());
        }

        Ok(warnings)
    }

    /// Check if .teamforge directory exists
    pub fn teamforge_exists(&self, project_path: &Path) -> bool {
        project_path.join(".teamforge").join("config.json").exists()
    }

    /// Initialize .teamforge structure
    pub fn initialize_teamforge(&self, project_path: &Path) -> Result<()> {
        let teamforge_dir = project_path.join(".teamforge");
        let presets_dir = teamforge_dir.join("presets");

        // Create directories
        fs::create_dir_all(&presets_dir)?;

        // Create empty analysis.json
        let analysis_path = teamforge_dir.join("analysis.json");
        if !analysis_path.exists() {
            fs::write(analysis_path, "{}")?;
        }

        Ok(())
    }

    /// Generate .claude/agents/ directory structure
    pub fn ensure_claude_agents_dir(&self, project_path: &Path) -> Result<()> {
        let claude_agents_dir = project_path.join(".claude").join("agents");
        fs::create_dir_all(&claude_agents_dir)?;
        Ok(())
    }
}

impl Default for ConfigService {
    fn default() -> Self {
        Self::new()
    }
}

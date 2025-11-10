use crate::embedded::{load_embedded_library, AgentLibrary, AgentTemplate};
use anyhow::Result;
use std::fs;
use std::path::Path;

pub struct AgentService;

impl AgentService {
    pub fn new() -> Self {
        AgentService
    }

    /// Load the embedded agent library
    pub fn get_embedded_library(&self) -> Result<AgentLibrary> {
        load_embedded_library()
    }

    /// Get agents by category
    pub fn get_agents_by_category(&self, category: &str) -> Result<Vec<AgentTemplate>> {
        let library = self.get_embedded_library()?;
        Ok(library
            .agents
            .into_iter()
            .filter(|agent| agent.category == category)
            .collect())
    }

    /// Get agent by ID
    pub fn get_agent_by_id(&self, id: &str) -> Result<Option<AgentTemplate>> {
        let library = self.get_embedded_library()?;
        Ok(library.agents.into_iter().find(|agent| agent.id == id))
    }

    /// Search agents by keyword
    pub fn search_agents(&self, keyword: &str) -> Result<Vec<AgentTemplate>> {
        let library = self.get_embedded_library()?;
        let keyword_lower = keyword.to_lowercase();

        Ok(library
            .agents
            .into_iter()
            .filter(|agent| {
                agent.name.to_lowercase().contains(&keyword_lower)
                    || agent.description.to_lowercase().contains(&keyword_lower)
                    || agent.tags.iter().any(|tag| tag.to_lowercase().contains(&keyword_lower))
            })
            .collect())
    }

    /// Generate Claude Code agent markdown file
    pub fn generate_agent_file(
        &self,
        agent: &AgentTemplate,
        custom_instructions: Option<&str>,
    ) -> String {
        let mut frontmatter = format!(
            "---\nname: {}\ndescription: {}\ntags: [{}]\n",
            agent.name,
            agent.description,
            agent.tags.join(", ")
        );

        // Add optional fields if needed
        frontmatter.push_str("---\n\n");

        // Add template content
        let mut content = agent.template.clone();

        // Add custom instructions if provided
        if let Some(instructions) = custom_instructions {
            content.push_str("\n\n## Custom Instructions\n\n");
            content.push_str(instructions);
        }

        format!("{}{}", frontmatter, content)
    }

    /// Save agent to file
    pub fn save_agent_to_file(
        &self,
        agent_content: &str,
        file_path: &Path,
    ) -> Result<()> {
        fs::write(file_path, agent_content)?;
        Ok(())
    }

    /// Get suggested agents for technologies
    pub fn get_suggested_agents_for_technologies(
        &self,
        technologies: &[String],
    ) -> Result<Vec<AgentTemplate>> {
        let library = self.get_embedded_library()?;

        Ok(library
            .agents
            .into_iter()
            .filter(|agent| {
                agent.suggested_for.iter().any(|tech| {
                    technologies.iter().any(|t| {
                        t.to_lowercase().contains(&tech.to_lowercase())
                            || tech.to_lowercase().contains(&t.to_lowercase())
                    })
                })
            })
            .collect())
    }
}

impl Default for AgentService {
    fn default() -> Self {
        Self::new()
    }
}

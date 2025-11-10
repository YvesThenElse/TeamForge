use crate::models::{ProjectType};
use anyhow::Result;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

use super::parser_service::ParserService;

pub struct AnalyzerService {
    parser: ParserService,
}

impl AnalyzerService {
    pub fn new() -> Self {
        AnalyzerService {
            parser: ParserService::new(),
        }
    }

    /// Analyze a project and detect its type and technologies
    pub fn analyze_project(&self, path: &Path) -> Result<ProjectAnalysis> {
        let mut technologies = Vec::new();
        let mut file_counts: HashMap<String, usize> = HashMap::new();
        let mut total_files = 0;

        // Check for common manifest files
        if path.join("package.json").exists() {
            if let Ok(techs) = self.parser.parse_package_json(&path.join("package.json")) {
                technologies.extend(techs);
            }
        }

        if path.join("requirements.txt").exists() {
            if let Ok(techs) = self.parser.parse_requirements_txt(&path.join("requirements.txt")) {
                technologies.extend(techs);
            }
        }

        if path.join("Cargo.toml").exists() {
            if let Ok(techs) = self.parser.parse_cargo_toml(&path.join("Cargo.toml")) {
                technologies.extend(techs);
            }
        }

        if path.join("go.mod").exists() {
            if let Ok(techs) = self.parser.parse_go_mod(&path.join("go.mod")) {
                technologies.extend(techs);
            }
        }

        // Count file types (limited depth to avoid performance issues)
        for entry in WalkDir::new(path)
            .max_depth(5)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
        {
            total_files += 1;
            if let Some(ext) = entry.path().extension() {
                let ext_str = ext.to_string_lossy().to_string();
                *file_counts.entry(ext_str).or_insert(0) += 1;
            }
        }

        // Detect project type
        let project_type = self.detect_project_type(&technologies, &file_counts);

        // Suggest agents based on project type and technologies
        let suggested_agents = self.suggest_agents(&project_type, &technologies);

        // Deduplicate technologies
        technologies.sort();
        technologies.dedup();

        Ok(ProjectAnalysis {
            project_type,
            detected_technologies: technologies,
            file_counts,
            total_files,
            suggested_agents,
        })
    }

    /// Detect project type based on technologies and files
    fn detect_project_type(
        &self,
        technologies: &[String],
        file_counts: &HashMap<String, usize>,
    ) -> ProjectType {
        let has_frontend = technologies.iter().any(|t| {
            matches!(
                t.as_str(),
                "react" | "vue" | "angular" | "svelte" | "next" | "nuxt"
            )
        });

        let has_backend = technologies.iter().any(|t| {
            matches!(
                t.as_str(),
                "express" | "fastify" | "koa" | "nestjs" | "django" | "flask" | "fastapi" | "actix" | "rocket"
            )
        });

        let has_mobile = technologies.iter().any(|t| {
            matches!(t.as_str(), "react-native" | "flutter")
        }) || file_counts.contains_key("swift")
            || file_counts.contains_key("kotlin");

        let has_desktop = technologies.contains(&"tauri".to_string())
            || technologies.contains(&"electron".to_string());

        match (has_frontend, has_backend, has_mobile, has_desktop) {
            (true, true, _, _) => ProjectType::WebFullstack,
            (_, true, false, false) => ProjectType::BackendApi,
            (true, false, false, false) => ProjectType::Frontend,
            (_, _, true, _) => ProjectType::Mobile,
            (_, _, _, true) => ProjectType::Desktop,
            _ => {
                // Check if it's a library (has no main application files)
                if file_counts.values().sum::<usize>() < 10 {
                    ProjectType::Library
                } else {
                    ProjectType::Unknown
                }
            }
        }
    }

    /// Suggest agents based on project characteristics
    fn suggest_agents(&self, project_type: &ProjectType, technologies: &[String]) -> Vec<String> {
        let mut agents = Vec::new();

        // Core agents for all projects
        agents.extend_from_slice(&["code-reviewer", "test-engineer"]);

        // Type-specific agents
        match project_type {
            ProjectType::WebFullstack => {
                agents.extend_from_slice(&[
                    "fullstack-developer",
                    "api-designer",
                    "frontend-developer",
                    "backend-developer",
                ]);
            }
            ProjectType::BackendApi => {
                agents.extend_from_slice(&["backend-developer", "api-designer", "database-designer"]);
            }
            ProjectType::Frontend => {
                agents.extend_from_slice(&["frontend-developer", "ux-designer"]);
            }
            ProjectType::Mobile => {
                agents.extend_from_slice(&["mobile-developer", "ux-designer"]);
            }
            ProjectType::Desktop => {
                agents.extend_from_slice(&["frontend-developer", "backend-developer"]);
            }
            ProjectType::Library => {
                agents.extend_from_slice(&["tech-writer", "api-documenter"]);
            }
            ProjectType::Unknown => {
                agents.push("fullstack-developer");
            }
        }

        // Technology-specific agents
        if technologies.iter().any(|t| t.contains("docker")) {
            agents.push("docker-specialist");
        }

        if technologies.iter().any(|t| matches!(t.as_str(), "postgres" | "mysql" | "mongodb")) {
            agents.push("database-designer");
        }

        if technologies.iter().any(|t| matches!(t.as_str(), "jest" | "vitest" | "pytest" | "cypress" | "playwright")) {
            agents.push("e2e-tester");
        }

        // Deduplicate
        agents.sort();
        agents.dedup();

        agents.iter().map(|s| s.to_string()).collect()
    }
}

impl Default for AnalyzerService {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct ProjectAnalysis {
    pub project_type: ProjectType,
    pub detected_technologies: Vec<String>,
    pub file_counts: HashMap<String, usize>,
    pub total_files: usize,
    pub suggested_agents: Vec<String>,
}

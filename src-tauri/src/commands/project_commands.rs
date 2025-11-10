use crate::services::AnalyzerService;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectAnalysisResult {
    pub project_type: String,
    pub detected_technologies: Vec<String>,
    pub file_counts: HashMap<String, usize>,
    pub total_files: usize,
    pub suggested_agents: Vec<String>,
}

#[tauri::command]
pub fn analyze_project(path: String) -> Result<ProjectAnalysisResult, String> {
    let analyzer = AnalyzerService::new();
    let path_buf = PathBuf::from(&path);

    let analysis = analyzer
        .analyze_project(&path_buf)
        .map_err(|e| e.to_string())?;

    Ok(ProjectAnalysisResult {
        project_type: format!("{:?}", analysis.project_type),
        detected_technologies: analysis.detected_technologies,
        file_counts: analysis.file_counts,
        total_files: analysis.total_files,
        suggested_agents: analysis.suggested_agents,
    })
}

use anyhow::{Context, Result};
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

pub struct ParserService;

impl ParserService {
    pub fn new() -> Self {
        ParserService
    }

    /// Parse package.json and extract technologies
    pub fn parse_package_json(&self, path: &Path) -> Result<Vec<String>> {
        let content = fs::read_to_string(path)
            .with_context(|| format!("Failed to read package.json at {:?}", path))?;

        let package: Value = serde_json::from_str(&content)?;
        let mut technologies = Vec::new();

        // Extract dependencies
        if let Some(deps) = package.get("dependencies").and_then(|v| v.as_object()) {
            technologies.extend(self.extract_frameworks_from_deps(deps));
        }

        // Extract devDependencies
        if let Some(dev_deps) = package.get("devDependencies").and_then(|v| v.as_object()) {
            technologies.extend(self.extract_frameworks_from_deps(dev_deps));
        }

        // Detect main technology
        if let Some(scripts) = package.get("scripts").and_then(|v| v.as_object()) {
            if scripts.contains_key("dev") || scripts.contains_key("start") {
                technologies.push("node".to_string());
            }
        }

        Ok(technologies)
    }

    /// Extract frameworks from dependencies
    fn extract_frameworks_from_deps(&self, deps: &serde_json::Map<String, Value>) -> Vec<String> {
        let mut frameworks = Vec::new();

        let framework_map: HashMap<&str, &str> = [
            ("react", "react"),
            ("vue", "vue"),
            ("angular", "angular"),
            ("svelte", "svelte"),
            ("next", "next"),
            ("nuxt", "nuxt"),
            ("express", "express"),
            ("fastify", "fastify"),
            ("koa", "koa"),
            ("nest", "nestjs"),
            ("@nestjs/core", "nestjs"),
            ("typescript", "typescript"),
            ("vite", "vite"),
            ("webpack", "webpack"),
            ("jest", "jest"),
            ("vitest", "vitest"),
            ("cypress", "cypress"),
            ("playwright", "playwright"),
        ]
        .iter()
        .cloned()
        .collect();

        for (dep_name, _) in deps {
            if let Some(framework) = framework_map.get(dep_name.as_str()) {
                if !frameworks.contains(&framework.to_string()) {
                    frameworks.push(framework.to_string());
                }
            }
        }

        frameworks
    }

    /// Parse requirements.txt and extract Python frameworks
    pub fn parse_requirements_txt(&self, path: &Path) -> Result<Vec<String>> {
        let content = fs::read_to_string(path)
            .with_context(|| format!("Failed to read requirements.txt at {:?}", path))?;

        let mut technologies = vec!["python".to_string()];

        let framework_keywords = [
            ("django", "django"),
            ("flask", "flask"),
            ("fastapi", "fastapi"),
            ("tornado", "tornado"),
            ("pyramid", "pyramid"),
            ("pandas", "pandas"),
            ("numpy", "numpy"),
            ("tensorflow", "tensorflow"),
            ("pytorch", "pytorch"),
            ("scikit-learn", "sklearn"),
        ];

        for line in content.lines() {
            let package = line.split("==").next().unwrap_or("").trim().to_lowercase();
            for (keyword, framework) in &framework_keywords {
                if package.contains(keyword) {
                    technologies.push(framework.to_string());
                }
            }
        }

        Ok(technologies)
    }

    /// Parse Cargo.toml and extract Rust frameworks
    pub fn parse_cargo_toml(&self, path: &Path) -> Result<Vec<String>> {
        let content = fs::read_to_string(path)
            .with_context(|| format!("Failed to read Cargo.toml at {:?}", path))?;

        let cargo: toml::Value = toml::from_str(&content)?;
        let mut technologies = vec!["rust".to_string()];

        if let Some(deps) = cargo.get("dependencies").and_then(|v| v.as_table()) {
            let framework_keywords = [
                ("actix-web", "actix"),
                ("rocket", "rocket"),
                ("axum", "axum"),
                ("warp", "warp"),
                ("tokio", "tokio"),
                ("async-std", "async-std"),
                ("tauri", "tauri"),
            ];

            for (keyword, framework) in &framework_keywords {
                if deps.contains_key(*keyword) {
                    technologies.push(framework.to_string());
                }
            }
        }

        Ok(technologies)
    }

    /// Parse go.mod and extract Go frameworks
    pub fn parse_go_mod(&self, path: &Path) -> Result<Vec<String>> {
        let content = fs::read_to_string(path)
            .with_context(|| format!("Failed to read go.mod at {:?}", path))?;

        let mut technologies = vec!["go".to_string()];

        let framework_keywords = [
            ("gin-gonic/gin", "gin"),
            ("gofiber/fiber", "fiber"),
            ("labstack/echo", "echo"),
            ("gorilla/mux", "gorilla"),
        ];

        for line in content.lines() {
            for (keyword, framework) in &framework_keywords {
                if line.contains(keyword) {
                    technologies.push(framework.to_string());
                }
            }
        }

        Ok(technologies)
    }
}

impl Default for ParserService {
    fn default() -> Self {
        Self::new()
    }
}

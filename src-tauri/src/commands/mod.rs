// Tauri commands - exposed to frontend

mod agent_commands;
mod config_commands;
mod git_commands;
mod project_commands;

// Re-export all commands
pub use agent_commands::*;
pub use config_commands::*;
pub use git_commands::*;
pub use project_commands::*;

// Simple greeting command for testing
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to TeamForge!", name)
}

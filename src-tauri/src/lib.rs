// Modules
mod commands;
mod embedded;
mod models;
mod services;
mod utils;

// Re-exports
pub use commands::*;
pub use embedded::*;
pub use models::*;
pub use services::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            // Git commands
            commands::clone_repo,
            commands::is_git_repo,
            commands::get_repo_status,
            commands::create_git_commit,
            // Project commands
            commands::analyze_project,
            // Agent commands
            commands::get_agent_library,
            commands::get_agents_by_category,
            commands::search_agents,
            commands::get_agent_by_id,
            commands::generate_agent_file,
            commands::save_agent_file,
            commands::get_suggested_agents,
            // Config commands
            commands::load_teamforge_config,
            commands::save_teamforge_config,
            commands::create_default_teamforge_config,
            commands::validate_teamforge_config,
            commands::teamforge_exists,
            commands::initialize_teamforge,
            commands::ensure_claude_agents_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

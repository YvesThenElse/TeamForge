// Services - Business logic layer

pub mod agent_service;
pub mod analyzer_service;
pub mod config_service;
pub mod git_service;
pub mod parser_service;

// Re-exports for convenience
pub use agent_service::AgentService;
pub use analyzer_service::{AnalyzerService, ProjectAnalysis};
pub use config_service::ConfigService;
pub use git_service::GitService;
pub use parser_service::ParserService;

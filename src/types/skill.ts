// Skill types

export interface Skill {
  id: string; // Directory name
  name: string; // From frontmatter
  description: string; // From frontmatter
  allowedTools: string | null; // From frontmatter['allowed-tools']
  instructions: string; // Main content after frontmatter
  frontmatter: SkillFrontmatter;
  skillPath: string; // Full path to skill directory
  error?: boolean; // True if there was an error loading the skill
}

export interface SkillFrontmatter {
  name: string; // Required: lowercase letters, numbers, hyphens only (max 64 chars)
  description: string; // Required: brief description (max 1024 chars)
  'allowed-tools'?: string; // Optional: comma-separated list of allowed tools
}

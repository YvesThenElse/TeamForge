// Utility for managing recent projects in localStorage

const RECENT_PROJECTS_KEY = "teamforge_recent_projects";
const MAX_RECENT_PROJECTS = 5;

export interface RecentProject {
  path: string;
  name: string;
  lastOpened: string;
  projectType?: string;
}

export function getRecentProjects(): RecentProject[] {
  try {
    const stored = localStorage.getItem(RECENT_PROJECTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (err) {
    console.error("Failed to load recent projects:", err);
    return [];
  }
}

export function addRecentProject(project: RecentProject): void {
  try {
    const recent = getRecentProjects();

    // Remove if already exists
    const filtered = recent.filter(p => p.path !== project.path);

    // Add to the beginning
    const updated = [project, ...filtered].slice(0, MAX_RECENT_PROJECTS);

    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save recent project:", err);
  }
}

export function removeRecentProject(path: string): void {
  try {
    const recent = getRecentProjects();
    const filtered = recent.filter(p => p.path !== path);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to remove recent project:", err);
  }
}

export function clearRecentProjects(): void {
  try {
    localStorage.removeItem(RECENT_PROJECTS_KEY);
  } catch (err) {
    console.error("Failed to clear recent projects:", err);
  }
}

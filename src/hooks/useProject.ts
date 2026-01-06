import { useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";
import { addRecentProject, updateRecentProjectTimestamp, getRecentProjects } from "@/lib/recentProjects";

export function useProject() {
  const {
    currentProject,
    projectPath,
    analysis,
    isAnalyzing,
    error,
    setProjectPath,
    setAnalysis,
    setIsAnalyzing,
    setError,
    clearProject,
  } = useProjectStore();

  const selectProjectFolder = useCallback(async () => {
    try {
      console.log("[useProject] Calling electron.selectFolder()...");
      const selected = await electron.selectFolder();
      console.log("[useProject] Selected folder:", selected);

      if (selected) {
        setProjectPath(selected);
        // Automatically analyze the selected project
        setIsAnalyzing(true);
        try {
          const result = await electron.analyzeProject(selected);
          setAnalysis(result);

          // Add to recent projects
          const projectName = selected.split(/[\\/]/).filter(Boolean).pop() || selected;
          addRecentProject({
            path: selected,
            name: projectName,
            lastOpened: new Date().toISOString(),
            projectType: result.projectType,
          });
        } catch (analysisErr) {
          console.error("Failed to analyze project:", analysisErr);
          // Still keep the project path even if analysis fails
        } finally {
          setIsAnalyzing(false);
        }
        return selected;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select folder");
      return null;
    }
  }, [setProjectPath, setError, setIsAnalyzing, setAnalysis]);

  const analyzeProjectFolder = useCallback(
    async (path: string) => {
      setIsAnalyzing(true);
      setError(null);
      setProjectPath(path);

      try {
        const result = await electron.analyzeProject(path);
        setAnalysis(result);

        // Check if project is already in recent projects
        const recentProjects = getRecentProjects();
        const existsInRecent = recentProjects.some(p => p.path === path);

        if (existsInRecent) {
          // Just update timestamp without changing order
          updateRecentProjectTimestamp(path);
        } else {
          // Add as new recent project
          const projectName = path.split(/[\\/]/).filter(Boolean).pop() || path;
          addRecentProject({
            path: path,
            name: projectName,
            lastOpened: new Date().toISOString(),
            projectType: result.projectType,
          });
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Analysis failed";
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setAnalysis, setIsAnalyzing, setError, setProjectPath]
  );

  const checkIfGitRepo = useCallback(
    async (path: string) => {
      try {
        return await electron.isGitRepo(path);
      } catch (err) {
        console.error("Failed to check git repo:", err);
        return false;
      }
    },
    []
  );

  return {
    // State
    currentProject,
    projectPath,
    analysis,
    isAnalyzing,
    error,

    // Actions
    selectProjectFolder,
    analyzeProjectFolder,
    checkIfGitRepo,
    clearProject,
  };
}

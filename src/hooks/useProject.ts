import { useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";

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
      const selected = await electron.selectFolder();

      if (selected) {
        setProjectPath(selected);
        return selected;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select folder");
      return null;
    }
  }, [setProjectPath, setError]);

  const analyzeProjectFolder = useCallback(
    async (path: string) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await electron.analyzeProject(path);
        setAnalysis(result);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Analysis failed";
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setAnalysis, setIsAnalyzing, setError]
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

  const cloneRepository = useCallback(
    async (url: string, targetPath: string) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await electron.cloneRepo(url, targetPath);
        setProjectPath(targetPath);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Clone failed";
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setProjectPath, setIsAnalyzing, setError]
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
    cloneRepository,
    clearProject,
  };
}

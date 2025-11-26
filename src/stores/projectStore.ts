import { create } from "zustand";
import { Project, ProjectAnalysis } from "@/types";

interface ProjectState {
  currentProject: Project | null;
  projectPath: string | null;
  analysis: ProjectAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;

  // Actions
  setCurrentProject: (project: Project | null) => void;
  setProjectPath: (path: string | null) => void;
  setAnalysis: (analysis: ProjectAnalysis | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
  currentProject: null,
  projectPath: null,
  analysis: null,
  isAnalyzing: false,
  error: null,

  setCurrentProject: (project) => set({ currentProject: project }),
  setProjectPath: (path) => set({ projectPath: path }),
  setAnalysis: (analysis) => set({ analysis }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error }),
  clearProject: () =>
    set({
      currentProject: null,
      projectPath: null,
      analysis: null,
      isAnalyzing: false,
      error: null,
    }),
}));

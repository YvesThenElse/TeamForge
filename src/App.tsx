import { useEffect } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { useSettingsStore } from "./stores/settingsStore";
import { useAgentStore } from "./stores/agentStore";
import { useProjectStore } from "./stores/projectStore";
import * as electron from "./services/electron";

function App() {
  const {
    autoSync,
    agentRepoUrl,
    agentRepoBranch,
    agentCachePath,
    agentDevPath,
    agentSourcePath,
    developerMode,
    isLoaded,
    loadSettings,
    setAgentLastSync
  } = useSettingsStore();
  const { setLibrary, setCategories } = useAgentStore();
  const { projectPath } = useProjectStore();

  // Load settings when project changes
  useEffect(() => {
    if (projectPath) {
      console.log("[App] Project selected, loading settings...");
      loadSettings(projectPath);
    }
  }, [projectPath, loadSettings]);

  // Load agent library when project changes and settings are loaded
  useEffect(() => {
    const loadAgentLibrary = async () => {
      if (!projectPath || !isLoaded) {
        console.log("[App] No project selected or settings not loaded, skipping agent library load");
        return;
      }
      console.log("[App] Loading agent library... developerMode:", developerMode, "cachePath:", agentCachePath, "sourcePath:", agentSourcePath, "projectPath:", projectPath);
      try {
        const result = await electron.getAgentLibrary(developerMode, agentCachePath, agentDevPath, projectPath, agentSourcePath);
        setLibrary(result.agents);
        setCategories(result.categories as any);
        console.log("[App] Agent library loaded:", result.agents.length, "agents from", result.source);
      } catch (error) {
        console.error("[App] Failed to load agent library:", error);
      }
    };

    loadAgentLibrary();
  }, [setLibrary, setCategories, developerMode, agentCachePath, agentDevPath, agentSourcePath, projectPath, isLoaded]);

  // Auto-sync on startup if enabled and project is selected
  useEffect(() => {
    const performAutoSync = async () => {
      if (autoSync && agentRepoUrl && !developerMode && projectPath && isLoaded) {
        console.log("[App] Auto-sync enabled, syncing agent repository...");
        try {
          const result = await electron.syncAgentRepository(agentRepoUrl, agentRepoBranch, agentCachePath, projectPath);
          if (result.success) {
            setAgentLastSync(result.timestamp);
            console.log("[App] Auto-sync completed:", result.message);
            // Reload agent library after sync
            const libraryResult = await electron.getAgentLibrary(false, agentCachePath, undefined, projectPath, agentSourcePath);
            setLibrary(libraryResult.agents);
            setCategories(libraryResult.categories as any);
          }
        } catch (error) {
          console.error("[App] Auto-sync failed:", error);
          // Silent fail - don't block app startup
        }
      }
    };

    performAutoSync();
  }, [projectPath, isLoaded]); // Run when project changes and settings are loaded

  return <MainLayout />;
}

export default App;

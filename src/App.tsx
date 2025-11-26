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
    developerMode,
    setAgentLastSync
  } = useSettingsStore();
  const { setLibrary, setCategories } = useAgentStore();
  const { projectPath } = useProjectStore();

  // Load agent library when project changes
  useEffect(() => {
    const loadAgentLibrary = async () => {
      if (!projectPath) {
        console.log("[App] No project selected, skipping agent library load");
        return;
      }
      console.log("[App] Loading agent library... developerMode:", developerMode, "cachePath:", agentCachePath, "projectPath:", projectPath);
      try {
        const result = await electron.getAgentLibrary(developerMode, agentCachePath, agentDevPath, projectPath);
        setLibrary(result.agents);
        setCategories(result.categories as any);
        console.log("[App] Agent library loaded:", result.agents.length, "agents from", result.source);
      } catch (error) {
        console.error("[App] Failed to load agent library:", error);
      }
    };

    loadAgentLibrary();
  }, [setLibrary, setCategories, developerMode, agentCachePath, agentDevPath, projectPath]);

  // Auto-sync on startup if enabled and project is selected
  useEffect(() => {
    const performAutoSync = async () => {
      if (autoSync && agentRepoUrl && !developerMode && projectPath) {
        console.log("[App] Auto-sync enabled, syncing agent repository...");
        try {
          const result = await electron.syncAgentRepository(agentRepoUrl, agentRepoBranch, agentCachePath, projectPath);
          if (result.success) {
            setAgentLastSync(result.timestamp);
            console.log("[App] Auto-sync completed:", result.message);
            // Reload agent library after sync
            const libraryResult = await electron.getAgentLibrary(false, agentCachePath, undefined, projectPath);
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
  }, [projectPath]); // Run when project changes

  return <MainLayout />;
}

export default App;

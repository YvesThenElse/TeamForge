import { useEffect } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { useSettingsStore } from "./stores/settingsStore";
import { useAgentStore } from "./stores/agentStore";
import * as electron from "./services/electron";

function App() {
  const { autoSync, agentRepositoryUrl, agentRepositoryBranch, setLastSync } = useSettingsStore();
  const { setLibrary, setCategories } = useAgentStore();

  // Load agent library on startup
  useEffect(() => {
    const loadAgentLibrary = async () => {
      console.log("[App] Loading agent library...");
      try {
        const result = await electron.getAgentLibrary();
        setLibrary(result.agents);
        setCategories(result.categories as any);
        console.log("[App] Agent library loaded:", result.agents.length, "agents");
      } catch (error) {
        console.error("[App] Failed to load agent library:", error);
      }
    };

    loadAgentLibrary();
  }, [setLibrary, setCategories]);

  // Auto-sync on startup if enabled
  useEffect(() => {
    const performAutoSync = async () => {
      if (autoSync && agentRepositoryUrl) {
        console.log("[App] Auto-sync enabled, syncing agent repository...");
        try {
          const result = await electron.syncAgentRepository(agentRepositoryUrl, agentRepositoryBranch);
          if (result.success) {
            setLastSync(result.timestamp);
            console.log("[App] Auto-sync completed:", result.message);
            // Reload agent library after sync
            const libraryResult = await electron.getAgentLibrary();
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
  }, []); // Run once on mount

  return <MainLayout />;
}

export default App;

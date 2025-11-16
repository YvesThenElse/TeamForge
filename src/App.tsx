import { useEffect } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { useSettingsStore } from "./stores/settingsStore";
import * as electron from "./services/electron";

function App() {
  const { autoSync, agentRepositoryUrl, agentRepositoryBranch, setLastSync } = useSettingsStore();

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

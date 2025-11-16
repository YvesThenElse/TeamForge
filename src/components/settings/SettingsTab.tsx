import { useState, useEffect } from "react";
import { Settings, GitBranch, RefreshCw, Download, Trash2, CheckCircle, AlertCircle, FolderGit, Cpu, Palette, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSettingsStore } from "@/stores/settingsStore";
import * as electron from "@/services/electron";
import { useAgentStore } from "@/stores/agentStore";

export function SettingsTab() {
  const {
    agentRepositoryUrl,
    agentRepositoryBranch,
    lastSync,
    autoSync,
    defaultModel,
    defaultTools,
    theme,
    confirmDeploy,
    setAgentRepositoryUrl,
    setAgentRepositoryBranch,
    setLastSync,
    setAutoSync,
    setDefaultModel,
    setDefaultTools,
    setTheme,
    setConfirmDeploy,
  } = useSettingsStore();
  const { setLibrary, setIsLoading } = useAgentStore();

  const [localUrl, setLocalUrl] = useState(agentRepositoryUrl);
  const [localBranch, setLocalBranch] = useState(agentRepositoryBranch);
  const [repoStatus, setRepoStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    loadRepositoryStatus();
  }, []);

  const loadRepositoryStatus = async () => {
    try {
      const status = await electron.getAgentRepositoryStatus();
      setRepoStatus(status);
    } catch (error) {
      console.error("Failed to load repository status:", error);
    }
  };

  const handleSyncRepository = async () => {
    setIsSyncing(true);
    setSyncMessage("");

    try {
      const result = await electron.syncAgentRepository(localUrl, localBranch);
      setAgentRepositoryUrl(localUrl);
      setAgentRepositoryBranch(localBranch);
      setLastSync(result.timestamp);
      setSyncMessage(result.message);

      // Reload repository status
      await loadRepositoryStatus();

      // Auto-reload agents after sync
      await handleReloadAgents();
    } catch (error: any) {
      setSyncMessage(`Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReloadAgents = async () => {
    setIsReloading(true);

    try {
      const result = await electron.reloadAgents();

      // Reload the agent library
      setIsLoading(true);
      const library = await electron.getAgentLibrary();
      setLibrary(library.agents);
      setIsLoading(false);

      setSyncMessage(`Reloaded ${result.agentCount} agents from ${result.source} source`);
    } catch (error: any) {
      setSyncMessage(`Error reloading agents: ${error.message}`);
    } finally {
      setIsReloading(false);
    }
  };

  const handleDeleteRepository = async () => {
    if (!confirm("Are you sure you want to delete the local agent repository? You will need to sync again.")) {
      return;
    }

    try {
      await electron.deleteAgentRepository();
      await loadRepositoryStatus();
      setSyncMessage("Local repository deleted");
    } catch (error: any) {
      setSyncMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configuration
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure agent repository and application settings
        </p>
      </div>

      {/* Repository Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Agent Repository
          </CardTitle>
          <CardDescription>
            Configure the Git repository where agent templates are stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Repository URL</label>
            <Input
              type="url"
              placeholder="https://github.com/user/repo.git"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Branch</label>
            <Input
              type="text"
              placeholder="main"
              value={localBranch}
              onChange={(e) => setLocalBranch(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSyncRepository}
              disabled={isSyncing || !localUrl}
              className="flex-1"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Sync Repository
                </>
              )}
            </Button>

            <Button
              onClick={handleReloadAgents}
              disabled={isReloading}
              variant="outline"
            >
              {isReloading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Reloading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Agents
                </>
              )}
            </Button>

            {repoStatus?.exists && (
              <Button
                onClick={handleDeleteRepository}
                variant="destructive"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {syncMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              syncMessage.startsWith('Error')
                ? 'bg-red-500/10 text-red-600'
                : 'bg-green-500/10 text-green-600'
            }`}>
              {syncMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repository Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderGit className="h-5 w-5" />
            Repository Status
          </CardTitle>
          <CardDescription>
            Current status of the local agent repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          {repoStatus ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Local Repository</span>
                <div className="flex items-center gap-2">
                  {repoStatus.exists ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Exists</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">Not Found</span>
                    </>
                  )}
                </div>
              </div>

              {repoStatus.exists && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Path</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {repoStatus.path}
                    </span>
                  </div>

                  {repoStatus.isRepo && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Branch</span>
                        <span className="text-sm">{repoStatus.branch}</span>
                      </div>

                      {repoStatus.remotes && repoStatus.remotes.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Remote</span>
                          <span className="text-sm text-muted-foreground font-mono truncate max-w-md">
                            {repoStatus.remotes[0].url}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Sync</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(lastSync).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Loading repository status...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Default Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Default Agent Configuration
          </CardTitle>
          <CardDescription>
            Default settings for newly created agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Default Model</label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value as "sonnet" | "opus" | "haiku")}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="sonnet">Sonnet (Balanced - Recommended)</option>
              <option value="opus">Opus (Most Capable)</option>
              <option value="haiku">Haiku (Fastest)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Choose the default Claude model for agents
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Default Tools</label>
            <Input
              type="text"
              placeholder="*"
              value={defaultTools}
              onChange={(e) => setDefaultTools(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default tools available to agents. Use "*" for all tools, or specify: ["Read", "Write", "Bash"]
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Application Settings
          </CardTitle>
          <CardDescription>
            General application preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Choose your preferred color theme
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Auto-Sync on Startup</label>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically sync agent repository when app starts
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Confirm Before Deploy</label>
              <p className="text-xs text-muted-foreground mt-1">
                Ask for confirmation before deploying agents or teams
              </p>
            </div>
            <input
              type="checkbox"
              checked={confirmDeploy}
              onChange={(e) => setConfirmDeploy(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

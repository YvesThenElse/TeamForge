import { useState, useEffect, useCallback } from "react";
import { GitBranch, RefreshCw, Download, Trash2, FolderOpen, Folder, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";

export function SkillsSettingsTab() {
  const {
    skillRepoUrl,
    skillRepoBranch,
    skillSourcePath,
    skillDevPath,
    skillCachePath,
    setSkillRepoUrl,
    setSkillRepoBranch,
    setSkillSourcePath,
    setSkillDevPath,
    setSkillCachePath,
    setSkillLastSync,
  } = useSettingsStore();
  const { projectPath } = useProjectStore();

  const [localUrl, setLocalUrl] = useState(skillRepoUrl);
  const [localBranch, setLocalBranch] = useState(skillRepoBranch);
  const [localSourcePath, setLocalSourcePath] = useState(skillSourcePath);
  const [localDevPath, setLocalDevPath] = useState(skillDevPath);
  const [localCachePath, setLocalCachePath] = useState(skillCachePath);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [repoStats, setRepoStats] = useState<{ categories: number; files: number } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const loadStats = useCallback(async () => {
    if (!localCachePath) return;

    setIsLoadingStats(true);
    try {
      const stats = await electron.getAgentRepositoryStats(localCachePath, projectPath || undefined, localSourcePath || undefined);
      if (stats.exists) {
        setRepoStats({ categories: stats.categories, files: stats.files });
      } else {
        setRepoStats(null);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [projectPath, localCachePath, localSourcePath]);

  // Load stats on mount and when dependencies change
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSyncRepository = async () => {
    if (!projectPath) {
      setSyncMessage("Error: Please select a project first");
      return;
    }

    if (!localUrl) {
      setSyncMessage("Error: Repository URL is required");
      return;
    }

    setIsSyncing(true);
    setSyncMessage("");

    try {
      setSkillCachePath(localCachePath);
      setSkillSourcePath(localSourcePath);
      const result = await electron.syncAgentRepository(localUrl, localBranch, localCachePath, projectPath, localSourcePath);
      setSkillRepoUrl(localUrl);
      setSkillRepoBranch(localBranch);
      setSkillLastSync(result.timestamp);
      setSyncMessage(result.message);
      if (result.categories !== undefined && result.files !== undefined) {
        setRepoStats({ categories: result.categories, files: result.files });
      }
    } catch (error: any) {
      setSyncMessage(`Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteRepository = async () => {
    if (!confirm("Are you sure you want to delete the local skill repository? You will need to sync again.")) {
      return;
    }

    try {
      await electron.deleteAgentRepository(localCachePath, projectPath || undefined);
      setSkillLastSync(null);
      setRepoStats(null);
      setSyncMessage("Local repository deleted");
    } catch (error: any) {
      setSyncMessage(`Error: ${error.message}`);
    }
  };

  const handleSaveSettings = () => {
    setSkillDevPath(localDevPath);
    setSyncMessage("Settings saved");
    setTimeout(() => setSyncMessage(""), 3000);
  };

  const handleSelectDevPath = async () => {
    try {
      const path = await electron.selectFolder();
      if (path) {
        setLocalDevPath(path);
      }
    } catch (error) {
      console.error("Failed to select folder:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Git Repository */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Skills Repository
          </CardTitle>
          <CardDescription>
            Git repository where skill templates are stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Repository URL</label>
            <Input
              type="url"
              placeholder="https://github.com/user/skills-repo.git"
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

          <div>
            <label className="text-sm font-medium">Source Path</label>
            <Input
              type="text"
              placeholder="e.g., skills (leave empty for repo root)"
              value={localSourcePath}
              onChange={(e) => setLocalSourcePath(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Subdirectory in the repository where skill templates are located
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Cache Path</label>
            <Input
              type="text"
              placeholder=".teamforge/cache/skills"
              value={localCachePath}
              onChange={(e) => setLocalCachePath(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Local directory where the repository will be cached
            </p>
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
              onClick={handleDeleteRepository}
              variant="destructive"
              size="icon"
              title="Delete local repository"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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

          {/* Repository Stats */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">{repoStats?.categories ?? 0}</span>
                  <span className="text-muted-foreground ml-1">categories</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">{repoStats?.files ?? 0}</span>
                  <span className="text-muted-foreground ml-1">skills</span>
                </span>
              </div>
              {!projectPath && !localCachePath.startsWith('/') && !localCachePath.includes(':') && (
                <span className="text-xs text-amber-500">Select a project to see stats</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadStats}
              disabled={isLoadingStats}
              title="Refresh stats"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dev Mode Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Developer Mode
          </CardTitle>
          <CardDescription>
            Local directory for developing and testing skill templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Dev Path</label>
            <div className="flex gap-2 mt-1">
              <Input
                type="text"
                placeholder="Path to local skill templates"
                value={localDevPath}
                onChange={(e) => setLocalDevPath(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSelectDevPath}>
                Browse
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              When Developer Mode is enabled, skills will be loaded from this directory
            </p>
          </div>

          <Button onClick={handleSaveSettings} variant="outline">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { GitBranch, RefreshCw, Download, Trash2, FolderOpen, Folder, FileText, ExternalLink, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";

export function ConstitutionSettingsTab() {
  const {
    constitutionRepoUrl,
    constitutionRepoBranch,
    constitutionSourcePath,
    constitutionDevPath,
    constitutionCachePath,
    setConstitutionRepoUrl,
    setConstitutionRepoBranch,
    setConstitutionSourcePath,
    setConstitutionDevPath,
    setConstitutionCachePath,
    setConstitutionLastSync,
    saveSettings,
  } = useSettingsStore();
  const { projectPath } = useProjectStore();

  const [localUrl, setLocalUrl] = useState(constitutionRepoUrl);
  const [localBranch, setLocalBranch] = useState(constitutionRepoBranch);
  const [localSourcePath, setLocalSourcePath] = useState(constitutionSourcePath);
  const [localDevPath, setLocalDevPath] = useState(constitutionDevPath);
  const [localCachePath, setLocalCachePath] = useState(constitutionCachePath);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [repoStats, setRepoStats] = useState<{ categories: number; files: number } | null>(null);

  const loadStats = useCallback(async () => {
    if (!localCachePath) return;

    try {
      const stats = await electron.getAgentRepositoryStats(localCachePath, projectPath || undefined, localSourcePath || undefined);
      if (stats.exists) {
        setRepoStats({ categories: stats.categories, files: stats.files });
      } else {
        setRepoStats(null);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
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
      setConstitutionCachePath(localCachePath);
      setConstitutionSourcePath(localSourcePath);
      const result = await electron.syncAgentRepository(localUrl, localBranch, localCachePath, projectPath, localSourcePath);
      setConstitutionRepoUrl(localUrl);
      setConstitutionRepoBranch(localBranch);
      setConstitutionLastSync(result.timestamp);
      setSyncMessage(result.message);
      if (result.categories !== undefined && result.files !== undefined) {
        setRepoStats({ categories: result.categories, files: result.files });
      }

      // Save settings to file
      if (projectPath) {
        await saveSettings(projectPath);
      }
    } catch (error: any) {
      setSyncMessage(`Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteRepository = async () => {
    if (!confirm("Are you sure you want to delete the local constitution repository? You will need to sync again.")) {
      return;
    }

    try {
      await electron.deleteAgentRepository(localCachePath, projectPath || undefined);
      setConstitutionLastSync(null);
      setRepoStats(null);
      setSyncMessage("Local repository deleted");
    } catch (error: any) {
      setSyncMessage(`Error: ${error.message}`);
    }
  };

  const handleSaveSettings = async () => {
    setConstitutionDevPath(localDevPath);
    if (projectPath) {
      await saveSettings(projectPath);
    }
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

  // Compute the full path for display
  const fullCachePath = useMemo(() => {
    if (!localCachePath) return null;
    if (localCachePath.includes(':') || localCachePath.startsWith('/')) {
      // Absolute path
      return localSourcePath ? `${localCachePath}/${localSourcePath}` : localCachePath;
    }
    // Relative path - needs project
    if (projectPath) {
      return localSourcePath
        ? `${projectPath}/${localCachePath}/${localSourcePath}`.replace(/\\/g, '/')
        : `${projectPath}/${localCachePath}`.replace(/\\/g, '/');
    }
    return null;
  }, [localCachePath, localSourcePath, projectPath]);

  const handleOpenFolder = async () => {
    if (fullCachePath) {
      try {
        await electron.openFolder(fullCachePath.replace(/\//g, '\\'));
      } catch (error) {
        console.error("Failed to open folder:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-emerald-500" />
            Constitutions
          </h2>
          <p className="text-sm text-muted-foreground">
            {repoStats ? (
              <>
                {repoStats.files} constitutions in {repoStats.categories} categories
                {fullCachePath && <span className="ml-1">from <code className="text-xs bg-muted px-1 rounded">{fullCachePath}</code></span>}
              </>
            ) : (
              "No repository synced"
            )}
          </p>
        </div>
        {fullCachePath && repoStats && (
          <Button variant="outline" size="sm" onClick={handleOpenFolder}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Folder
          </Button>
        )}
      </div>

      {/* Git Repository */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Constitution Repository
          </CardTitle>
          <CardDescription>
            Git repository where constitution templates are stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Repository URL</label>
            <Input
              type="url"
              placeholder="https://github.com/user/constitutions.git"
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
              placeholder="e.g., constitutions (leave empty for repo root)"
              value={localSourcePath}
              onChange={(e) => setLocalSourcePath(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Subdirectory in the repository where constitution templates are located
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Cache Path</label>
            <Input
              type="text"
              placeholder=".teamforge/cache/constitutions"
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
          <div className="flex items-center p-3 rounded-lg bg-muted/50">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">{repoStats?.categories ?? 0}</span>
                  <span className="text-muted-foreground ml-1">categories</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">{repoStats?.files ?? 0}</span>
                  <span className="text-muted-foreground ml-1">constitutions</span>
                </span>
              </div>
              {!projectPath && !localCachePath.startsWith('/') && !localCachePath.includes(':') && (
                <span className="text-xs text-amber-500">Select a project to see stats</span>
              )}
            </div>
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
            Local directory for developing and testing constitution templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Dev Path</label>
            <div className="flex gap-2 mt-1">
              <Input
                type="text"
                placeholder="Path to local constitution templates"
                value={localDevPath}
                onChange={(e) => setLocalDevPath(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSelectDevPath}>
                Browse
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              When Developer Mode is enabled, constitutions will be loaded from this directory
            </p>
          </div>

          <Button onClick={handleSaveSettings} variant="outline">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Info Card about Constitution format */}
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <FileText className="h-5 w-5" />
            Constitution Template Format
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Each constitution template should be a Markdown file with YAML frontmatter:
          </p>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`---
name: Code Review Guidelines
description: Standards for reviewing code
category: coding-style
tags: [review, quality, standards]
target-system: claude-code
---

# Code Review Guidelines

When reviewing code, follow these principles:

1. **Readability**: Code should be self-documenting
2. **Performance**: Avoid unnecessary operations
3. **Security**: Check for common vulnerabilities
...`}
          </pre>
          <p className="text-xs text-muted-foreground mt-3">
            Categories: <code className="bg-muted px-1 rounded">general</code>,
            <code className="bg-muted px-1 rounded ml-1">coding-style</code>,
            <code className="bg-muted px-1 rounded ml-1">workflow</code>,
            <code className="bg-muted px-1 rounded ml-1">security</code>,
            <code className="bg-muted px-1 rounded ml-1">project</code>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Target systems: <code className="bg-muted px-1 rounded">claude-code</code>,
            <code className="bg-muted px-1 rounded ml-1">gemini-cli</code>,
            <code className="bg-muted px-1 rounded ml-1">cline</code> (or omit for universal)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

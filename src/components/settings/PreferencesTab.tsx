import { Palette, Cpu, FileCode, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSettingsStore } from "@/stores/settingsStore";

export function PreferencesTab() {
  const {
    autoSync,
    theme,
    confirmDeploy,
    claudeSettingsFile,
    developerMode,
    defaultModel,
    defaultTools,
    setAutoSync,
    setTheme,
    setConfirmDeploy,
    setClaudeSettingsFile,
    setDeveloperMode,
    setDefaultModel,
    setDefaultTools,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Application
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
              <label className="text-sm font-medium">Developer Mode</label>
              <p className="text-xs text-muted-foreground mt-1">
                Load templates from local dev paths instead of git repos
              </p>
            </div>
            <input
              type="checkbox"
              checked={developerMode}
              onChange={(e) => setDeveloperMode(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Synchronization
          </CardTitle>
          <CardDescription>
            Configure automatic synchronization behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Auto-Sync on Startup</label>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically sync repositories when app starts
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
                Ask for confirmation before deploying agents, skills, or teams
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

      {/* Claude Settings File */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Claude Settings File
          </CardTitle>
          <CardDescription>
            Choose which file to use for Claude Code settings and hooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Settings File Name</label>
            <select
              value={claudeSettingsFile}
              onChange={(e) => setClaudeSettingsFile(e.target.value as "settings.json" | "settings.local.json")}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="settings.json">settings.json (tracked in git)</option>
              <option value="settings.local.json">settings.local.json (git-ignored, recommended)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              settings.local.json is typically git-ignored and won't be committed to your repository.
              This is recommended for local configurations like hooks and personal settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

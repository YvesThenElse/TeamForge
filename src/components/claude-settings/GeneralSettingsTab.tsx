import { useState, useEffect } from "react";
import { Save, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProjectStore } from "@/stores/projectStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { ClaudeSettings } from "@/types/claudeSettings";
import * as electron from "@/services/electron";

export function GeneralSettingsTab() {
  const { projectPath } = useProjectStore();
  const { claudeSettingsFile } = useSettingsStore();
  const [settings, setSettings] = useState<ClaudeSettings>({});
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [model, setModel] = useState("");
  const [cleanupPeriodDays, setCleanupPeriodDays] = useState<number>(30);
  const [includeCoAuthoredBy, setIncludeCoAuthoredBy] = useState(true);
  const [disableAllHooks, setDisableAllHooks] = useState(false);
  const [outputStyle, setOutputStyle] = useState("");

  useEffect(() => {
    if (projectPath) {
      loadSettings();
    }
  }, [projectPath]);

  const loadSettings = async () => {
    if (!projectPath) return;

    setLoading(true);
    try {
      const result = await electron.loadClaudeSettings(projectPath, claudeSettingsFile);
      setSettings(result.settings);

      // Load general settings
      setModel(result.settings.model || "");
      setCleanupPeriodDays(result.settings.cleanupPeriodDays || 30);
      setIncludeCoAuthoredBy(result.settings.includeCoAuthoredBy !== false);
      setDisableAllHooks(result.settings.disableAllHooks || false);
      setOutputStyle(result.settings.outputStyle || "");
    } catch (error) {
      console.error("Failed to load settings:", error);
      setSaveMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectPath) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updatedSettings: ClaudeSettings = {
        ...settings,
        model: model || undefined,
        cleanupPeriodDays: cleanupPeriodDays !== 30 ? cleanupPeriodDays : undefined,
        includeCoAuthoredBy: !includeCoAuthoredBy ? false : undefined,
        disableAllHooks: disableAllHooks ? true : undefined,
        outputStyle: outputStyle || undefined,
      };

      await electron.saveClaudeSettings(projectPath, updatedSettings, claudeSettingsFile);
      setSettings(updatedSettings);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      setSaveMessage({ type: 'error', text: `Failed to save: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">General Settings</h3>
          <p className="text-sm text-muted-foreground">
            Core Claude Code configuration options
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          saveMessage.type === 'success'
            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
            : 'bg-red-500/10 text-red-600 border border-red-500/20'
        }`}>
          {saveMessage.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Model Override */}
      <Card>
        <CardHeader>
          <CardTitle>Model Override</CardTitle>
          <CardDescription>
            Override the default Claude model for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Model</label>
            <Input
              type="text"
              placeholder="e.g., claude-sonnet-4-5-20250929 (leave empty for default)"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Specify a specific Claude model version, or leave empty to use the default
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup & Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Cleanup & Retention</CardTitle>
          <CardDescription>
            Configure how long chat transcripts are retained
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Cleanup Period (Days)</label>
            <Input
              type="number"
              min="1"
              max="365"
              value={cleanupPeriodDays}
              onChange={(e) => setCleanupPeriodDays(parseInt(e.target.value) || 30)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Chat transcripts older than this many days will be automatically deleted (default: 30)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Git Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Git Integration</CardTitle>
          <CardDescription>
            Configure how Claude interacts with git
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Include Co-Authored-By</label>
              <p className="text-xs text-muted-foreground mt-1">
                Add "Co-Authored-By: Claude" to git commits made by Claude
              </p>
            </div>
            <input
              type="checkbox"
              checked={includeCoAuthoredBy}
              onChange={(e) => setIncludeCoAuthoredBy(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hooks */}
      <Card>
        <CardHeader>
          <CardTitle>Hooks</CardTitle>
          <CardDescription>
            Global hooks configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Disable All Hooks</label>
              <p className="text-xs text-muted-foreground mt-1">
                Globally disable all hooks for this project
              </p>
            </div>
            <input
              type="checkbox"
              checked={disableAllHooks}
              onChange={(e) => setDisableAllHooks(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Output Style */}
      <Card>
        <CardHeader>
          <CardTitle>Output Style</CardTitle>
          <CardDescription>
            Configure how Claude formats its output
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Output Style</label>
            <Input
              type="text"
              placeholder="e.g., concise, verbose, technical (leave empty for default)"
              value={outputStyle}
              onChange={(e) => setOutputStyle(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Adjust the system prompt to change Claude's output style
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

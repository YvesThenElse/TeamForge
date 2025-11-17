import { useState, useEffect } from "react";
import { Save, Plus, Trash2, CheckCircle, AlertCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProjectStore } from "@/stores/projectStore";
import type { ClaudeSettings } from "@/types/claudeSettings";
import * as electron from "@/services/electron";

export function AdvancedSettingsTab() {
  const { projectPath } = useProjectStore();
  const [settings, setSettings] = useState<ClaudeSettings>({});
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sandbox settings
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const [autoAllowBashIfSandboxed, setAutoAllowBashIfSandboxed] = useState(true);
  const [allowUnsandboxedCommands, setAllowUnsandboxedCommands] = useState(true);

  // Environment variables
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  // Advanced settings
  const [apiKeyHelper, setApiKeyHelper] = useState("");
  const [forceLoginMethod, setForceLoginMethod] = useState<"" | "claudeai" | "console">("");

  useEffect(() => {
    if (projectPath) {
      loadSettings();
    }
  }, [projectPath]);

  const loadSettings = async () => {
    if (!projectPath) return;

    setLoading(true);
    try {
      const result = await electron.loadClaudeSettings(projectPath);
      setSettings(result.settings);

      // Sandbox settings
      setSandboxEnabled(result.settings.sandbox?.enabled || false);
      setAutoAllowBashIfSandboxed(result.settings.sandbox?.autoAllowBashIfSandboxed !== false);
      setAllowUnsandboxedCommands(result.settings.sandbox?.allowUnsandboxedCommands !== false);

      // Environment variables
      setEnvVars(result.settings.env || {});

      // Advanced
      setApiKeyHelper(result.settings.apiKeyHelper || "");
      setForceLoginMethod(result.settings.forceLoginMethod || "");
    } catch (error) {
      console.error("Failed to load settings:", error);
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
        sandbox: sandboxEnabled || !autoAllowBashIfSandboxed || !allowUnsandboxedCommands
          ? {
              enabled: sandboxEnabled ? true : undefined,
              autoAllowBashIfSandboxed: !autoAllowBashIfSandboxed ? false : undefined,
              allowUnsandboxedCommands: !allowUnsandboxedCommands ? false : undefined,
            }
          : undefined,
        env: Object.keys(envVars).length > 0 ? envVars : undefined,
        apiKeyHelper: apiKeyHelper || undefined,
        forceLoginMethod: forceLoginMethod || undefined,
      };

      await electron.saveClaudeSettings(projectPath, updatedSettings);
      setSettings(updatedSettings);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: `Failed to save: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const addEnvVar = () => {
    setEnvVars({ ...envVars, "": "" });
  };

  const updateEnvVarKey = (oldKey: string, newKey: string) => {
    const updated = { ...envVars };
    const value = updated[oldKey];
    delete updated[oldKey];
    updated[newKey] = value;
    setEnvVars(updated);
  };

  const updateEnvVarValue = (key: string, value: string) => {
    setEnvVars({ ...envVars, [key]: value });
  };

  const removeEnvVar = (key: string) => {
    const updated = { ...envVars };
    delete updated[key];
    setEnvVars(updated);
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
          <h3 className="text-lg font-semibold">Advanced Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Advanced settings for power users
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

      {/* Sandbox Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Bash Sandbox (macOS/Linux only)
          </CardTitle>
          <CardDescription>
            Run bash commands in an isolated sandbox environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Enable Sandbox</label>
              <p className="text-xs text-muted-foreground mt-1">
                Execute bash commands in a sandboxed environment
              </p>
            </div>
            <input
              type="checkbox"
              checked={sandboxEnabled}
              onChange={(e) => setSandboxEnabled(e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Auto-Allow Sandboxed Bash</label>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically approve bash commands if they're sandboxed
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoAllowBashIfSandboxed}
              onChange={(e) => setAutoAllowBashIfSandboxed(e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Allow Unsandboxed Commands</label>
              <p className="text-xs text-muted-foreground mt-1">
                Permit the dangerouslyDisableSandbox parameter
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowUnsandboxedCommands}
              onChange={(e) => setAllowUnsandboxedCommands(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Environment variables applied to every Claude Code session
              </CardDescription>
            </div>
            <Button onClick={addEnvVar} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Variable
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(envVars).length === 0 ? (
            <p className="text-sm text-muted-foreground">No environment variables configured</p>
          ) : (
            Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Input
                  placeholder="VARIABLE_NAME"
                  value={key}
                  onChange={(e) => updateEnvVarKey(key, e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="value"
                  value={value}
                  onChange={(e) => updateEnvVarValue(key, e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeEnvVar(key)}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Advanced authentication configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">API Key Helper Script</label>
            <Textarea
              placeholder="Custom script to generate an auth value (executed in /bin/sh)"
              value={apiKeyHelper}
              onChange={(e) => setApiKeyHelper(e.target.value)}
              className="mt-1 font-mono text-xs"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Custom script executed to generate authentication value
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Force Login Method</label>
            <select
              value={forceLoginMethod}
              onChange={(e) => setForceLoginMethod(e.target.value as "" | "claudeai" | "console")}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No restriction (default)</option>
              <option value="claudeai">Claude.ai accounts only</option>
              <option value="console">Console accounts only</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Restrict which authentication method can be used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Advanced Settings Warning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            These settings are for advanced users only. Incorrect configuration may cause Claude Code to malfunction.
            Refer to the official documentation before making changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, CheckCircle, AlertCircle, Shield, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProjectStore } from "@/stores/projectStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { CLAUDE_TOOLS, type ClaudeSettings, type PermissionRule } from "@/types/claudeSettings";
import * as electron from "@/services/electron";

export function ToolsPermissionsTab() {
  const { projectPath } = useProjectStore();
  const { claudeSettingsFile } = useSettingsStore();
  const [settings, setSettings] = useState<ClaudeSettings>({});
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Permission rules
  const [allowRules, setAllowRules] = useState<PermissionRule[]>([]);
  const [denyRules, setDenyRules] = useState<PermissionRule[]>([]);
  const [askRules, setAskRules] = useState<PermissionRule[]>([]);
  const [additionalDirs, setAdditionalDirs] = useState<string[]>([]);
  const [defaultMode, setDefaultMode] = useState<"allow" | "ask" | "deny">("ask");

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

      // Load permission settings
      if (result.settings.permissions) {
        setAllowRules(result.settings.permissions.allow || []);
        setDenyRules(result.settings.permissions.deny || []);
        setAskRules(result.settings.permissions.ask || []);
        setAdditionalDirs(result.settings.permissions.additionalDirectories || []);
        setDefaultMode(result.settings.permissions.defaultMode || "ask");
      }
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
        permissions: {
          allow: allowRules.length > 0 ? allowRules : undefined,
          deny: denyRules.length > 0 ? denyRules : undefined,
          ask: askRules.length > 0 ? askRules : undefined,
          additionalDirectories: additionalDirs.length > 0 ? additionalDirs : undefined,
          defaultMode: defaultMode !== "ask" ? defaultMode : undefined,
        },
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

  const addAllowRule = () => {
    setAllowRules([...allowRules, { tool: "*" }]);
  };

  const addDenyRule = () => {
    setDenyRules([...denyRules, { tool: "Bash" }]);
  };

  const addAskRule = () => {
    setAskRules([...askRules, { tool: "Write" }]);
  };

  const addAdditionalDir = () => {
    setAdditionalDirs([...additionalDirs, ""]);
  };

  const removeAllowRule = (index: number) => {
    setAllowRules(allowRules.filter((_, i) => i !== index));
  };

  const removeDenyRule = (index: number) => {
    setDenyRules(denyRules.filter((_, i) => i !== index));
  };

  const removeAskRule = (index: number) => {
    setAskRules(askRules.filter((_, i) => i !== index));
  };

  const removeAdditionalDir = (index: number) => {
    setAdditionalDirs(additionalDirs.filter((_, i) => i !== index));
  };

  const updateAllowRule = (index: number, field: keyof PermissionRule, value: string) => {
    const updated = [...allowRules];
    updated[index] = { ...updated[index], [field]: value || undefined };
    setAllowRules(updated);
  };

  const updateDenyRule = (index: number, field: keyof PermissionRule, value: string) => {
    const updated = [...denyRules];
    updated[index] = { ...updated[index], [field]: value || undefined };
    setDenyRules(updated);
  };

  const updateAskRule = (index: number, field: keyof PermissionRule, value: string) => {
    const updated = [...askRules];
    updated[index] = { ...updated[index], [field]: value || undefined };
    setAskRules(updated);
  };

  const updateAdditionalDir = (index: number, value: string) => {
    const updated = [...additionalDirs];
    updated[index] = value;
    setAdditionalDirs(updated);
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
      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tools & Permissions Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Control which tools Claude can use and under what conditions
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

      {/* Available Tools Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available Tools in Claude Code</CardTitle>
          <CardDescription>
            Reference of all tools that can be allowed, denied, or require confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {CLAUDE_TOOLS.map((tool) => (
              <div
                key={tool.name}
                className={`flex items-center gap-2 p-2 rounded border ${
                  tool.requiresPermission
                    ? 'border-orange-500/30 bg-orange-500/5'
                    : 'border-border'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{tool.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {tool.description}
                  </div>
                </div>
                {tool.requiresPermission && (
                  <Shield className="h-3 w-3 text-orange-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            <Shield className="h-3 w-3 inline text-orange-500" /> Tools with orange border require permissions by default
          </p>
        </CardContent>
      </Card>

      {/* Default Permission Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Default Permission Mode</CardTitle>
          <CardDescription>
            What should Claude do when no specific permission rule matches?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={defaultMode}
            onChange={(e) => setDefaultMode(e.target.value as "allow" | "ask" | "deny")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="allow">Allow - Permit all tool usage by default</option>
            <option value="ask">Ask - Require confirmation for each tool use (Recommended)</option>
            <option value="deny">Deny - Block all tool usage by default</option>
          </select>
        </CardContent>
      </Card>

      {/* Allow Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Allow Rules
              </CardTitle>
              <CardDescription>
                Tools that are always allowed without confirmation
              </CardDescription>
            </div>
            <Button onClick={addAllowRule} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {allowRules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No allow rules configured</p>
          ) : (
            allowRules.map((rule, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={rule.tool || ""}
                  onChange={(e) => updateAllowRule(index, "tool", e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a tool...</option>
                  <option value="*">* (All tools)</option>
                  {CLAUDE_TOOLS.map((tool) => (
                    <option key={tool.name} value={tool.name}>
                      {tool.name} - {tool.description}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Path pattern (optional)"
                  value={rule.path || ""}
                  onChange={(e) => updateAllowRule(index, "path", e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeAllowRule(index)}
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

      {/* Deny Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Deny Rules
              </CardTitle>
              <CardDescription>
                Tools that are always blocked
              </CardDescription>
            </div>
            <Button onClick={addDenyRule} size="sm" variant="destructive">
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {denyRules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deny rules configured</p>
          ) : (
            denyRules.map((rule, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={rule.tool || ""}
                  onChange={(e) => updateDenyRule(index, "tool", e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a tool...</option>
                  <option value="*">* (All tools)</option>
                  {CLAUDE_TOOLS.map((tool) => (
                    <option key={tool.name} value={tool.name}>
                      {tool.name} - {tool.description}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Path pattern (optional)"
                  value={rule.path || ""}
                  onChange={(e) => updateDenyRule(index, "path", e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeDenyRule(index)}
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

      {/* Ask Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Ask Rules
              </CardTitle>
              <CardDescription>
                Tools that require confirmation before use
              </CardDescription>
            </div>
            <Button onClick={addAskRule} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {askRules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ask rules configured</p>
          ) : (
            askRules.map((rule, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={rule.tool || ""}
                  onChange={(e) => updateAskRule(index, "tool", e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a tool...</option>
                  <option value="*">* (All tools)</option>
                  {CLAUDE_TOOLS.map((tool) => (
                    <option key={tool.name} value={tool.name}>
                      {tool.name} - {tool.description}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Path pattern (optional)"
                  value={rule.path || ""}
                  onChange={(e) => updateAskRule(index, "path", e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeAskRule(index)}
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

      {/* Additional Directories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Additional Directories
              </CardTitle>
              <CardDescription>
                Extra working directories that Claude can access
              </CardDescription>
            </div>
            <Button onClick={addAdditionalDir} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Directory
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {additionalDirs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No additional directories configured</p>
          ) : (
            additionalDirs.map((dir, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="/path/to/directory"
                  value={dir}
                  onChange={(e) => updateAdditionalDir(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeAdditionalDir(index)}
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

      {/* Best Practices */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Start with "Ask" as default mode and add specific allow rules as needed</li>
            <li>Always deny tools like Bash and WebFetch unless explicitly required</li>
            <li>Use path patterns to restrict tool usage to specific directories</li>
            <li>Read-only tools (Read, Grep, Glob) are generally safe to allow</li>
            <li>Review and update permissions regularly as your project evolves</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

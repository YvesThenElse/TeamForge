import { useState, useEffect } from "react";
import { Save, Plus, Trash2, CheckCircle, AlertCircle, Plug } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProjectStore } from "@/stores/projectStore";
import type { ClaudeSettings } from "@/types/claudeSettings";
import * as electron from "@/services/electron";

export function MCPServersTab() {
  const { projectPath } = useProjectStore();
  const [settings, setSettings] = useState<ClaudeSettings>({});
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [enableAllProjectMcpServers, setEnableAllProjectMcpServers] = useState(false);
  const [enabledServers, setEnabledServers] = useState<string[]>([]);
  const [disabledServers, setDisabledServers] = useState<string[]>([]);
  const [allowedServers, setAllowedServers] = useState<string[]>([]);
  const [deniedServers, setDeniedServers] = useState<string[]>([]);

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

      setEnableAllProjectMcpServers(result.settings.enableAllProjectMcpServers || false);
      setEnabledServers(result.settings.enabledMcpjsonServers || []);
      setDisabledServers(result.settings.disabledMcpjsonServers || []);
      setAllowedServers(result.settings.allowedMcpServers || []);
      setDeniedServers(result.settings.deniedMcpServers || []);
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
        enableAllProjectMcpServers: enableAllProjectMcpServers ? true : undefined,
        enabledMcpjsonServers: enabledServers.length > 0 ? enabledServers : undefined,
        disabledMcpjsonServers: disabledServers.length > 0 ? disabledServers : undefined,
        allowedMcpServers: allowedServers.length > 0 ? allowedServers : undefined,
        deniedMcpServers: deniedServers.length > 0 ? deniedServers : undefined,
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
          <h3 className="text-lg font-semibold">MCP Server Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure Model Context Protocol (MCP) servers for this project
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

      {/* Auto-Enable All */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Auto-Enable Project Servers
          </CardTitle>
          <CardDescription>
            Automatically approve all MCP servers defined in .mcp.json
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Enable All Project MCP Servers</label>
              <p className="text-xs text-muted-foreground mt-1">
                If enabled, all servers in .mcp.json will be automatically approved
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableAllProjectMcpServers}
              onChange={(e) => setEnableAllProjectMcpServers(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enabled Servers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Enabled Servers
              </CardTitle>
              <CardDescription>
                Specific servers to approve (from .mcp.json)
              </CardDescription>
            </div>
            <Button onClick={() => setEnabledServers([...enabledServers, ""])} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Server
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {enabledServers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enabled servers configured</p>
          ) : (
            enabledServers.map((server, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Server name from .mcp.json"
                  value={server}
                  onChange={(e) => {
                    const updated = [...enabledServers];
                    updated[index] = e.target.value;
                    setEnabledServers(updated);
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => setEnabledServers(enabledServers.filter((_, i) => i !== index))}
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

      {/* Disabled Servers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Disabled Servers
              </CardTitle>
              <CardDescription>
                Specific servers to reject (from .mcp.json)
              </CardDescription>
            </div>
            <Button onClick={() => setDisabledServers([...disabledServers, ""])} size="sm" variant="destructive">
              <Plus className="mr-2 h-4 w-4" />
              Add Server
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {disabledServers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No disabled servers configured</p>
          ) : (
            disabledServers.map((server, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Server name from .mcp.json"
                  value={server}
                  onChange={(e) => {
                    const updated = [...disabledServers];
                    updated[index] = e.target.value;
                    setDisabledServers(updated);
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => setDisabledServers(disabledServers.filter((_, i) => i !== index))}
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

      {/* Info Card */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Plug className="h-4 w-4 text-blue-500" />
            About MCP Servers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Model Context Protocol (MCP) allows Claude to connect to external data sources and tools.
            Configure which servers from your project's <code className="bg-muted px-1">.mcp.json</code> file should be enabled or disabled.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

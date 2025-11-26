import { useState, useEffect } from "react";
import { X, Plus, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { ElementSecurity, GlobalSecurity } from "@/types/team";

interface SecurityConfigPopupProps {
  isGlobal: boolean;
  security: ElementSecurity | GlobalSecurity | null;
  onSave: (security: ElementSecurity | GlobalSecurity) => void;
  onClose: () => void;
}

const PERMISSION_EXAMPLES = {
  allow: [
    "Read(*)",
    "Edit(src/**/*.ts)",
    "Write(dist/**)",
    "Bash(npm run build)",
  ],
  deny: [
    "Read(.env)",
    "Read(.env.*)",
    "Read(secrets/**)",
    "Edit(.git/**)",
    "Bash(rm -rf)",
  ],
  ask: [
    "Bash(git push)",
    "Edit(package.json)",
    "WebFetch(https://api.example.com/*)",
  ],
};

export function SecurityConfigPopup({
  isGlobal,
  security,
  onSave,
  onClose,
}: SecurityConfigPopupProps) {
  const [allowRules, setAllowRules] = useState<string[]>([]);
  const [denyRules, setDenyRules] = useState<string[]>([]);
  const [askRules, setAskRules] = useState<string[]>([]);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  // Initialize from existing security
  useEffect(() => {
    if (security?.permissions) {
      setAllowRules(security.permissions.allow || []);
      setDenyRules(security.permissions.deny || []);
      if (isGlobal && "ask" in security.permissions) {
        setAskRules((security as GlobalSecurity).permissions?.ask || []);
      }
    }

    if (isGlobal && "env" in (security || {})) {
      setEnvVars((security as GlobalSecurity).env || {});
    }
  }, [security, isGlobal]);

  const addRule = (type: "allow" | "deny" | "ask") => {
    const rule = "";
    if (type === "allow") {
      setAllowRules([...allowRules, rule]);
    } else if (type === "deny") {
      setDenyRules([...denyRules, rule]);
    } else if (type === "ask") {
      setAskRules([...askRules, rule]);
    }
  };

  const removeRule = (type: "allow" | "deny" | "ask", index: number) => {
    if (type === "allow") {
      setAllowRules(allowRules.filter((_, i) => i !== index));
    } else if (type === "deny") {
      setDenyRules(denyRules.filter((_, i) => i !== index));
    } else if (type === "ask") {
      setAskRules(askRules.filter((_, i) => i !== index));
    }
  };

  const updateRule = (type: "allow" | "deny" | "ask", index: number, value: string) => {
    if (type === "allow") {
      const updated = [...allowRules];
      updated[index] = value;
      setAllowRules(updated);
    } else if (type === "deny") {
      const updated = [...denyRules];
      updated[index] = value;
      setDenyRules(updated);
    } else if (type === "ask") {
      const updated = [...askRules];
      updated[index] = value;
      setAskRules(updated);
    }
  };

  const addEnvVar = () => {
    const newKey = `VAR_${Object.keys(envVars).length + 1}`;
    setEnvVars({ ...envVars, [newKey]: "" });
  };

  const removeEnvVar = (key: string) => {
    const updated = { ...envVars };
    delete updated[key];
    setEnvVars(updated);
  };

  const updateEnvKey = (oldKey: string, newKey: string) => {
    const updated = { ...envVars };
    const value = updated[oldKey];
    delete updated[oldKey];
    updated[newKey] = value;
    setEnvVars(updated);
  };

  const updateEnvValue = (key: string, value: string) => {
    setEnvVars({ ...envVars, [key]: value });
  };

  const handleSave = () => {
    const newSecurity: ElementSecurity | GlobalSecurity = {
      permissions: {
        allow: allowRules.filter((r) => r.trim()),
        deny: denyRules.filter((r) => r.trim()),
        ...(isGlobal && { ask: askRules.filter((r) => r.trim()) }),
      },
      configured: true,
      ...(isGlobal && { env: envVars }),
    };

    onSave(newSecurity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-bold">
              {isGlobal ? "Global Security Configuration" : "Element Security"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Allow Rules */}
          <Card className="p-4 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-700 dark:text-green-400">
                Allow Rules
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addRule("allow")}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Rule
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Tools and patterns that are always allowed.
              <br />
              Examples: {PERMISSION_EXAMPLES.allow.join(", ")}
            </p>
            <div className="space-y-2">
              {allowRules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={rule}
                    onChange={(e) => updateRule("allow", index, e.target.value)}
                    placeholder="e.g., Read(src/**/*.ts)"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRule("allow", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {allowRules.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No allow rules defined
                </div>
              )}
            </div>
          </Card>

          {/* Deny Rules */}
          <Card className="p-4 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-red-700 dark:text-red-400">
                Deny Rules
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addRule("deny")}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Rule
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Tools and patterns that are always denied.
              <br />
              Examples: {PERMISSION_EXAMPLES.deny.join(", ")}
            </p>
            <div className="space-y-2">
              {denyRules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={rule}
                    onChange={(e) => updateRule("deny", index, e.target.value)}
                    placeholder="e.g., Read(.env)"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRule("deny", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {denyRules.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No deny rules defined
                </div>
              )}
            </div>
          </Card>

          {/* Ask Rules (Global only) */}
          {isGlobal && (
            <Card className="p-4 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">
                  Ask Rules
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addRule("ask")}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Rule
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Tools that require user confirmation before use.
                <br />
                Examples: {PERMISSION_EXAMPLES.ask.join(", ")}
              </p>
              <div className="space-y-2">
                {askRules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={rule}
                      onChange={(e) => updateRule("ask", index, e.target.value)}
                      placeholder="e.g., Bash(git push)"
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeRule("ask", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {askRules.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    No ask rules defined
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Environment Variables (Global only) */}
          {isGlobal && (
            <Card className="p-4 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-700 dark:text-blue-400">
                  Environment Variables
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addEnvVar}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Variable
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Non-sensitive environment variables for the team.
              </p>
              <div className="space-y-2">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <Input
                      value={key}
                      onChange={(e) => updateEnvKey(key, e.target.value)}
                      placeholder="VAR_NAME"
                      className="w-1/3"
                    />
                    <Input
                      value={value}
                      onChange={(e) => updateEnvValue(key, e.target.value)}
                      placeholder="value"
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeEnvVar(key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {Object.keys(envVars).length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    No environment variables defined
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Shield className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { X, Save, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useTeamStore } from "@/stores/teamStore";
import { useProjectStore } from "@/stores/projectStore";
import { useAgentStore } from "@/stores/agentStore";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  saveTeam,
  loadTemplateSkills,
  loadTemplateHooks,
  generateTeamAgents,
  generateTeamSkills,
  generateTeamSettings
} from "@/services/electron";
import type { Team, TeamAgent, TeamSkill, TeamHook, GlobalSecurity, ElementSecurity } from "@/types/team";
import type { Skill } from "@/types/skill";
import type { Hook } from "@/types/hook";
import { TeamElementCard } from "./TeamElementCard";
import { TeamContextMenu } from "./TeamContextMenu";
import { AgentSelectorPopup } from "./AgentSelectorPopup";
import { SkillSelectorPopup } from "./SkillSelectorPopup";
import { HookSelectorPopup } from "./HookSelectorPopup";
import { SecurityConfigPopup } from "./SecurityConfigPopup";

interface TeamEditorProps {
  onClose: () => void;
}

export function TeamEditor({ onClose }: TeamEditorProps) {
  const currentTeam = useTeamStore((state) => state.currentTeam);
  const { projectPath } = useProjectStore();
  const { library: agentLibrary } = useAgentStore();
  const {
    developerMode,
    skillCachePath,
    skillDevPath,
    skillSourcePath,
    hookCachePath,
    hookDevPath,
    hookSourcePath
  } = useSettingsStore();

  // Form state
  const [teamName, setTeamName] = useState(currentTeam?.name || "");
  const [teamDescription, setTeamDescription] = useState(currentTeam?.description || "");
  const [agents, setAgents] = useState<TeamAgent[]>(currentTeam?.agents || []);
  const [skills, setSkills] = useState<TeamSkill[]>(currentTeam?.skills || []);
  const [hooks, setHooks] = useState<TeamHook[]>(currentTeam?.hooks || []);
  const [security, setSecurity] = useState<GlobalSecurity>(
    currentTeam?.security || { configured: false }
  );

  // Libraries
  const [skillLibrary, setSkillLibrary] = useState<Skill[]>([]);
  const [hookLibrary, setHookLibrary] = useState<Hook[]>([]);

  // UI state
  const [hasChanges, setHasChanges] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [showHookSelector, setShowHookSelector] = useState(false);
  const [showSecurityConfig, setShowSecurityConfig] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{
    type: "agent" | "skill" | "hook" | "security";
    id?: string;
  } | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  // Load skill and hook libraries
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const skillTemplates = await loadTemplateSkills(
          developerMode,
          skillCachePath,
          skillDevPath,
          projectPath ?? undefined,
          skillSourcePath
        );
        setSkillLibrary(skillTemplates);
      } catch (error) {
        console.error("Failed to load skill library:", error);
      }

      try {
        const hookTemplates = await loadTemplateHooks(
          developerMode,
          hookCachePath,
          hookDevPath,
          projectPath ?? undefined,
          hookSourcePath
        );
        setHookLibrary(hookTemplates);
      } catch (error) {
        console.error("Failed to load hook library:", error);
      }
    };

    if (projectPath) {
      loadLibraries();
    }
  }, [projectPath, developerMode, skillCachePath, skillDevPath, skillSourcePath, hookCachePath, hookDevPath, hookSourcePath]);

  // Track changes
  useEffect(() => {
    if (!currentTeam) return;

    const changed =
      teamName !== currentTeam.name ||
      teamDescription !== (currentTeam.description || "") ||
      JSON.stringify(agents) !== JSON.stringify(currentTeam.agents || []) ||
      JSON.stringify(skills) !== JSON.stringify(currentTeam.skills || []) ||
      JSON.stringify(hooks) !== JSON.stringify(currentTeam.hooks || []) ||
      JSON.stringify(security) !== JSON.stringify(currentTeam.security || {});

    setHasChanges(changed);
  }, [teamName, teamDescription, agents, skills, hooks, security, currentTeam]);

  // Handle save
  const handleSave = async () => {
    if (!projectPath || !currentTeam) return;

    if (!teamName.trim()) {
      alert("Please enter a team name");
      return;
    }

    try {
      const updatedTeam: Team = {
        ...currentTeam,
        name: teamName,
        description: teamDescription,
        agents,
        skills,
        hooks,
        security,
        updatedAt: new Date().toISOString(),
      };

      // Save team metadata
      const result = await saveTeam(projectPath, updatedTeam);
      const teamId = result.teamId;

      // Generate agent files if there are agents
      if (agents.length > 0) {
        await generateTeamAgents(projectPath, teamId, agentLibrary);
      }

      // Generate skill directories if there are skills
      if (skills.length > 0) {
        await generateTeamSkills(projectPath, teamId, skillLibrary);
      }

      // Generate settings.json with hooks and security
      if (hooks.length > 0 || security.configured) {
        await generateTeamSettings(projectPath, teamId, hookLibrary);
      }

      setHasChanges(false);
      alert("Team saved successfully!");
    } catch (error) {
      console.error("Failed to save team:", error);
      alert("Failed to save team");
    }
  };

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (hasChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Do you want to save before closing?"
      );

      if (confirm) {
        handleSave().then(() => onClose());
      } else {
        const discard = window.confirm(
          "Are you sure you want to discard your changes?"
        );
        if (discard) {
          onClose();
        }
      }
    } else {
      onClose();
    }
  };

  // Generate description
  const handleGenerateDescription = () => {
    const parts = [];

    if (agents.length > 0) {
      const agentNames = agents
        .map((a) => {
          const agent = agentLibrary.find((lib) => lib.id === a.agentId);
          return agent?.name;
        })
        .filter(Boolean)
        .join(", ");
      parts.push(`${agents.length} agent${agents.length > 1 ? "s" : ""} (${agentNames})`);
    }

    if (skills.length > 0) {
      parts.push(`${skills.length} skill${skills.length > 1 ? "s" : ""}`);
    }

    if (hooks.length > 0) {
      parts.push(`${hooks.length} hook${hooks.length > 1 ? "s" : ""}`);
    }

    if (security.configured) {
      parts.push("with security configuration");
    }

    const description =
      parts.length > 0
        ? `Team with ${parts.join(", ")}.`
        : "Empty team configuration.";

    setTeamDescription(description);
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleShowAgentSelector = () => {
    setShowAgentSelector(true);
    setContextMenu(null);
  };

  const handleShowSkillSelector = () => {
    setShowSkillSelector(true);
    setContextMenu(null);
  };

  const handleShowHookSelector = () => {
    setShowHookSelector(true);
    setContextMenu(null);
  };

  const handleAddSecurity = () => {
    setSelectedElement({ type: "security" });
    setShowSecurityConfig(true);
    setContextMenu(null);
  };

  // Element handlers
  const handleRemoveAgent = (agentId: string) => {
    setAgents(agents.filter((a) => a.agentId !== agentId));
  };

  const handleRemoveSkill = (skillId: string) => {
    setSkills(skills.filter((s) => s.skillId !== skillId));
  };

  const handleRemoveHook = (hookId: string) => {
    setHooks(hooks.filter((h) => h.hookId !== hookId));
  };

  const handleConfigureElementSecurity = (
    type: "agent" | "skill" | "hook",
    id: string
  ) => {
    setSelectedElement({ type, id });
    setShowSecurityConfig(true);
  };

  // Add handlers
  const handleAddAgent = (agentId: string) => {
    const maxOrder = agents.length > 0 ? Math.max(...agents.map((a) => a.order)) : 0;
    const newAgent: TeamAgent = {
      agentId,
      order: maxOrder + 1,
    };
    setAgents([...agents, newAgent]);
  };

  const handleAddSkill = (skillId: string) => {
    const maxOrder = skills.length > 0 ? Math.max(...skills.map((s) => s.order)) : 0;
    const newSkill: TeamSkill = {
      skillId,
      order: maxOrder + 1,
    };
    setSkills([...skills, newSkill]);
  };

  const handleAddHook = (hookId: string) => {
    const maxOrder = hooks.length > 0 ? Math.max(...hooks.map((h) => h.order)) : 0;
    const newHook: TeamHook = {
      hookId,
      order: maxOrder + 1,
    };
    setHooks([...hooks, newHook]);
  };

  // Save security config
  const handleSaveSecurity = (newSecurity: ElementSecurity | GlobalSecurity) => {
    if (!selectedElement) return;

    if (selectedElement.type === "security") {
      setSecurity(newSecurity as GlobalSecurity);
    } else if (selectedElement.type === "agent" && selectedElement.id) {
      setAgents(
        agents.map((a) =>
          a.agentId === selectedElement.id
            ? { ...a, security: newSecurity as ElementSecurity }
            : a
        )
      );
    } else if (selectedElement.type === "skill" && selectedElement.id) {
      setSkills(
        skills.map((s) =>
          s.skillId === selectedElement.id
            ? { ...s, security: newSecurity as ElementSecurity }
            : s
        )
      );
    } else if (selectedElement.type === "hook" && selectedElement.id) {
      setHooks(
        hooks.map((h) =>
          h.hookId === selectedElement.id
            ? { ...h, security: newSecurity as ElementSecurity }
            : h
        )
      );
    }
  };

  // Get current security for editing
  const getCurrentSecurity = (): ElementSecurity | GlobalSecurity | null => {
    if (!selectedElement) return null;

    if (selectedElement.type === "security") {
      return security;
    } else if (selectedElement.type === "agent" && selectedElement.id) {
      const agent = agents.find((a) => a.agentId === selectedElement.id);
      return agent?.security || null;
    } else if (selectedElement.type === "skill" && selectedElement.id) {
      const skill = skills.find((s) => s.skillId === selectedElement.id);
      return skill?.security || null;
    } else if (selectedElement.type === "hook" && selectedElement.id) {
      const hook = hooks.find((h) => h.hookId === selectedElement.id);
      return hook?.security || null;
    }

    return null;
  };

  // Check for warnings
  const hasSecurityWarning = !security.configured;
  const agentsWithWarnings = agents.filter(
    (a) => a.security && !a.security.configured
  ).length;
  const skillsWithWarnings = skills.filter(
    (s) => s.security && !s.security.configured
  ).length;
  const hooksWithWarnings = hooks.filter(
    (h) => h.security && !h.security.configured
  ).length;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {currentTeam?.id ? "Edit Team" : "New Team"}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Team info */}
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Team Name *"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="font-semibold bg-white dark:bg-gray-900"
          />
          <div className="flex gap-2">
            <Textarea
              placeholder="Team Description"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              className="flex-1 resize-none bg-white dark:bg-gray-900"
              rows={2}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateDescription}
              title="Generate description based on team configuration"
              className="self-start"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Warnings summary */}
        {(hasSecurityWarning ||
          agentsWithWarnings > 0 ||
          skillsWithWarnings > 0 ||
          hooksWithWarnings > 0) && (
          <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
            <AlertTriangle className="h-4 w-4" />
            <span>
              Configuration incomplete:{" "}
              {[
                hasSecurityWarning && "Global security",
                agentsWithWarnings > 0 && `${agentsWithWarnings} agent(s)`,
                skillsWithWarnings > 0 && `${skillsWithWarnings} skill(s)`,
                hooksWithWarnings > 0 && `${hooksWithWarnings} hook(s)`,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Main editor area */}
      <div
        ref={editorRef}
        className="flex-1 overflow-auto p-6"
        onContextMenu={handleContextMenu}
      >
        {/* Combined Elements Section - Masonry Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 min-h-[200px] p-4 border-2 border-dashed rounded-2xl bg-white dark:bg-gray-900">
          {/* Agents */}
          {agents
            .sort((a, b) => a.order - b.order)
            .map((agent) => (
              <TeamElementCard
                key={agent.agentId}
                type="agent"
                id={agent.agentId}
                library={agentLibrary}
                security={agent.security}
                onRemove={() => handleRemoveAgent(agent.agentId)}
                onConfigureSecurity={() =>
                  handleConfigureElementSecurity("agent", agent.agentId)
                }
              />
            ))}

          {/* Skills */}
          {skills
            .sort((a, b) => a.order - b.order)
            .map((skill) => (
              <TeamElementCard
                key={skill.skillId}
                type="skill"
                id={skill.skillId}
                skillLibrary={skillLibrary}
                security={skill.security}
                onRemove={() => handleRemoveSkill(skill.skillId)}
                onConfigureSecurity={() =>
                  handleConfigureElementSecurity("skill", skill.skillId)
                }
              />
            ))}

          {/* Hooks */}
          {hooks
            .sort((a, b) => a.order - b.order)
            .map((hook) => (
              <TeamElementCard
                key={hook.hookId}
                type="hook"
                id={hook.hookId}
                hookLibrary={hookLibrary}
                security={hook.security}
                onRemove={() => handleRemoveHook(hook.hookId)}
                onConfigureSecurity={() =>
                  handleConfigureElementSecurity("hook", hook.hookId)
                }
              />
            ))}

          {/* Global Security */}
          <TeamElementCard
            type="security"
            id="global"
            configured={security.configured}
            onRemove={() =>
              setSecurity({ ...security, configured: false })
            }
            onConfigureSecurity={handleAddSecurity}
          />

          {/* Empty state hint */}
          {agents.length === 0 && skills.length === 0 && hooks.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-3 opacity-30">+</div>
              <div className="text-sm text-muted-foreground">
                Right-click to add agents, skills or hooks
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <TeamContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onAddAgent={handleShowAgentSelector}
          onAddSkill={handleShowSkillSelector}
          onAddHook={handleShowHookSelector}
          onAddSecurity={handleAddSecurity}
        />
      )}

      {/* Agent Selector Popup */}
      {showAgentSelector && (
        <AgentSelectorPopup
          agents={agentLibrary}
          selectedAgentIds={agents.map((a) => a.agentId)}
          onSelect={handleAddAgent}
          onClose={() => setShowAgentSelector(false)}
        />
      )}

      {/* Skill Selector Popup */}
      {showSkillSelector && (
        <SkillSelectorPopup
          skills={skillLibrary}
          selectedSkillIds={skills.map((s) => s.skillId)}
          onSelect={handleAddSkill}
          onClose={() => setShowSkillSelector(false)}
        />
      )}

      {/* Hook Selector Popup */}
      {showHookSelector && (
        <HookSelectorPopup
          hooks={hookLibrary}
          selectedHookIds={hooks.map((h) => h.hookId)}
          onSelect={handleAddHook}
          onClose={() => setShowHookSelector(false)}
        />
      )}

      {/* Security Config Popup */}
      {showSecurityConfig && selectedElement && (
        <SecurityConfigPopup
          isGlobal={selectedElement.type === "security"}
          security={getCurrentSecurity()}
          onSave={handleSaveSecurity}
          onClose={() => {
            setShowSecurityConfig(false);
            setSelectedElement(null);
          }}
        />
      )}
    </div>
  );
}

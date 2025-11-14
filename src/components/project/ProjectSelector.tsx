import { useState, useEffect } from "react";
import { FolderOpen, GitBranch, Loader2, Clock, X, CheckCircle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProject } from "@/hooks/useProject";
import { getRecentProjects, removeRecentProject, type RecentProject } from "@/lib/recentProjects";
import type { ClaudeInfo, GlobalClaudeInfo } from "@/types/claudeInfo";
import * as electron from "@/services/electron";

export function ProjectSelector() {
  const [gitUrl, setGitUrl] = useState("");
  const [targetPath, setTargetPath] = useState("");
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [projectClaudeInfo, setProjectClaudeInfo] = useState<ClaudeInfo | null>(null);
  const [globalClaudeInfo, setGlobalClaudeInfo] = useState<GlobalClaudeInfo | null>(null);
  const { projectPath, analysis, isAnalyzing, selectProjectFolder, analyzeProjectFolder, cloneRepository } = useProject();

  useEffect(() => {
    setRecentProjects(getRecentProjects());

    // Load global Claude config (from ~/.claude/)
    const loadGlobalClaudeConfig = async () => {
      try {
        const info = await electron.getGlobalClaudeInfo();
        setGlobalClaudeInfo(info);
      } catch (err) {
        console.error("Failed to load global Claude info:", err);
      }
    };
    loadGlobalClaudeConfig();

    // Load project Claude config (from project/.claude/)
    if (projectPath) {
      const loadProjectClaudeConfig = async () => {
        try {
          const info = await electron.getClaudeInfo(projectPath);
          setProjectClaudeInfo(info);
        } catch (err) {
          console.error("Failed to load project Claude info:", err);
        }
      };
      loadProjectClaudeConfig();
    } else {
      setProjectClaudeInfo(null);
    }
  }, [projectPath]);

  const handleSelectFolder = async () => {
    console.log("[ProjectSelector] Browse Folder button clicked");
    try {
      await selectProjectFolder();
      console.log("[ProjectSelector] selectProjectFolder completed");
    } catch (err) {
      console.error("[ProjectSelector] Error:", err);
      alert(`Error selecting folder: ${err}`);
    }
  };

  const handleCloneRepo = async () => {
    if (!gitUrl || !targetPath) {
      alert("Please provide both Git URL and target path");
      return;
    }
    try {
      await cloneRepository(gitUrl, targetPath);
      alert("Repository cloned successfully!");
    } catch (err) {
      alert(`Failed to clone: ${err}`);
    }
  };

  const handleSelectRecentProject = async (recent: RecentProject) => {
    try {
      await analyzeProjectFolder(recent.path);
    } catch (err) {
      alert(`Failed to open project: ${err}`);
    }
  };

  const handleRemoveRecentProject = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentProject(path);
    setRecentProjects(getRecentProjects());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Select Your Project</h2>
        <p className="text-muted-foreground mt-2">
          Choose a local folder or clone from Git
        </p>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && !projectPath && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Projects</span>
            </CardTitle>
            <CardDescription>
              Open a recently accessed project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentProjects.map((recent) => (
                <div
                  key={recent.path}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectRecentProject(recent)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{recent.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {recent.path}
                    </div>
                    {recent.projectType && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {recent.projectType}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleRemoveRecentProject(recent.path, e)}
                    className="ml-2 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Local Folder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5" />
              <span>Local Folder</span>
            </CardTitle>
            <CardDescription>
              Select an existing project on your computer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectPath && (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-md text-sm break-all">
                    <div className="font-medium mb-1">Path:</div>
                    {projectPath}
                  </div>
                  {analysis && (
                    <div className="p-3 bg-muted rounded-md text-sm space-y-2">
                      <div>
                        <span className="font-medium">Type:</span> {analysis.projectType}
                      </div>
                      {analysis.frameworks && analysis.frameworks.length > 0 && (
                        <div>
                          <span className="font-medium">Frameworks:</span>{" "}
                          {analysis.frameworks.join(", ")}
                        </div>
                      )}
                      {analysis.languages && Object.keys(analysis.languages).length > 0 && (
                        <div>
                          <span className="font-medium">Languages:</span>{" "}
                          {Object.entries(analysis.languages)
                            .sort(([, a], [, b]) => b - a)
                            .map(([lang, percent]) => `${lang} (${percent}%)`)
                            .join(", ")}
                        </div>
                      )}
                      {analysis.files && (
                        <div>
                          <span className="font-medium">Files:</span> {analysis.files.total}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <Button
                onClick={handleSelectFolder}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Browse Folder
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Git Clone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5" />
              <span>Clone from Git</span>
            </CardTitle>
            <CardDescription>
              Clone a repository from a Git URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Repository URL</label>
                <Input
                  type="url"
                  placeholder="https://github.com/user/repo.git"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Path</label>
                <Input
                  type="text"
                  placeholder="C:\Projects\my-repo"
                  value={targetPath}
                  onChange={(e) => setTargetPath(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleCloneRepo}
                disabled={isAnalyzing || !gitUrl || !targetPath}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cloning...
                  </>
                ) : (
                  <>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Clone Repository
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claude Configuration Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Claude Config (.claude/ in project) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Project Claude Config</span>
            </CardTitle>
            <CardDescription>
              Configuration in project's .claude/ directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!projectPath ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Select a project to view its Claude configuration
              </div>
            ) : projectClaudeInfo ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    {projectClaudeInfo.exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">.claude/</p>
                      <p className="text-xs text-muted-foreground">
                        {projectClaudeInfo.exists ? "Present" : "Not found"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {projectClaudeInfo.agentsDir ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">agents/</p>
                      <p className="text-xs text-muted-foreground">
                        {projectClaudeInfo.agentsDir ? "Present" : "Not found"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {projectClaudeInfo.skillsDir ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">skills/</p>
                      <p className="text-xs text-muted-foreground">
                        {projectClaudeInfo.skillsDir ? "Present" : "Not found"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {projectClaudeInfo.settingsFile ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">settings</p>
                      <p className="text-xs text-muted-foreground">
                        {projectClaudeInfo.settingsFile ? "Present" : "Optional"}
                      </p>
                    </div>
                  </div>
                </div>

                {projectClaudeInfo.settings && Object.keys(projectClaudeInfo.settings).length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Settings:</p>
                    <div className="bg-muted p-2 rounded-lg space-y-1 max-h-32 overflow-y-auto">
                      {Object.entries(projectClaudeInfo.settings).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs gap-2">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-mono truncate">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!projectClaudeInfo.exists && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 mt-2">
                    <p className="text-xs text-yellow-600 dark:text-yellow-500">
                      No .claude/ directory found in this project
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Claude Config (~/.claude/) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Global Claude Config</span>
            </CardTitle>
            <CardDescription>
              User configuration in ~/.claude/ directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {globalClaudeInfo ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    {globalClaudeInfo.exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">~/.claude/</p>
                      <p className="text-xs text-muted-foreground">
                        {globalClaudeInfo.exists ? "Present" : "Not found"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {globalClaudeInfo.agentsDir ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">agents/</p>
                      <p className="text-xs text-muted-foreground">
                        {globalClaudeInfo.agentsDir ? `${globalClaudeInfo.agentsCount} agents` : "Not found"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {globalClaudeInfo.settingsJsonFile ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">settings.json</p>
                      <p className="text-xs text-muted-foreground">
                        {globalClaudeInfo.settingsJsonFile ? "Present" : "Optional"}
                      </p>
                    </div>
                  </div>

                  {globalClaudeInfo.claudePath && (
                    <div className="flex items-center space-x-2 col-span-2">
                      <Info className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Path</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {globalClaudeInfo.claudePath}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {globalClaudeInfo.settings && Object.keys(globalClaudeInfo.settings).length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Settings:</p>
                    <div className="bg-muted p-2 rounded-lg space-y-1 max-h-32 overflow-y-auto">
                      {Object.entries(globalClaudeInfo.settings).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs gap-2">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-mono truncate">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!globalClaudeInfo.exists && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 mt-2">
                    <p className="text-xs text-yellow-600 dark:text-yellow-500">
                      No global Claude configuration found. Install Claude Code to create ~/.claude/ directory.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Claude Agents and Skills Lists */}
      {projectPath && projectClaudeInfo && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Project Claude Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Project Claude Agents</span>
              </CardTitle>
              <CardDescription>
                Agents configured in .claude/agents/ directory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectClaudeInfo.agents && projectClaudeInfo.agents.length > 0 ? (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Agents ({projectClaudeInfo.agents.length}):
                  </p>
                  <div className="bg-muted p-2 rounded-lg space-y-1 max-h-60 overflow-y-auto">
                    {projectClaudeInfo.agents.map((agent) => (
                      <div
                        key={agent}
                        className="flex items-center space-x-2 text-sm p-1.5 rounded hover:bg-background/50 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span className="font-mono text-xs">{agent}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No agents configured yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Claude Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Project Claude Skills</span>
              </CardTitle>
              <CardDescription>
                Skills configured in .claude/skills/ directory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectClaudeInfo.skills && projectClaudeInfo.skills.length > 0 ? (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Skills ({projectClaudeInfo.skills.length}):
                  </p>
                  <div className="bg-muted p-2 rounded-lg space-y-1 max-h-60 overflow-y-auto">
                    {projectClaudeInfo.skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center space-x-2 text-sm p-1.5 rounded hover:bg-background/50 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="font-mono text-xs">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No skills configured yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

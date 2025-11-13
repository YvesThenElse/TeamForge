import { useState, useEffect } from "react";
import { FolderOpen, GitBranch, Loader2, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProject } from "@/hooks/useProject";
import { getRecentProjects, removeRecentProject, type RecentProject } from "@/lib/recentProjects";

export function ProjectSelector() {
  const [gitUrl, setGitUrl] = useState("");
  const [targetPath, setTargetPath] = useState("");
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const { projectPath, analysis, isAnalyzing, selectProjectFolder, analyzeProjectFolder, cloneRepository } = useProject();

  useEffect(() => {
    setRecentProjects(getRecentProjects());
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
    </div>
  );
}

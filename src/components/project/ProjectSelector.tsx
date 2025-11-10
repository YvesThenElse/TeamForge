import { useState } from "react";
import { FolderOpen, GitBranch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProject } from "@/hooks/useProject";

export function ProjectSelector() {
  const [gitUrl, setGitUrl] = useState("");
  const [targetPath, setTargetPath] = useState("");
  const { projectPath, isAnalyzing, selectProjectFolder, cloneRepository } = useProject();

  const handleSelectFolder = async () => {
    await selectProjectFolder();
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Select Your Project</h2>
        <p className="text-muted-foreground mt-2">
          Choose a local folder or clone from Git
        </p>
      </div>

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
                <div className="p-3 bg-muted rounded-md text-sm break-all">
                  {projectPath}
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
                    Loading...
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

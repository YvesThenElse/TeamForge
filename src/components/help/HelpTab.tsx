import { HelpCircle, Bot, Sparkles, Users, Book, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export function HelpTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <HelpCircle className="h-8 w-8" />
          Help & Guide
        </h2>
        <p className="text-muted-foreground mt-2">
          Learn about TeamForge and Claude Code concepts
        </p>
      </div>

      {/* Agents vs Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agents vs
            <Sparkles className="h-5 w-5" />
            Skills
          </CardTitle>
          <CardDescription>
            Understanding the difference between agents and skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agents (Sub-Agents)
            </h4>
            <p className="text-sm text-muted-foreground">
              Agents are specialized AI assistants with specific roles and expertise. They are essentially
              pre-configured versions of Claude with custom system prompts tailored for particular tasks.
            </p>
            <div className="ml-4 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Purpose:</strong> Provide role-based expertise (e.g., Frontend Developer, Backend Expert, Code Reviewer)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Location:</strong> Stored in <code className="text-xs bg-muted px-1 py-0.5 rounded">.claude/agents/</code></p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Format:</strong> Markdown files with frontmatter containing metadata and system prompts</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Use Case:</strong> When you need a specialized AI persona for a specific domain or workflow phase</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Example:</strong> A "React Expert" agent that knows best practices, hooks, and component patterns</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Skills
            </h4>
            <p className="text-sm text-muted-foreground">
              Skills are reusable task-specific instructions that can be invoked by any agent. They are like
              plugins or tools that extend what agents can do.
            </p>
            <div className="ml-4 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Purpose:</strong> Provide reusable procedures for specific tasks (e.g., "Run Tests", "Generate Documentation")</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Location:</strong> Stored in <code className="text-xs bg-muted px-1 py-0.5 rounded">.claude/skills/</code></p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Format:</strong> Markdown files with frontmatter and step-by-step instructions</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Use Case:</strong> When you need to execute a specific procedure that multiple agents might use</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <div>
                  <p className="text-sm"><strong>Example:</strong> A "Deploy to Production" skill that any agent can invoke with <code className="text-xs bg-muted px-1 py-0.5 rounded">/deploy</code></p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
            <p className="text-sm font-semibold mb-2">Key Difference</p>
            <p className="text-sm text-muted-foreground">
              <strong>Agents</strong> are WHO does the work (specialized personas with expertise).
              <br />
              <strong>Skills</strong> are WHAT gets done (reusable procedures and workflows).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Teams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teams (Agent Chaining)
          </CardTitle>
          <CardDescription>
            Orchestrate multiple agents to work together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Teams allow you to create workflows where multiple agents collaborate in sequence. Each agent
            completes their task and then hands off to the next agent in the chain.
          </p>
          <div className="ml-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <div>
                <p className="text-sm"><strong>Purpose:</strong> Automate complex workflows that require multiple specialized roles</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <div>
                <p className="text-sm"><strong>Example Workflow:</strong> Code Reviewer → Frontend Developer → Backend Developer → QA Tester</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <div>
                <p className="text-sm"><strong>Configuration:</strong> Teams are configured in TeamForge with drag-and-drop workflow editor</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Configuration Examples
          </CardTitle>
          <CardDescription>
            Sample configurations for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Example 1: Full-Stack Development Team</h4>
            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
              <p>Agents: Frontend Expert → Backend Expert → Database Specialist</p>
              <p className="text-muted-foreground mt-2">Skills: Run Tests, Deploy, Generate Docs</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Example 2: Code Quality Workflow</h4>
            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
              <p>Agents: Code Reviewer → Refactoring Expert → Performance Optimizer</p>
              <p className="text-muted-foreground mt-2">Skills: Run Linter, Run Type Check, Benchmark</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Example 3: Documentation Generation</h4>
            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
              <p>Agents: Documentation Writer → API Specialist → Technical Writer</p>
              <p className="text-muted-foreground mt-2">Skills: Generate API Docs, Create README, Build Wiki</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Resources & Documentation
          </CardTitle>
          <CardDescription>
            Learn more about Claude Code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="https://code.claude.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Claude Code Official Documentation
          </a>
          <a
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Claude Code GitHub Repository
          </a>
          <div className="border-t pt-3 mt-3">
            <p className="text-sm text-muted-foreground">
              <strong>TeamForge</strong> is a community tool that helps you configure Claude Code projects
              with visual workflows, team management, and agent libraries.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

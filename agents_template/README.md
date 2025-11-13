# Agent Templates

This directory contains pre-configured Claude Code sub-agent templates for the TeamForge project. These templates are designed to help with various aspects of Electron/React/TypeScript development.

## Available Agents

### 🚀 fullstack-developer.md
**Expert in Electron, React, TypeScript, and Node.js**

General-purpose agent for full-stack development tasks. Use when you need:
- Cross-cutting concerns (frontend + backend)
- Architecture decisions
- Feature implementation spanning multiple layers
- General development tasks

**Tools:** All tools available
**Model:** Sonnet

---

### 🎨 frontend-specialist.md
**React, TypeScript, and UI/UX specialist**

Specialized in building beautiful and performant user interfaces. Use for:
- React component development
- UI/UX implementation
- Styling with Tailwind CSS and Radix UI
- Frontend performance optimization
- Accessibility improvements

**Tools:** Read, Grep, Edit, Write, Glob
**Model:** Sonnet

---

### ⚙️ backend-specialist.md
**Electron main process and Node.js specialist**

Expert in server-side logic and IPC communication. Use for:
- Electron main process development
- IPC handler implementation
- File system operations
- Native API integration
- Backend logic and data processing

**Tools:** Read, Grep, Edit, Write, Glob, Bash
**Model:** Sonnet

---

### 🔍 code-reviewer.md
**Code quality and best practices reviewer**

Reviews code for quality, maintainability, and potential issues. Use for:
- Code review before commits
- Identifying bugs and anti-patterns
- Security vulnerability checks
- Performance optimization suggestions
- Best practice enforcement

**Tools:** Read, Grep, Glob
**Model:** Sonnet

---

### 🐛 debugger.md
**Bug hunting and troubleshooting specialist**

Expert at finding and fixing bugs. Use for:
- Investigating error messages
- Debugging React issues
- Troubleshooting Electron IPC problems
- Analyzing stack traces
- Root cause analysis

**Tools:** Read, Grep, Glob, Bash
**Model:** Sonnet

---

### 🔒 security-auditor.md
**Security specialist and vulnerability finder**

Focused on security best practices and vulnerability detection. Use for:
- Security audits
- Electron security configuration review
- XSS and injection vulnerability checks
- Input validation review
- Dependency security analysis

**Tools:** Read, Grep, Glob
**Model:** Sonnet

---

### 📝 documentation-writer.md
**Technical writing and documentation specialist**

Creates clear, comprehensive documentation. Use for:
- Writing README files
- API documentation
- Code comments and JSDoc
- User guides
- Architecture documentation

**Tools:** Read, Grep, Glob, Edit, Write
**Model:** Sonnet

## How to Use

### Option 1: Copy to Your Project
Copy any template to your project's `.claude/agents/` directory:

```bash
cp agents_template/fullstack-developer.md .claude/agents/
```

### Option 2: Use TeamForge UI
1. Open TeamForge
2. Navigate to "Agents" tab
3. Click "New Agent"
4. Copy content from a template file
5. Customize as needed
6. Save

### Option 3: Import as Library
Add these templates to TeamForge's agent library for easy access across projects.

## Customization

Each template can be customized by modifying the YAML frontmatter:

```yaml
---
name: agent-name          # Lowercase with dashes
description: When to use  # Clear description
tools: Read, Grep         # Comma-separated or "all"
model: sonnet            # sonnet, opus, haiku, or inherit
---
```

You can also customize the system prompt to add project-specific context or requirements.

## Agent Chaining

These agents work well in chains for complex tasks:

**Example 1: Feature Development**
1. `fullstack-developer` - Implements the feature
2. `code-reviewer` - Reviews the implementation
3. `documentation-writer` - Documents the feature

**Example 2: Bug Investigation**
1. `debugger` - Identifies the root cause
2. `security-auditor` - Checks if it's a security issue
3. `fullstack-developer` - Fixes the bug
4. `code-reviewer` - Reviews the fix

**Example 3: UI Enhancement**
1. `frontend-specialist` - Implements the UI
2. `security-auditor` - Checks for XSS vulnerabilities
3. `documentation-writer` - Updates user docs

## Best Practices

1. **Choose the Right Agent**: Use the most specific agent for the task
2. **Chain Agents**: Combine multiple agents for complex workflows
3. **Customize Templates**: Adapt templates to your project's needs
4. **Keep Updated**: Review and update templates as the project evolves
5. **Document Workflows**: Define standard agent chains for common tasks

## Contributing

When adding new agent templates:
1. Follow the existing format (YAML frontmatter + markdown)
2. Clearly define the agent's purpose and expertise
3. Specify appropriate tools for the agent's tasks
4. Choose the right model (sonnet for most cases, opus for complex reasoning)
5. Include comprehensive instructions in the system prompt
6. Add examples and best practices
7. Update this README with the new agent

## Notes

- All templates use **Sonnet** as the default model (good balance of capability and speed)
- Tools are restricted per agent to prevent unnecessary operations
- System prompts are comprehensive to guide the agent's behavior
- Templates follow Claude Code sub-agent best practices

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0
**Maintained by:** TeamForge Project

# Agent Templates Library

This directory contains 70+ pre-configured Claude Code sub-agent templates organized by technology and expertise area. These templates are designed to help with all aspects of software development, from initial analysis to deployment.

## 📁 Directory Structure

```
agents_template/
├── languages/           # Language-specific experts (11 agents)
├── frontend/            # Frontend frameworks & UI (7 agents)
├── backend/             # Backend frameworks & APIs (7 agents)
├── specialized/         # Specialized technologies (6 agents)
├── devops/              # DevOps & infrastructure (5 agents)
├── database/            # Database specialists (5 agents)
├── mobile/              # Mobile development (4 agents)
├── cloud/               # Cloud platforms (4 agents)
├── testing/             # Testing strategies (3 agents)
├── project-management/  # PM & planning (3 agents)
├── data-science/        # ML & data analysis (3 agents)
├── code-quality/        # Code quality & review (3 agents)
├── architecture/        # System design (3 agents)
├── security/            # Security & compliance (2 agents)
├── performance/         # Performance optimization (2 agents)
└── documentation/       # Technical writing (2 agents)
```

## 🚀 Quick Start

### Using TeamForge (Recommended)

1. **Configure Agent Repository** (in Configuration tab):
   ```
   Repository URL: https://github.com/your-org/teamforge-agents.git
   Branch: main
   ```

2. **Sync Repository**:
   - Click "Sync Repository" button
   - Agents will be automatically loaded

3. **Select Agents**:
   - Navigate to "Agents" tab
   - Browse by category
   - Select agents for your project

4. **Deploy**:
   - Click "Deploy to Project"
   - Agents will be copied to `.claude/agents/`

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/your-org/teamforge-agents.git

# Copy specific agents to your project
cp teamforge-agents/languages/python-expert.md .claude/agents/
cp teamforge-agents/frontend/react-expert.md .claude/agents/

# Or copy entire categories
cp teamforge-agents/devops/*.md .claude/agents/
```

## 📚 Agent Categories

### 💻 Languages (11 agents)
- **Python Expert** - Python development, libraries, best practices
- **JavaScript Expert** - Modern JavaScript, ES6+, Node.js
- **TypeScript Expert** - TypeScript types, generics, advanced patterns
- **Rust Expert** - Rust programming, ownership, safety
- **Go Expert** - Go development, concurrency, microservices
- **Java Expert** - Java/Spring development, JVM optimization
- **C++ Expert** - Modern C++, performance, memory management
- **C# Expert** - .NET development, LINQ, async patterns
- **Ruby Expert** - Ruby/Rails development, metaprogramming
- **PHP Expert** - Modern PHP, Laravel, Symfony
- **Swift Expert** - iOS development, SwiftUI, Combine

### 🎨 Frontend (7 agents)
- **React Expert** - React hooks, state management, performance
- **Vue Expert** - Vue 3 composition API, Pinia, Nuxt
- **Angular Expert** - Angular patterns, RxJS, TypeScript
- **Svelte Expert** - Svelte/SvelteKit, reactive programming
- **HTML/CSS Expert** - Semantic HTML, modern CSS, responsive design
- **Tailwind Expert** - Tailwind CSS, custom components, optimization
- **UI/UX Specialist** - Design systems, accessibility, user experience

### ⚙️ Backend (7 agents)
- **Node.js Expert** - Express, Fastify, async patterns
- **Django Expert** - Django ORM, REST framework, async views
- **Flask Expert** - Flask blueprints, extensions, RESTful APIs
- **FastAPI Expert** - FastAPI patterns, async endpoints, Pydantic
- **Spring Boot Expert** - Spring ecosystem, dependency injection
- **Ruby on Rails Expert** - Rails conventions, ActiveRecord, concerns
- **ASP.NET Expert** - ASP.NET Core, Entity Framework, middleware

### 🔧 Specialized (6 agents)
- **GraphQL Expert** - Schema design, resolvers, federation
- **WebSocket Expert** - Real-time communication, Socket.IO
- **Electron Expert** - Desktop apps, IPC, native integration
- **WebAssembly Expert** - WASM compilation, performance optimization
- **PWA Expert** - Progressive web apps, service workers
- **Browser Extension Expert** - Chrome/Firefox extensions, manifest V3

### 🚢 DevOps (5 agents)
- **Docker Expert** - Containerization, multi-stage builds, optimization
- **Kubernetes Expert** - K8s deployments, services, scaling
- **CI/CD Expert** - GitHub Actions, GitLab CI, automation
- **Infrastructure as Code** - Terraform, CloudFormation, Ansible
- **Monitoring Expert** - Prometheus, Grafana, logging strategies

### 🗄️ Database (5 agents)
- **PostgreSQL Expert** - Advanced queries, indexes, performance
- **MySQL Expert** - Query optimization, replication, sharding
- **MongoDB Expert** - Document design, aggregation, indexes
- **Redis Expert** - Caching strategies, pub/sub, data structures
- **Elasticsearch Expert** - Search optimization, aggregations, mappings

### 📱 Mobile (4 agents)
- **iOS Developer** - SwiftUI, UIKit, Core Data
- **Android Developer** - Kotlin, Jetpack Compose, architecture
- **React Native Expert** - Cross-platform development, native modules
- **Flutter Expert** - Dart, widgets, state management

### ☁️ Cloud (4 agents)
- **AWS Expert** - EC2, S3, Lambda, CloudFormation
- **Azure Expert** - Azure services, ARM templates, DevOps
- **GCP Expert** - Google Cloud Platform, App Engine, BigQuery
- **Serverless Expert** - Lambda, serverless patterns, FaaS

### 🧪 Testing (3 agents)
- **Testing Strategist** - Test plans, coverage, automation
- **End-to-End Tester** - Playwright, Cypress, integration tests
- **Performance Tester** - Load testing, benchmarking, profiling

### 📋 Project Management (3 agents)
- **Requirements Analyst** - Requirements gathering, user stories
- **Technical Writer** - Documentation, API docs, guides
- **DevOps Manager** - Release planning, deployment strategies

### 📊 Data Science (3 agents)
- **Data Scientist** - ML models, data analysis, visualization
- **ML Engineer** - Model training, deployment, MLOps
- **Data Engineer** - ETL pipelines, data warehousing, processing

### ✅ Code Quality (3 agents)
- **Code Reviewer** - Best practices, anti-patterns, suggestions
- **Refactoring Expert** - Code improvement, design patterns
- **Static Analyzer** - Linting, type checking, security scanning

### 🏗️ Architecture (3 agents)
- **System Architect** - Architecture design, scalability, patterns
- **API Designer** - API design, RESTful, versioning
- **Microservices Expert** - Service design, communication, patterns

### 🔒 Security (2 agents)
- **Security Auditor** - Vulnerability scanning, OWASP, penetration testing
- **Compliance Specialist** - GDPR, SOC2, security standards

### ⚡ Performance (2 agents)
- **Performance Optimizer** - Profiling, optimization, caching
- **Database Optimizer** - Query optimization, indexing, tuning

### 📖 Documentation (2 agents)
- **Documentation Writer** - README, guides, tutorials
- **API Documenter** - OpenAPI, Swagger, API reference

## 🎯 Usage Examples

### Example 1: Full-Stack Web Application

**Team Configuration:**
```yaml
Team: Full-Stack Web App
Agents:
  1. Requirements Analyst    # Gather requirements
  2. System Architect        # Design architecture
  3. React Expert            # Build frontend
  4. Node.js Expert          # Build backend
  5. PostgreSQL Expert       # Design database
  6. Testing Strategist      # Create tests
  7. Code Reviewer           # Review code
  8. Documentation Writer    # Write docs
  9. CI/CD Expert            # Setup deployment
```

### Example 2: Microservices Migration

**Team Configuration:**
```yaml
Team: Microservices Migration
Agents:
  1. System Architect        # Design microservices
  2. API Designer            # Design service APIs
  3. Microservices Expert    # Implement services
  4. Docker Expert           # Containerize
  5. Kubernetes Expert       # Orchestrate
  6. Monitoring Expert       # Add observability
  7. Security Auditor        # Security review
```

### Example 3: Mobile App Development

**Team Configuration:**
```yaml
Team: Mobile App
Agents:
  1. React Native Expert     # Build app
  2. API Designer            # Design backend API
  3. Node.js Expert          # Build API
  4. MongoDB Expert          # Design data model
  5. End-to-End Tester       # Test app
  6. Performance Optimizer   # Optimize performance
  7. Documentation Writer    # User & dev docs
```

### Example 4: Data Pipeline Project

**Team Configuration:**
```yaml
Team: Data Pipeline
Agents:
  1. Data Engineer           # Design pipeline
  2. Python Expert           # Implement ETL
  3. PostgreSQL Expert       # Data warehouse
  4. Docker Expert           # Containerize
  5. AWS Expert              # Deploy to cloud
  6. Monitoring Expert       # Add monitoring
  7. Data Scientist          # Analytics & ML
```

## 🔧 Agent Configuration

### Agent Frontmatter Format

```yaml
---
name: agent-name
description: Clear description of when to use this agent
category: frontend
tags: [react, hooks, performance]
tools: ["*"]  # or specific: ["Read", "Write", "Edit", "Bash"]
model: sonnet  # sonnet | opus | haiku
---

# Agent System Prompt

Detailed instructions, expertise areas, best practices...
```

### Available Models

- **sonnet** (default) - Balanced capability and speed, recommended for most tasks
- **opus** - Most capable, use for complex reasoning and architecture
- **haiku** - Fastest, use for simple tasks and quick iterations

### Available Tools

- **"*"** - All tools (Read, Write, Edit, Glob, Grep, Bash, etc.)
- **Specific tools** - Restrict to: `["Read", "Grep", "Glob"]` for read-only agents

### Customizing Agents

1. **Add Project Context:**
   ```markdown
   ## Project-Specific Context

   This project uses:
   - React 18 with TypeScript
   - Zustand for state management
   - Tailwind CSS for styling
   - Vite as build tool
   ```

2. **Add Custom Instructions:**
   ```markdown
   ## Custom Guidelines

   - Always use functional components with hooks
   - Prefer composition over inheritance
   - Write tests for all new features
   - Follow the project's ESLint rules
   ```

3. **Modify Tool Access:**
   ```yaml
   # Read-only agent
   tools: ["Read", "Grep", "Glob"]

   # Development agent
   tools: ["Read", "Write", "Edit", "Bash"]

   # Full access
   tools: ["*"]
   ```

## 🔄 Agent Chaining Best Practices

### Sequential Workflow
Agents hand off work in a defined order:
```
Architect → Developer → Code Reviewer → Tester → Deployer
```

### Parallel Workflow
Multiple agents work independently:
```
Frontend Expert + Backend Expert + Database Expert
↓
Integration Specialist
```

### Iterative Workflow
Agents work in cycles:
```
Developer → Code Reviewer → Developer (fixes) → Tester
```

## 📝 Configuration Examples

### `.teamforge/config.json`

```json
{
  "project": {
    "name": "MyApp",
    "type": "web-application",
    "technologies": ["react", "node", "postgres"]
  },
  "agents": [
    {
      "id": "react-expert",
      "enabled": true,
      "customInstructions": "Follow our component structure"
    },
    {
      "id": "node-expert",
      "enabled": true,
      "customInstructions": "Use Express middleware pattern"
    }
  ],
  "teams": [
    {
      "id": "feature-team",
      "name": "Feature Development Team",
      "workflow": ["react-expert", "node-expert", "code-reviewer"]
    }
  ]
}
```

### Individual Agent File (`.claude/agents/react-expert.md`)

```markdown
---
name: react-expert
description: Expert in React development with hooks and performance optimization
category: frontend
tags: [react, hooks, jsx, performance]
tools: ["*"]
model: sonnet
---

# React Expert Agent

You are an expert React developer specializing in modern React development...

## Project Context
This project uses React 18 with TypeScript and Zustand for state management.

## Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility best practices
- Write comprehensive tests with React Testing Library
```

## 🌟 Pro Tips

1. **Start Small**: Begin with 2-3 agents, expand as needed
2. **Customize Templates**: Adapt agents to your project's stack
3. **Use Teams**: Create reusable team workflows for common tasks
4. **Hot Reload**: Use TeamForge's hot reload to update agents without restart
5. **Version Control**: Keep your customized agents in git
6. **Document Workflows**: Define and document your team workflows
7. **Regular Updates**: Sync with the main repository for new agents
8. **Mix and Match**: Combine agents from different categories
9. **Model Selection**: Use Opus for architecture, Sonnet for development, Haiku for quick tasks
10. **Tool Restriction**: Limit tools for security and focused agent behavior

## 🔍 Finding the Right Agent

### By Technology
- **React project?** → `frontend/react-expert.md`
- **Python backend?** → `languages/python-expert.md` + `backend/django-expert.md`
- **Need deployment?** → `devops/ci-cd-expert.md` + `devops/docker-expert.md`

### By Task
- **Code review** → `code-quality/code-reviewer.md`
- **Bug fixing** → `specialized/debugger.md`
- **Performance issues** → `performance/performance-optimizer.md`
- **Security audit** → `security/security-auditor.md`
- **Documentation** → `documentation/documentation-writer.md`

### By Phase
- **Planning** → `project-management/requirements-analyst.md`
- **Design** → `architecture/system-architect.md`
- **Development** → Technology-specific agents
- **Testing** → `testing/testing-strategist.md`
- **Deployment** → `devops/ci-cd-expert.md`
- **Maintenance** → `code-quality/refactoring-expert.md`

## 🤝 Contributing

To add new agents to this library:

1. **Choose the Right Category**: Place agent in appropriate directory
2. **Follow the Template**: Use consistent frontmatter and structure
3. **Be Specific**: Clear description, expertise areas, use cases
4. **Test Thoroughly**: Verify agent works as expected
5. **Document**: Update this README with the new agent
6. **Submit PR**: Create pull request with clear description

## 📊 Statistics

- **Total Agents**: 70+
- **Categories**: 16
- **Languages Supported**: 11
- **Frontend Frameworks**: 7
- **Backend Frameworks**: 7
- **Cloud Platforms**: 4
- **Database Systems**: 5

## 🔗 Resources

- [Claude Code Documentation](https://code.claude.com/docs)
- [TeamForge GitHub](https://github.com/your-org/teamforge)
- [Agent Best Practices](https://code.claude.com/docs/agents)
- [Team Workflows Guide](https://code.claude.com/docs/teams)

## 📜 License

MIT License - See LICENSE file for details

---

**Version**: 2.0.0
**Last Updated**: 2025-11-16
**Maintained by**: TeamForge Community
**Repository**: https://github.com/your-org/teamforge-agents

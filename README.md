# TeamForge 🔨

> **Visual interface to configure Claude Code sub-agents for your git projects**

TeamForge is a cross-platform desktop application built with Tauri 2.0 and React that simplifies the creation and management of Claude Code sub-agents. Select agents from a comprehensive library, customize them for your project, and generate ready-to-use configurations.

## ✨ Features

- 🎯 **Smart Project Analysis** - Automatically detects your project type and technologies
- 🤖 **30+ Pre-built Agents** - Comprehensive library covering development, testing, documentation, DevOps, and more
- 🔍 **Intelligent Suggestions** - Get agent recommendations based on your tech stack
- 📝 **Advanced Agent Builder** - Create and customize agents with Monaco Editor
- 🔄 **Workflow Management** - Define sequential workflows between agents
- 🌳 **Git Integration** - Clone repositories or work with local folders
- 💾 **Configuration Management** - Save and reuse agent teams with presets
- ✅ **Validation** - Built-in config validation and best practices
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS
- 🖥️ **Cross-Platform** - Windows, macOS, and Linux support

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ and cargo
- **Git** (for repository cloning)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/teamforge.git
cd teamforge

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run tauri:dev
```

### Build

```bash
# Build for production
npm run tauri:build
```

## 📖 Usage

### 1. Select Your Project

Choose between:
- **Local Folder** - Browse to an existing project on your computer
- **Git Clone** - Clone a repository from a Git URL

### 2. Analyze Your Project

TeamForge automatically:
- Detects project type (Web, API, Mobile, Desktop, Library)
- Identifies technologies (React, Node.js, Python, Rust, etc.)
- Suggests relevant agents based on your stack

### 3. Choose Your Agents

Browse and select from 30+ pre-built agents:
- **Development**: Backend, Frontend, Fullstack, Mobile, API Designer
- **Testing**: Test Engineer, QA, E2E Tester
- **Documentation**: Tech Writer, API Documenter, README Specialist
- **Architecture**: Solution Architect, Code Reviewer, Refactoring Specialist
- **DevOps**: DevOps Engineer, Docker Specialist, CI/CD Expert
- **Database**: Database Designer, Query Optimizer
- **Security**: Security Auditor, Dependency Checker
- **Performance**: Performance Optimizer
- And more!

### 4. Configure Workflow (Optional)

Define a sequential workflow for your agents:
```
1. Backend Developer
2. Code Reviewer
3. Test Engineer
4. Tech Writer
```

### 5. Generate Configuration

TeamForge creates:
- `.claude/agents/*.md` - Claude Code agent files
- `.teamforge/config.json` - Main configuration
- `.teamforge/presets/` - Reusable team presets

## 🏗️ Architecture

### Technology Stack

**Backend (Rust)**
- Tauri 2.0 - Desktop application framework
- git2 - Git operations
- serde - Serialization
- walkdir - File system traversal

**Frontend (React)**
- React 18 - UI library
- TypeScript - Type safety
- Zustand - State management
- Tailwind CSS - Styling
- Radix UI - Component primitives
- Monaco Editor - Code editing

### Project Structure

```
TeamForge/
├── src/                  # React frontend
│   ├── components/       # UI components
│   ├── hooks/            # Custom hooks
│   ├── stores/           # Zustand stores
│   ├── services/         # API wrappers
│   └── types/            # TypeScript types
│
├── src-tauri/            # Rust backend
│   ├── src/
│   │   ├── commands/     # Tauri commands
│   │   ├── services/     # Business logic
│   │   ├── models/       # Data structures
│   │   ├── embedded/     # Agent library
│   │   └── utils/        # Helpers
│   └── Cargo.toml
│
└── .claude/              # Claude Code agents (for TeamForge itself!)
    └── agents/           # Self-development agents
```

## 🤝 Contributing

Contributions are welcome! TeamForge uses Claude Code for its own development.

### Development with Claude Code

TeamForge includes specialized agents for its own development:
- `fullstack-developer` - General development
- `rust-specialist` - Backend Rust development
- `react-specialist` - Frontend React development
- `code-reviewer` - Code reviews
- `tech-writer` - Documentation

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and checks
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📚 Documentation

- [Architecture Guide](docs/architecture.md) - System design and patterns
- [Agent Library](docs/agents.md) - Complete agent reference
- [API Reference](docs/api.md) - Tauri commands and TypeScript API
- [Contributing](docs/contributing.md) - Development guidelines

## 🐛 Troubleshooting

### Build Issues

If you encounter build errors:
```bash
# Clean and rebuild
npm run clean
npm install
npm run tauri:build
```

### Rust/Cargo Not Found

Ensure Rust is installed and in your PATH:
```bash
rustc --version
cargo --version
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Claude Code](https://code.claude.com) - AI-powered coding assistant
- [Tauri](https://tauri.app) - Desktop application framework
- [React](https://react.dev) - UI library
- The open-source community

---

**Built with ❤️ using Tauri, React, and Claude Code**

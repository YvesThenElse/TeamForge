# GOAL.md - Étude Comparative Multi-AI pour TeamForge

## Objectif

Faire évoluer TeamForge d'un outil de gestion de configuration Claude Code vers une **plateforme de gestion multi-AI** supportant :
- **Claude Code** (Anthropic)
- **Gemini CLI** (Google)
- **Cline** (Open Source / VS Code)
- Architecture extensible pour d'autres assistants AI futurs

---

## 1. Tableau Comparatif des Fonctionnalités

### 1.1 Constitution / Instructions Système

| Aspect | Claude Code | Gemini CLI | Cline |
|--------|-------------|------------|-------|
| **Fichier principal** | `CLAUDE.md` | `GEMINI.md` | `.clinerules` |
| **Format** | Markdown libre | Markdown libre | Markdown ou dossier `.clinerules/` |
| **Hiérarchie** | Global (`~/.claude/`) → Projet → Parents | Global (`~/.gemini/`) → Projet → Parents | Projet uniquement |
| **Fichier local** | `CLAUDE.local.md` | Non documenté | N/A |
| **Import/Include** | `@fichier.md` | `@fichier.md` | Non natif |
| **Génération auto** | `/init` | Non | Non |
| **Mémoire persistante** | Non natif | `/memory add` | Memory Bank (`memory-bank/`) |

### 1.2 Sous-Agents / Agents Spécialisés

| Aspect | Claude Code | Gemini CLI | Cline |
|--------|-------------|------------|-------|
| **Support** | Oui (natif) | Non natif | Via MCP uniquement |
| **Emplacement** | `.claude/agents/` ou `~/.claude/agents/` | N/A | N/A |
| **Format** | Markdown + YAML frontmatter | N/A | N/A |
| **Invocation** | Automatique via Task tool | N/A | N/A |
| **Parallélisme** | Jusqu'à 10 agents | N/A | N/A |
| **Outils par agent** | Configurable (Read, Write, Edit, Bash, etc.) | N/A | N/A |

### 1.3 Skills / Commandes Personnalisées

| Aspect | Claude Code | Gemini CLI | Cline |
|--------|-------------|------------|-------|
| **Nom** | Skills / Slash Commands | Custom Extensions | Custom Tools (MCP) |
| **Emplacement** | `.claude/commands/` `.claude/skills/` | Via MCP ou extensions | Via MCP servers |
| **Format** | Markdown avec `$ARGUMENTS` | Dépend de l'extension | MCP protocol |
| **Invocation** | `/commande` ou automatique (skills) | `/commande` ou `@tool` | Via MCP |
| **Paramètres** | `$ARGUMENTS` dans le fichier | Variable | Selon MCP |

### 1.4 Hooks / Callbacks

| Aspect | Claude Code | Gemini CLI | Cline |
|--------|-------------|------------|-------|
| **Support** | Oui (natif) | Non natif | Non natif |
| **Types** | PreToolUse, PostToolUse, PermissionRequest, SessionEnd | N/A | N/A |
| **Configuration** | `.claude/settings.json` | N/A | N/A |
| **Blocage** | Exit code 2 = bloquer | N/A | N/A |
| **Format matcher** | Regex/String (ex: `"Edit\|Write"`) | N/A | N/A |

### 1.5 Serveurs MCP (Model Context Protocol)

| Aspect | Claude Code | Gemini CLI | Cline |
|--------|-------------|------------|-------|
| **Support** | Oui | Oui | Oui (natif fort) |
| **Configuration** | `.claude/settings.json` | `~/.gemini/settings.json` | VS Code settings ou `.clinerules` |
| **Format** | JSON (mcpServers) | JSON (mcpServers) | JSON |
| **Variables env** | Supportées | Supportées | Supportées |
| **Marketplace** | Non | Non | Oui (intégré) |
| **Création dynamique** | Non | Non | Oui ("add a tool") |

### 1.6 Permissions / Sécurité

| Aspect | Claude Code | Gemini CLI | Cline |
|--------|-------------|------------|-------|
| **Fichier** | `.claude/settings.json` | `~/.gemini/settings.json` | VS Code settings |
| **Types** | allow/deny avec patterns | Trusted folders, sandbox | Approbation par action |
| **Patterns** | `Bash(npm:*)`, `WebFetch(domain:x)` | Folder-based policies | N/A |
| **Sandbox** | Non natif | Oui (sécurisé) | Non |

---

## 2. Mapping des Concepts

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MODÈLE UNIFIÉ TEAMFORGE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   CLAUDE     │    │    GEMINI    │    │    CLINE     │              │
│  │     CODE     │    │     CLI      │    │              │              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │
│         │                   │                   │                       │
│         ▼                   ▼                   ▼                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    CONSTITUTION / RULES                          │  │
│  │  TeamForge Format ──► CLAUDE.md | GEMINI.md | .clinerules        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         AGENTS                                   │  │
│  │  TeamForge Format ──► .claude/agents/ | (N/A) | (via MCP)        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     SKILLS / COMMANDS                            │  │
│  │  TeamForge Format ──► .claude/commands/ | Extensions | MCP Tools │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                          HOOKS                                   │  │
│  │  TeamForge Format ──► settings.json | (N/A) | (N/A)              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      MCP SERVERS                                 │  │
│  │  TeamForge Format ──► settings.json | settings.json | VS Code    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      PERMISSIONS                                 │  │
│  │  TeamForge Format ──► settings.json | settings.json | (Manual)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Analyse des Écarts (Gap Analysis)

### 3.1 Fonctionnalités avec Parité Possible

| Fonctionnalité | Stratégie d'Unification |
|----------------|-------------------------|
| **Constitution** | Format Markdown unifié exportable vers CLAUDE.md, GEMINI.md, .clinerules |
| **MCP Servers** | Configuration JSON commune, export vers chaque format settings.json |
| **Variables d'environnement** | Supporté par les 3 systèmes |

### 3.2 Fonctionnalités Partielles

| Fonctionnalité | Claude | Gemini | Cline | Stratégie |
|----------------|--------|--------|-------|-----------|
| **Agents** | Natif | N/A | Via MCP | Générer pour Claude, documenter limitations pour autres |
| **Hooks** | Natif | N/A | N/A | Fonctionnalité Claude-only, documenter |
| **Memory Bank** | N/A | `/memory` | Natif | Générer pour Cline, adapter pour Gemini |
| **Skills** | Natif | Extensions | MCP | Approche hybride selon le système |

### 3.3 Fonctionnalités Exclusives

| Système | Fonctionnalités Exclusives |
|---------|---------------------------|
| **Claude Code** | Hooks, Sous-agents natifs, Plugins |
| **Gemini CLI** | Sandbox sécurisé, Trusted folders, `/memory` commands |
| **Cline** | MCP Marketplace, Création dynamique d'outils, Computer use |

---

## 4. Architecture Proposée

### 4.1 Modèle de Données Unifié

```typescript
// Format normalisé TeamForge
interface TeamForgeConfig {
  version: string;
  project: ProjectInfo;

  // Constitution (CLAUDE.md / GEMINI.md / .clinerules)
  constitution: {
    global: string;        // Instructions globales
    sections: Section[];   // Sections organisées
    includes: string[];    // Fichiers à inclure
  };

  // Agents (Claude-specific, avec fallback)
  agents: Agent[];

  // Skills/Commands
  skills: Skill[];

  // Hooks (Claude-specific)
  hooks: Hook[];

  // MCP Servers (universel)
  mcpServers: McpServer[];

  // Permissions
  permissions: Permission[];

  // Memory/Context (Cline/Gemini specific)
  memory: MemoryConfig;
}
```

### 4.2 Système d'Export Multi-Cibles

```
TeamForge Config (JSON/YAML unifié)
         │
         ▼
    ┌────────────┐
    │  Exporter  │
    │   Engine   │
    └────────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    ▼         ▼            ▼            ▼
┌───────┐ ┌───────┐  ┌──────────┐  ┌────────┐
│Claude │ │Gemini │  │  Cline   │  │ Future │
│ Code  │ │  CLI  │  │          │  │  ...   │
└───────┘ └───────┘  └──────────┘  └────────┘
    │         │            │
    ▼         ▼            ▼
.claude/  ~/.gemini/   .clinerules/
├─agents/  ├─GEMINI.md  └─*.md
├─commands/├─settings.json
├─settings.json
└─CLAUDE.md
```

### 4.3 Système de Plugins/Providers

```typescript
interface AISystemProvider {
  id: string;                          // "claude-code", "gemini-cli", "cline"
  name: string;
  version: string;

  // Capacités supportées
  capabilities: {
    constitution: boolean;
    agents: boolean;
    skills: boolean;
    hooks: boolean;
    mcpServers: boolean;
    memory: boolean;
  };

  // Méthodes d'export
  exportConstitution(config: Constitution): string;
  exportAgents(agents: Agent[]): AgentFiles[];
  exportSkills(skills: Skill[]): SkillFiles[];
  exportHooks(hooks: Hook[]): HookConfig | null;
  exportMcpServers(servers: McpServer[]): McpConfig;
  exportPermissions(permissions: Permission[]): PermissionConfig;

  // Méthodes d'import (optionnel)
  importFromPath(path: string): TeamForgeConfig;
}
```

---

## 5. Matrice de Priorité d'Implémentation

### Phase 1 : Fondations Multi-AI

| Priorité | Composant | Justification |
|----------|-----------|---------------|
| P0 | Modèle de données unifié | Base de tout le système |
| P0 | Constitution export (3 systèmes) | Fonctionnalité la plus utilisée |
| P0 | MCP Servers export (3 systèmes) | Supporté par les 3 |
| P1 | Interface Provider extensible | Permet l'ajout facile de nouveaux systèmes |

### Phase 2 : Fonctionnalités Avancées

| Priorité | Composant | Justification |
|----------|-----------|---------------|
| P1 | Agents export (Claude) | Fonctionnalité clé de Claude Code |
| P1 | Skills/Commands export | Productivité utilisateur |
| P2 | Hooks export (Claude) | Fonctionnalité avancée |
| P2 | Memory Bank export (Cline) | Persistance contexte |

### Phase 3 : Extensibilité

| Priorité | Composant | Justification |
|----------|-----------|---------------|
| P2 | Import depuis systèmes existants | Migration utilisateurs |
| P3 | Nouveaux providers (Cursor, Windsurf, etc.) | Extensibilité future |
| P3 | Synchronisation bidirectionnelle | Workflow avancé |

---

## 6. Fichiers et Emplacements par Système

### Claude Code
```
projet/
├── .claude/
│   ├── agents/              # Sous-agents
│   │   └── *.md
│   ├── commands/            # Slash commands
│   │   └── *.md
│   ├── skills/              # Skills (invocation auto)
│   │   └── */
│   ├── settings.json        # Permissions + Hooks + MCP
│   └── settings.local.json  # Overrides locaux
├── CLAUDE.md                # Constitution principale
└── CLAUDE.local.md          # Constitution locale
```

### Gemini CLI
```
~/.gemini/
├── GEMINI.md                # Constitution globale
└── settings.json            # MCP + Config

projet/
├── GEMINI.md                # Constitution projet
└── .gemini/
    └── system.md            # System prompt override (opt)
```

### Cline
```
projet/
├── .clinerules              # OU fichier unique
├── .clinerules/             # OU dossier
│   └── *.md
├── memory-bank/             # Memory Bank
│   ├── projectBrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
└── .vscode/
    └── settings.json        # MCP config (via VS Code)
```

---

## 7. Recommandations d'Architecture Logicielle

### 7.1 Refactoring Nécessaire

1. **Abstraction du système cible**
   - Créer une interface `AISystemProvider`
   - Implémenter un provider par système (Claude, Gemini, Cline)
   - Utiliser un pattern Factory pour l'instanciation

2. **Modèle de données normalisé**
   - Définir un schéma JSON/YAML unifié pour TeamForge
   - Créer des transformateurs bidirectionnels
   - Valider avec Zod (déjà utilisé dans le projet)

3. **Séparation UI / Logic**
   - Isoler la logique d'export dans des services dédiés
   - Permettre l'export en mode headless (CLI)
   - Faciliter les tests unitaires

### 7.2 Nouveaux Composants à Créer

| Composant | Responsabilité |
|-----------|----------------|
| `src/providers/` | Providers par système AI |
| `src/schemas/` | Schémas Zod unifiés |
| `src/transformers/` | Conversion entre formats |
| `src/exporters/` | Génération des fichiers finaux |
| `electron/handlers/multiAiHandlers.js` | Backend multi-AI |

### 7.3 Fichiers Types à Modifier

| Fichier Actuel | Modification |
|----------------|--------------|
| `src/types/` | Ajouter types unifiés multi-AI |
| `src/stores/` | Abstraire pour multi-cibles |
| `src/components/` | UI pour sélection système cible |
| `electron/handlers/` | Généraliser les exports |

---

## 8. Sources

- [Claude Code CLAUDE.md](https://claude.com/blog/using-claude-md-files)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Slash Commands](https://code.claude.com/docs/en/slash-commands)
- [Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli)
- [Gemini CLI Configuration](https://google-gemini.github.io/gemini-cli/docs/cli/gemini-md.html)
- [Cline GitHub](https://github.com/cline/cline)
- [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank)
- [Cline MCP Development](https://docs.cline.bot/mcp/mcp-server-development-protocol)

---

## Conclusion

Ce document définit les bases pour transformer TeamForge en plateforme multi-AI. L'architecture proposée avec le système de Providers permet :

1. **Parité maximale** via un format normalisé unifié
2. **Extensibilité** grâce au pattern Provider/Plugin
3. **Gestion des écarts** avec documentation claire des limitations
4. **Évolutivité** pour intégrer de futurs assistants AI

Le prochain pas sera de définir le schéma JSON/YAML unifié et d'implémenter les premiers providers (Claude, Gemini, Cline).

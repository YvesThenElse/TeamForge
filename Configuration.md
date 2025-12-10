
# Fichiers de Configuration Importants - Claude Code

## 📁 Hiérarchie des fichiers importants

### 1. CLAUDE.md - Mémoire/Instructions

| Fichier | Portée | Git | Usage |
|---------|--------|-----|-------|
| `~/.claude/CLAUDE.md` | Global (toutes sessions) | Non | Préférences personnelles universelles |
| `./CLAUDE.md` | Projet | ✅ Oui | Instructions partagées avec l'équipe |
| `./.claude/CLAUDE.md` | Projet | ✅ Oui | Alternative organisée |
| `./CLAUDE.local.md` | Projet personnel | Non (gitignore auto) | Préférences locales non partagées |
| `./.claude/rules/*.md` | Projet | ✅ Oui | Règles organisées par thème |

---

### 2. settings.json - Permissions & Configuration

| Fichier | Portée | Usage |
|---------|--------|-------|
| `~/.claude/settings.json` | Global utilisateur | Permissions globales, plugins activés |
| `./.claude/settings.json` | Projet | Permissions projet (partagé via git) |
| `./.claude/settings.local.json` | Projet local | Overrides locaux (non commité) |

**Exemple de contenu :**

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./secrets/**)"
    ]
  }
}
```

---

### 3. .mcp.json - Serveurs MCP

| Fichier | Portée | Usage |
|---------|--------|-------|
| `~/.claude.json` | Global | Config MCP utilisateur (recommandé) |
| `./.mcp.json` | Projet (racine) | MCP partagés avec l'équipe |

**Exemple :**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_TOKEN"
      }
    }
  }
}
```

---

### 4. Commandes personnalisées - Slash Commands

| Dossier | Portée | Usage |
|---------|--------|-------|
| `~/.claude/commands/*.md` | Global | Commandes disponibles partout |
| `./.claude/commands/*.md` | Projet | Commandes spécifiques au projet |

**Exemple** `.claude/commands/fix-issue.md` :

```markdown
Analyse et corrige l'issue GitHub : $ARGUMENTS

1. Utilise `gh issue view` pour récupérer les détails
2. Cherche les fichiers concernés
3. Implémente la correction
4. Lance les tests
5. Crée un commit descriptif
```

→ Disponible via `/project:fix-issue 123`

---

### 5. Subagents - Agents spécialisés

| Dossier | Portée |
|---------|--------|
| `~/.claude/agents/*.md` | Global |
| `./.claude/agents/*.md` | Projet |

Permet de créer des agents spécialisés avec leurs propres prompts et permissions.

---

### 6. Hooks - Automatisations

Configurés via `/hooks` ou dans les settings. Permettent d'exécuter des actions automatiques (ex: lancer les tests avant chaque commit).

---

## 📊 Structure complète recommandée

```
~/.claude/
├── CLAUDE.md              # Instructions globales
├── settings.json          # Permissions globales
├── commands/              # Commandes personnelles
│   └── *.md
└── agents/                # Subagents personnels
    └── *.md

~/.claude.json             # Config MCP globale + préférences

./  (racine projet)
├── CLAUDE.md              # Instructions projet (git)
├── CLAUDE.local.md        # Instructions locales (gitignore)
├── .mcp.json              # MCP projet (git)
└── .claude/
    ├── CLAUDE.md          # Alternative organisée
    ├── settings.json      # Permissions projet (git)
    ├── settings.local.json # Permissions locales
    ├── rules/             # Règles par thème
    │   ├── code-style.md
    │   ├── testing.md
    │   └── security.md
    ├── commands/          # Commandes projet
    │   └── *.md
    └── agents/            # Subagents projet
        └── *.md
```

---

## 🔑 Priorité de chargement

Les fichiers sont chargés dans cet ordre (du plus général au plus spécifique) :

1. **Enterprise** (si applicable) → Règles imposées par l'organisation
2. **Global utilisateur** → `~/.claude/`
3. **Projet** → `./CLAUDE.md` et `./.claude/`
4. **Local** → `CLAUDE.local.md` et `settings.local.json`

Les fichiers plus spécifiques peuvent surcharger les paramètres des fichiers plus généraux.

---

## 💡 Bonnes pratiques

### CLAUDE.md

- Utiliser des bullet points courts et déclaratifs
- Éviter les longs paragraphes narratifs
- Ne pas inclure d'informations évidentes
- Toujours proposer une alternative quand on interdit quelque chose

### settings.json

- Protéger les fichiers sensibles (`.env`, `secrets/`)
- Autoriser explicitement les commandes de build/test fréquentes
- Utiliser des patterns glob pour les permissions (`npm run test:*`)

### .mcp.json

- Ne jamais commiter de tokens/clés API en clair
- Utiliser des variables d'environnement (`$GITHUB_TOKEN`)
- Documenter les MCP requis dans le README

### Commands

- Nommer clairement les commandes
- Utiliser `$ARGUMENTS` pour passer des paramètres
- Documenter l'usage attendu dans le fichier

---

## 🚀 Commandes utiles

```bash
# Voir les fichiers mémoire chargés
/memory

# Voir les MCP configurés
/mcp

# Initialiser un CLAUDE.md pour le projet
/init

# Configurer les hooks
/hooks

# Ajouter une instruction à la mémoire (raccourci clavier #)
# Appuyer sur # pendant une session
```

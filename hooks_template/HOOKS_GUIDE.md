# Guide d'Utilisation des Hooks - TeamForge

## Introduction

Les **Hooks** sont des commandes shell qui s'exécutent automatiquement lors d'événements spécifiques du cycle de vie de Claude Code. Ils vous permettent d'automatiser des tâches telles que le formatage de code, les tests, la validation de sécurité, les sauvegardes, et bien plus encore.

## Qu'est-ce qu'un Hook ?

Un hook est composé de trois éléments principaux :

1. **Event** : L'événement qui déclenche le hook (PreToolUse, PostToolUse, SessionStart, etc.)
2. **Matcher** : Un pattern qui filtre quels outils déclenchent le hook (Edit, Write, Bash, etc.)
3. **Command** : La commande shell à exécuter

## Événements Disponibles

| Événement | Description | Cas d'usage typiques |
|-----------|-------------|---------------------|
| `PreToolUse` | Avant l'exécution d'un outil | Validation, protection de fichiers, backups |
| `PostToolUse` | Après l'exécution d'un outil | Formatage auto, tests, linting, git staging |
| `UserPromptSubmit` | Quand l'utilisateur soumet un prompt | Logging, preprocessing |
| `SessionStart` | Au démarrage d'une session | Vérifications initiales, git status |
| `SessionEnd` | À la fin d'une session | Nettoyage, rapports |
| `Stop` | Quand Claude s'arrête | Notifications, finalisation |
| `SubagentStop` | Quand un sous-agent se termine | Monitoring, notifications |
| `PreCompact` | Avant compactage du contexte | Sauvegarde du contexte |
| `Notification` | Sur notification | Alertes personnalisées |

## Variables d'Environnement

Les hooks ont accès à des variables d'environnement contextuelles :

- `$TOOL_NAME` : Nom de l'outil (Edit, Write, Bash, etc.)
- `$TOOL_FILE_PATH` : Chemin du fichier modifié (pour Edit/Write)
- `$TOOL_COMMAND` : Commande exécutée (pour Bash)
- `$TOOL_DESCRIPTION` : Description de l'outil

## Exemples d'Utilisation

### 1. Formatage Automatique TypeScript

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$TOOL_FILE_PATH\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

**Ce que cela fait :**
- S'exécute après chaque Edit ou Write
- Formate automatiquement le fichier avec Prettier
- Ignore les erreurs (|| true) pour ne pas bloquer Claude

### 2. Protection des Fichiers Sensibles

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$TOOL_FILE_PATH\" | grep -qE '\\.env$|\\.secret$'; then echo 'ERROR: Cannot modify protected file' && exit 1; fi"
          }
        ]
      }
    ]
  }
}
```

**Ce que cela fait :**
- S'exécute AVANT chaque Edit ou Write
- Bloque la modification des fichiers .env et .secret
- Affiche un message d'erreur et arrête l'opération

### 3. Auto-Staging Git

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "git add \"$TOOL_FILE_PATH\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

**Ce que cela fait :**
- Ajoute automatiquement les fichiers modifiés au staging git
- Pratique pour préparer des commits progressifs

### 4. Logging des Modifications

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[$(date '+%Y-%m-%d %H:%M:%S')] Modified: $TOOL_FILE_PATH\" >> .claude/changes.log"
          }
        ]
      }
    ]
  }
}
```

**Ce que cela fait :**
- Enregistre toutes les modifications dans un fichier log
- Avec timestamp pour traçabilité

### 5. Tests Automatiques

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$TOOL_FILE_PATH\" | grep -qE '\\.(ts|js)$'; then npm test 2>/dev/null || true; fi"
          }
        ]
      }
    ]
  }
}
```

**Ce que cela fait :**
- Lance les tests automatiquement après modification de fichiers TypeScript/JavaScript
- Détecte rapidement les régressions

## Déploiement de Hooks dans TeamForge

### Étape 1 : Sélectionner un Projet
1. Allez dans l'onglet **Select Project**
2. Choisissez votre projet

### Étape 2 : Explorer la Bibliothèque de Hooks
1. Cliquez sur l'onglet **Hooks** dans la sidebar
2. Parcourez les 25+ hooks prédéfinis
3. Utilisez les filtres par catégorie :
   - Code Quality
   - Security
   - Git Workflow
   - Testing
   - Documentation
   - Logging & Monitoring
   - Safety
   - Notifications
   - Performance

### Étape 3 : Déployer un Hook
1. Cliquez sur un hook pour voir ses détails
2. Vérifiez :
   - La description et le cas d'usage
   - L'événement et le matcher
   - La commande shell qui sera exécutée
   - Les outils requis (prettier, eslint, black, etc.)
3. Cliquez sur **Deploy this hook**
4. Le hook sera ajouté à `.claude/settings.json`

### Étape 4 : Vérifier le Déploiement
- Les hooks déployés apparaissent avec une bordure verte et un badge "Deployed"
- Vous pouvez les retirer en cliquant dessus puis "Remove from project"

## Bonnes Pratiques

### ✅ À Faire

1. **Toujours gérer les erreurs**
   ```bash
   command 2>/dev/null || true
   ```
   Ceci évite de bloquer Claude si la commande échoue

2. **Filtrer les fichiers pertinents**
   ```bash
   if echo "$TOOL_FILE_PATH" | grep -qE '\\.ts$'; then ...
   ```
   Exécutez les hooks seulement sur les bons types de fichiers

3. **Tester en local d'abord**
   Testez vos commandes manuellement avant de les déployer

4. **Utiliser des chemins absolus ou variables**
   Préférez `"$TOOL_FILE_PATH"` aux chemins hardcodés

5. **Documenter vos hooks personnalisés**
   Ajoutez des commentaires dans settings.json

### ❌ À Éviter

1. **Commandes interactives**
   Les hooks ne peuvent pas demander d'input utilisateur

2. **Commandes longues sans timeout**
   Risque de bloquer Claude indéfiniment

3. **Modifications destructives sans backup**
   Utilisez le hook "Backup Before Edit" comme filet de sécurité

4. **Hooks trop verbeux**
   Évitez les echo excessifs qui polluent la sortie

5. **Dépendances non vérifiées**
   Assurez-vous que les outils requis sont installés (prettier, eslint, etc.)

## Hooks Recommandés par Catégorie

### Pour le Développement TypeScript/React
- Auto-Format TypeScript (Prettier)
- Lint on Save (ESLint)
- Run Tests After Code Changes

### Pour la Sécurité
- Protect Environment Files
- Protect Production Files
- Security Scan on File Changes

### Pour Git
- Auto-Stage Git Changes
- Check Git Status on Session Start
- Enforce Commit Message Format

### Pour la Documentation
- Update Documentation Timestamp
- Validate Markdown
- Spell Check Documentation

### Pour le Monitoring
- Log File Changes
- Log Bash Commands
- Desktop Notification on Stop

## Dépannage

### Le hook ne s'exécute pas
1. Vérifiez que le fichier `.claude/settings.json` existe
2. Vérifiez la syntaxe JSON du fichier
3. Vérifiez que l'événement et le matcher correspondent à votre cas

### Le hook bloque Claude
1. Vérifiez que la commande se termine rapidement
2. Ajoutez `2>/dev/null || true` pour ignorer les erreurs
3. Utilisez `&` à la fin pour exécution en arrière-plan (avec précaution)

### Variables d'environnement vides
- Certaines variables ne sont disponibles que pour certains événements
- `$TOOL_FILE_PATH` n'est disponible que pour Edit/Write
- `$TOOL_COMMAND` n'est disponible que pour Bash

## Créer des Hooks Personnalisés

Vous pouvez créer vos propres hooks directement dans `.claude/settings.json` :

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "votre-commande-ici"
          }
        ]
      }
    ]
  }
}
```

**Structure :**
- `hooks` : Objet contenant tous les hooks
- `"EventName"` : Array de matchers pour cet événement
- `matcher` : Pattern regex pour filtrer les outils
- `hooks` : Array de hooks à exécuter
- `type` : Toujours "command" actuellement
- `command` : La commande shell à exécuter

## Ressources

- **Documentation officielle Claude Code :** [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- **Bibliothèque de hooks :** `hooks_template/library.json`
- **Exemples :** Voir les 25 hooks prédéfinis dans TeamForge

## Support

Pour obtenir de l'aide :
1. Consultez ce guide
2. Examinez les hooks prédéfinis comme exemples
3. Testez les commandes manuellement avant de les déployer
4. Vérifiez les logs de Claude Code pour les messages d'erreur

---

*Ce guide est maintenu par le projet TeamForge. Les hooks sont une fonctionnalité puissante de Claude Code - utilisez-les judicieusement !*

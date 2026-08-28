# 📚 Documentation Agent - HAZOP Labs

Bienvenue dans le dossier de documentation du projet HAZOP Labs. Cette documentation est conçue pour être lue par des IA (agents GitHub Copilot) et des développeurs humains.

## 📋 Table des matières

### 1. [Vue d'ensemble du projet](01-project-overview.md)
**Quoi ?** Description complète du projet HAZOP Labs
- Objectifs et vision
- Architecture globale
- Personas utilisateurs
- Modèle de données
- Fonctionnalités principales
- État du développement

**Quand lire ?** En premier pour comprendre le projet

---

### 2. [Stack technique](02-tech-stack.md)
**Quoi ?** Détail complet de la stack technologique
- Frontend (Next.js, React, Tailwind)
- Backend (Node.js, Prisma, SQLite)
- IA (OpenAI, Anthropic, Google, Ollama)
- Services externes
- Variables d'environnement
- Recommandations de déploiement

**Quand lire ?** Pour comprendre les choix techniques

---

### 3. [Schéma de base de données](03-database-schema.md)
**Quoi ?** Documentation complète du schéma Prisma
- Tous les modèles expliqués
- Relations entre entités
- Enums et types
- Index de performance
- Historique des migrations
- Limitations SQLite et migration future

**Quand lire ?** Avant de modifier la DB ou créer de nouvelles features

---

### 4. [Idées de fonctionnalités](04-features-ideas.md)
**Quoi ?** 20+ idées de fonctionnalités à implémenter
- Priorité HAUTE (quick wins)
- Priorité MOYENNE (nice to have)
- Priorité BASSE (future)
- Fonctionnalités innovantes (wow factor)
- Roadmap suggérée
- Critères de priorisation

**Quand lire ?** Pour contribuer au projet ou choisir la prochaine feature

---

### 5. [Décisions d'architecture](05-architecture-decisions.md)
**Quoi ?** ADR (Architecture Decision Records)
- Choix techniques justifiés
- Trade-offs et alternatives
- Sécurité
- Performance
- Testing strategy
- CI/CD
- Évolution future

**Quand lire ?** Pour comprendre POURQUOI les choses sont faites ainsi

---

### 6. [Getting Started](06-getting-started.md)
**Quoi ?** Guide pratique pour développeurs
- Setup initial
- Structure du projet
- Commandes utiles
- Conventions de code
- Debug
- Déploiement
- Ressources
- Checklist avant commit

**Quand lire ?** Pour commencer à coder !

---

## 🎯 Usage pour les IA

### Contexte à donner à Copilot/ChatGPT/Claude

```
Je travaille sur HAZOP Labs, une plateforme SaaS pour études HAZOP assistées par IA.

Stack : Next.js 16 (App Router), React 19, TypeScript, Prisma, SQLite, Tailwind, shadcn/ui

Lis ces fichiers pour comprendre le projet :
- .agent/01-project-overview.md (vision globale)
- .agent/03-database-schema.md (si tu touches à la DB)
- .agent/04-features-ideas.md (pour nouvelles features)
```

### Prompts suggérés

**Pour une nouvelle feature** :
```
Je veux ajouter [feature X]. 
Consulte .agent/04-features-ideas.md pour voir si c'est déjà listé,
puis .agent/03-database-schema.md pour les modèles DB nécessaires,
et enfin .agent/05-architecture-decisions.md pour respecter les patterns.
```

**Pour un bug** :
```
J'ai un bug dans [composant Y].
Consulte .agent/02-tech-stack.md pour comprendre la stack,
et .agent/06-getting-started.md pour les outils de debug.
```

**Pour comprendre une décision** :
```
Pourquoi utilise-t-on SQLite au lieu de PostgreSQL ?
Consulte .agent/05-architecture-decisions.md section "SQLite vs PostgreSQL".
```

---

## 🔄 Maintenance de la documentation

### Quand mettre à jour ?

- ✅ **Nouvelle feature majeure** → Mettre à jour 01-project-overview.md
- ✅ **Nouveau package npm** → Mettre à jour 02-tech-stack.md
- ✅ **Modification DB** → Mettre à jour 03-database-schema.md
- ✅ **Nouvelle idée de feature** → Ajouter dans 04-features-ideas.md
- ✅ **Décision technique importante** → Documenter dans 05-architecture-decisions.md
- ✅ **Nouveau setup step** → Ajouter dans 06-getting-started.md

### Comment mettre à jour ?

1. Éditer le fichier .md concerné
2. Garder le même format (Markdown)
3. Ajouter la date de modification si significatif
4. Commit avec message explicite : `docs: update architecture decisions with Redis caching`

---

## 📝 Format des fichiers

Tous les fichiers suivent ce format :

```markdown
# Titre principal

## 🎯 Section avec emoji

### Sous-section

**Point important en gras**

`Code inline`

\```typescript
// Bloc de code
const example = "value";
\```

- Liste à puces
- Item 2

| Table | Column |
|-------|--------|
| Data  | Value  |
```

---

## 🚀 Contribuer à la documentation

### Pull requests bienvenues !

Si vous trouvez :
- Une erreur ou information obsolète
- Un manque de clarté
- Une section manquante
- Une meilleure façon d'expliquer

→ Ouvrez une PR ou issue !

### Guidelines

- **Clarté** : Expliquer pour quelqu'un qui découvre le projet
- **Concision** : Pas de fluff, aller droit au but
- **Exemples** : Toujours illustrer avec du code
- **Emojis** : Utiliser pour la lisibilité (mais pas trop)
- **Markdown** : Bien formatter (titres, listes, code blocks)

---

## 📊 Statistiques

**Fichiers** : 6 documents
**Lignes** : ~2000 lignes de documentation
**Dernière MAJ** : 2 février 2026
**Auteur principal** : GitHub Copilot + ethancls

---

## 🔗 Liens utiles

### Documentation externe
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [ReactFlow](https://reactflow.dev/)

### Documentation utilisateur
- Voir `/docs` dans l'application
- Ou [app/docs/](../src/app/docs/) dans le code

### Autres ressources
- [HAZOP Methodology](https://en.wikipedia.org/wiki/HAZOP)
- [Process Safety Management](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.119)

---

## 💡 Tips pour bien utiliser cette doc

### Pour un nouveau dev
1. Lire [01-project-overview.md](01-project-overview.md) en entier
2. Survoler [02-tech-stack.md](02-tech-stack.md)
3. Suivre [06-getting-started.md](06-getting-started.md) pour setup
4. Choisir une issue dans [04-features-ideas.md](04-features-ideas.md)
5. Coder en consultant [03-database-schema.md](03-database-schema.md) et [05-architecture-decisions.md](05-architecture-decisions.md)

### Pour une feature précise
1. Vérifier si existe dans [04-features-ideas.md](04-features-ideas.md)
2. Consulter [03-database-schema.md](03-database-schema.md) pour modèles nécessaires
3. Respecter [05-architecture-decisions.md](05-architecture-decisions.md)
4. Coder !

### Pour un bug
1. Reproduire localement ([06-getting-started.md](06-getting-started.md))
2. Comprendre la partie concernée ([02-tech-stack.md](02-tech-stack.md))
3. Fixer en respectant [05-architecture-decisions.md](05-architecture-decisions.md)

---

## ✨ Remerciements

Cette documentation a été créée avec ❤️ pour faciliter le développement et la collaboration sur HAZOP Labs.

**Happy coding! 🚀**

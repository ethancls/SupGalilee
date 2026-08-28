# HAZOP Labs - Vue d'ensemble du projet

## 📋 Description

**HAZOP Labs** est une plateforme web moderne pour la réalisation d'études HAZOP (Hazard and Operability Study) assistées par IA. C'est un outil SaaS multi-tenant qui permet aux équipes d'ingénieurs de procédés de réaliser des analyses de risques collaboratives.

## 🎯 Objectif principal

Digitaliser et automatiser partiellement le processus HAZOP traditionnel :
- **Avant** : Études manuelles, tableaux Excel, réunions longues
- **Après** : Plateforme collaborative avec assistance IA, diagrammes interactifs, analyse en temps réel

## 🎨 Type d'application

- **Catégorie** : SaaS B2B (Business to Business)
- **Architecture** : Application web full-stack
- **Multi-tenancy** : Organisations séparées avec isolation des données
- **Cible** : Entreprises industrielles (chimie, pétrole, pharmaceutique)

## 🏗️ Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  - App Router (React Server Components)                    │
│  - Client Components interactifs                           │
│  - UI moderne avec Tailwind + shadcn/ui                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes (Next.js)                      │
│  - RESTful endpoints                                        │
│  - Authentification JWT                                     │
│  - Validation des données                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                       │
│  - Prisma ORM                                              │
│  - AI Client (multi-providers)                             │
│  - Email service (Resend)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                        │
│  - Données relationnelles                                  │
│  - Migrations Prisma                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services (AI APIs)                    │
│  - OpenAI (GPT)                                            │
│  - Anthropic (Claude)                                      │
│  - Google (Gemini)                                         │
│  - Ollama (local)                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🎭 Personas utilisateurs

### 1. **Ingénieur HAZOP Lead**
- Crée et gère les projets HAZOP
- Configure les nœuds et le diagramme de flux
- Utilise l'IA pour accélérer l'analyse
- Exporte les rapports finaux

### 2. **Membre de l'équipe HAZOP**
- Participe à l'analyse des déviations
- Documente les causes/conséquences
- Collabore avec l'équipe

### 3. **Admin Organisation**
- Gère les membres et les permissions
- Configure l'IA (API keys)
- Gère les paramètres de l'organisation

### 4. **Responsable HSE (Santé, Sécurité, Environnement)**
- Consulte les études terminées
- Vérifie les recommandations
- Exporte pour audit/conformité

## 📊 Modèle de données principal

```
Organization (Multi-tenant root)
    ├── Members (Users with roles)
    ├── Teams (Optional grouping)
    ├── AI Settings
    └── Projects
        └── Nodes (Process equipment)
            └── Deviations (HAZOP analysis items)
                - Guide Word + Parameter
                - Causes, Consequences
                - Safeguards, Recommendations
                - Risk assessment (likelihood × severity)
```

## 🔐 Niveaux de permissions

### Organisation
- **OWNER** : Tous les droits (supprimer l'org, gérer IA)
- **ADMIN** : Gestion membres, projets, paramètres
- **MEMBER** : Créer/éditer projets
- **VIEWER** : Lecture seule

### Équipe
- **LEAD** : Gestion de l'équipe
- **MEMBER** : Participation

## 🚀 Fonctionnalités principales actuelles

### 1. Gestion d'organisations
- Création d'organisations
- Système d'invitations par email
- Gestion des membres et rôles

### 2. Gestion de projets HAZOP
- CRUD projets
- Statuts : Draft, In Progress, Review, Completed, Archived
- Métadonnées : nom, description, créateur

### 3. Éditeur de flux (Flow Diagram)
- Interface drag & drop avec ReactFlow
- Nœuds de procédés (vaisseaux, pompes, échangeurs...)
- Connexions entre nœuds
- Positionnement personnalisable

### 4. Analyse HAZOP
- Création de nœuds de procédés
- Paramètres HAZOP : Flow, Temperature, Pressure, Level, pH, etc.
- Guide words : NO, MORE, LESS, REVERSE, AS WELL AS, PART OF...
- Analyse des déviations (causes, conséquences, safeguards)
- Évaluation des risques (likelihood × severity)

### 5. Assistant IA
- Support multi-providers (OpenAI, Anthropic, Google, Ollama)
- Génération automatique d'analyse HAZOP
- Suggestions de causes/conséquences
- Recommandations de safeguards
- Configuration par organisation

### 6. Authentification & Sécurité
- Système auth custom (JWT + cookies)
- Hash des mots de passe (bcrypt)
- Reset password par email
- Sessions avec expiration

### 7. Documentation intégrée
- Documentation MDX avec Nextra
- Guide utilisateur
- Méthodologie HAZOP
- Architecture technique

## 🎨 Design System

- **Framework CSS** : Tailwind CSS v4
- **Composants** : shadcn/ui (Radix UI)
- **Thème** : Dark/Light mode
- **Police** : Geist (Vercel)
- **Icônes** : Lucide React

## 🔄 État actuel du développement

- ✅ Authentification complète
- ✅ Multi-tenancy (organisations)
- ✅ Gestion de projets
- ✅ Éditeur de diagrammes
- ✅ Analyse HAZOP manuelle
- ✅ Intégration IA multi-providers
- ✅ Documentation utilisateur
- ⚠️  Génération automatique de nœuds (partiel)
- ❌ Export de rapports
- ❌ Historique/versioning
- ❌ Notifications temps réel
- ❌ Analytics/dashboards

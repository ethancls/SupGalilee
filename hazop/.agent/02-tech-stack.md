# Stack Technique - HAZOP Labs

## 🏗️ Frontend

### Framework principal
- **Next.js 16** (App Router)
  - React Server Components
  - Server Actions
  - File-based routing
  - API Routes intégrées
  - Optimisations images/fonts

### UI & Styling
- **React 19** - Bibliothèque UI
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - Composants réutilisables basés sur Radix UI
  - Alert Dialog, Dialog, Dropdown, Select
  - Tabs, Tables, Forms
  - Command Palette (cmdk)
- **Lucide React** - Icônes SVG modernes
- **next-themes** - Dark/Light mode
- **react-hook-form** - Gestion de formulaires
- **zod** - Validation de schémas

### Visualisation
- **@xyflow/react** (ReactFlow) - Éditeur de diagrammes de flux
  - Drag & drop
  - Nœuds custom
  - Connexions animées
  - Mini-map, Controls

### Documentation
- **Nextra** - Framework de documentation basé sur Next.js
- **@mdx-js/react** - Support MDX (Markdown + React)
- **@tailwindcss/typography** - Styles pour contenu markdown

## 🔧 Backend

### Runtime & Framework
- **Node.js** - Runtime JavaScript
- **Next.js API Routes** - Endpoints RESTful
- **TypeScript** - Backend type-safe

### Base de données
- **SQLite** - Base de données embarquée (dev/demo)
  - Simple à déployer
  - Pas de serveur à gérer
  - Migration facile vers PostgreSQL en production
- **Prisma 6** - ORM moderne
  - Schema-first
  - Type-safe client
  - Migrations automatiques
  - Prisma Studio pour debug

### Authentification
- **jsonwebtoken** - Génération/validation JWT
- **bcryptjs** - Hash de mots de passe
- **cookie** - Gestion de cookies HTTP-only

### Services externes
- **Resend** - Service d'envoi d'emails
  - Invitations
  - Reset password
  - Notifications

### IA - Multi-Provider
- **OpenAI API** - GPT-4, GPT-3.5
- **Anthropic API** - Claude 3/4
- **Google Generative AI** - Gemini
- **Ollama** - Modèles locaux (Llama, Mistral, etc.)

## 📦 Gestion de dépendances

### Package Manager
- **npm** - Manager par défaut
- Package.json avec scripts :
  - `dev` : Développement
  - `build` : Production build
  - `start` : Serveur production
  - `studio` : Prisma Studio

### Versions clés
```json
{
  "next": "^16.1.6",
  "react": "^19.2.3",
  "typescript": "^5",
  "prisma": "^6.7.0",
  "@xyflow/react": "^12.10.0"
}
```

## 🛠️ Outils de développement

### Linting & Formatage
- **ESLint 9** - Linter JavaScript/TypeScript
- **eslint-config-next** - Configuration Next.js

### Build & Compilation
- **TypeScript Compiler** - tsc
- **PostCSS** - Transformation CSS
- **@tailwindcss/postcss** - Plugin Tailwind

### Type Definitions
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `@types/bcryptjs`
- `@types/jsonwebtoken`

## 🗄️ Structure de la base de données

### Prisma Schema
- **Provider** : SQLite (peut être changé pour PostgreSQL)
- **Générateur** : Prisma Client JS

### Modèles principaux
1. **User** - Utilisateurs
2. **Session** - Sessions actives
3. **Organization** - Tenants
4. **OrganizationMember** - Appartenance + rôles
5. **Team** - Équipes (optionnel)
6. **AISettings** - Configuration IA par org
7. **Invitation** - Invitations en attente
8. **Project** - Projets HAZOP
9. **Node** - Nœuds de procédés
10. **NodeConnection** - Connexions entre nœuds
11. **Deviation** - Déviations HAZOP

## 🌐 APIs externes utilisées

### AI Providers
| Provider   | API Endpoint                                      | Auth        |
|------------|--------------------------------------------------|-------------|
| OpenAI     | `https://api.openai.com/v1/chat/completions`     | Bearer      |
| Anthropic  | `https://api.anthropic.com/v1/messages`          | x-api-key   |
| Google     | `https://generativelanguage.googleapis.com/v1beta` | Query param |
| Ollama     | `http://localhost:11434/api/chat` (configurable) | Aucune      |

### Email Service
- **Resend** : API pour envoi d'emails transactionnels

## 🔐 Variables d'environnement

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="votre-secret-jwt"

# Email (Resend)
RESEND_API_KEY="re_xxx"
FROM_EMAIL="noreply@votredomaine.com"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# AI Providers (optionnel, configuré en UI)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_API_KEY=""
```

## 🚀 Déploiement recommandé

### Hébergement
- **Vercel** (recommandé pour Next.js)
  - Déploiement automatique depuis Git
  - Edge Functions
  - CDN global
  
- **Alternatives** : Railway, Render, AWS, Azure

### Base de données (Production)
- **PostgreSQL** recommandé
  - Changer provider dans schema.prisma
  - Supabase, Neon, PlanetScale

### Stockage
- Pour le moment : données JSON dans SQLite
- Future : Fichiers dans S3/R2 pour exports

## 🧪 Tests (à implémenter)

### Recommandations
- **Vitest** - Tests unitaires
- **Playwright** - Tests E2E
- **React Testing Library** - Tests composants

## 📊 Monitoring (à implémenter)

### Suggestions
- **Sentry** - Error tracking
- **Vercel Analytics** - Web analytics
- **PostHog** - Product analytics

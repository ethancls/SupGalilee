# 🗺️ Carte des fonctionnalités - HAZOP Labs

Guide de navigation dans le code source pour trouver rapidement où sont implémentées les fonctionnalités.

---

## 🔐 Authentification

### Login
- **Route** : `/login`
- **Page** : `src/app/(auth)/login/page.tsx`
- **Form** : `src/components/auth/login-form.tsx`
- **API** : `src/app/api/auth/login/route.ts`
- **Logic** : `src/lib/auth.ts` (`loginUser()`)

### Register
- **Route** : `/register`
- **Page** : `src/app/(auth)/register/page.tsx`
- **Form** : `src/components/auth/register-form.tsx`
- **API** : `src/app/api/auth/register/route.ts`

### Forgot Password
- **Route** : `/forgot-password`
- **Page** : `src/app/(auth)/forgot-password/page.tsx`
- **Form** : `src/components/auth/forgot-password-form.tsx`
- **API** : `src/app/api/auth/forgot-password/route.ts`

### Reset Password
- **Route** : `/reset-password`
- **Page** : `src/app/(auth)/reset-password/page.tsx`
- **Form** : `src/components/auth/reset-password-form.tsx`
- **API** : `src/app/api/auth/reset-password/route.ts`

### Session Management
- **Helper** : `src/lib/auth.ts`
  - `getCurrentUser()` - Récupérer user actuel
  - `createSession()` - Créer session
  - `deleteSession()` - Logout
- **API Logout** : `src/app/api/auth/logout/route.ts`
- **API Me** : `src/app/api/auth/me/route.ts`

---

## 🏢 Organisations

### Création d'organisation
- **Modal** : `src/components/org/create-org-modal.tsx`
- **API** : `src/app/api/organizations/route.ts` (POST)

### Liste organisations
- **Dashboard** : `src/app/(dashboard)/page.tsx`
- **Component** : `src/app/(dashboard)/welcome-view.tsx`

### Paramètres organisation
- **Route** : `/org/[slug]/settings`
- **Page** : `src/app/(dashboard)/org/[slug]/settings/page.tsx`
- **View** : Inline dans page

### Gestion membres
- **API List** : `src/app/api/organizations/[id]/members/route.ts`
- **API Update Role** : `src/app/api/organizations/[id]/members/[userId]/route.ts`

---

## 👥 Invitations

### Créer invitation
- **API** : `src/app/api/invitations/route.ts` (POST)

### Accepter invitation
- **Route** : `/invite`
- **Page** : `src/app/(auth)/invite/page.tsx`
- **View** : `src/app/(auth)/invite/invite-view.tsx`
- **API** : `src/app/api/invitations/[token]/accept/route.ts`

### Révoquer invitation
- **API** : `src/app/api/invitations/[token]/revoke/route.ts`

---

## 🤖 Configuration IA

### Paramètres IA
- **Route** : `/org/[slug]/settings/ai`
- **Page** : `src/app/(dashboard)/org/[slug]/settings/ai/page.tsx`
- **View** : `src/app/(dashboard)/org/[slug]/settings/ai/ai-settings-view.tsx`
- **API** : `src/app/api/organizations/[id]/ai-settings/route.ts`

### Client IA
- **Client** : `src/lib/ai/client.ts`
  - `AIClient` class
  - `chat()` - Conversation IA
  - `analyzeHAZOP()` - Analyse HAZOP
  - `generateNodes()` - Génération nœuds
- **Providers** : `src/lib/ai/providers.ts`
  - Types `AIProvider`
  - Configuration providers
  - Prompts système

### Analyse IA
- **API Analyze** : `src/app/api/ai/analyze/route.ts`
- **Component** : `src/components/hazop/ai-assistant.tsx`

---

## 📁 Projets HAZOP

### Liste projets
- **Route** : `/org/[slug]`
- **Page** : `src/app/(dashboard)/org/[slug]/page.tsx`
- **API List** : `src/app/api/projects/route.ts` (GET)

### Créer projet
- **Route** : `/org/[slug]/projects/new`
- **Page** : `src/app/(dashboard)/org/[slug]/projects/new/page.tsx`
- **Form** : `src/app/(dashboard)/org/[slug]/projects/new/new-project-form.tsx`
- **API** : `src/app/api/projects/route.ts` (POST)

### Assistant IA pour création de projet
- **Fonctionnalité** : Génération automatique du nom et de la description détaillée du projet
- **Dialog** : Intégré dans `new-project-form.tsx`
- **API** : `src/app/api/organizations/[slug]/ai/generate-project/route.ts`
- **Client Method** : `src/lib/ai/client.ts` (`generateProjectDetails()`)
- **Prompt** : `PROJECT_DETAILS_GENERATION_PROMPT` dans `src/lib/ai/providers.ts`
- **Utilisation** : L'utilisateur décrit brièvement son projet, l'IA génère un nom professionnel et une description technique détaillée (3-5 paragraphes) incluant les équipements, matériaux, conditions opératoires, etc.

### Voir/Éditer projet
- **Route** : `/org/[slug]/projects/[id]`
- **Page** : `src/app/(dashboard)/org/[slug]/projects/[id]/page.tsx`
- **View** : `src/app/(dashboard)/org/[slug]/projects/[id]/project-view.tsx`
- **API Get** : Fetch dans page (RSC)
- **API Update** : `src/app/api/projects/[id]/route.ts` (PUT)

### Supprimer projet
- **API** : `src/app/api/projects/[id]/route.ts` (DELETE)

### Générer nœuds avec IA
- **API** : `src/app/api/projects/[id]/nodes/generate/route.ts`

---

## 🔵 Nœuds (Process Nodes)

### Créer nœud
- **API** : `src/app/api/projects/[projectId]/nodes/route.ts` (POST)
- **Form** : Inline dans project-view

### Modifier nœud
- **API** : `src/app/api/projects/[projectId]/nodes/[nodeId]/route.ts` (PUT)

### Supprimer nœud
- **API** : `src/app/api/projects/[projectId]/nodes/[nodeId]/route.ts` (DELETE)

---

## ⚠️ Déviations HAZOP

### Liste déviations
- **Component** : Dans `project-view.tsx` (tableau)
- **API** : Chargées avec le projet (include dans Prisma)

### Créer déviation
- **API** : `src/app/api/projects/[projectId]/nodes/[nodeId]/deviations/route.ts` (POST)
- **Modal** : Inline dans project-view

### Modifier déviation
- **API** : `src/app/api/projects/[projectId]/nodes/[nodeId]/deviations/[deviationId]/route.ts` (PUT)

### Supprimer déviation
- **API** : `src/app/api/projects/[projectId]/nodes/[nodeId]/deviations/[deviationId]/route.ts` (DELETE)

### Templates HAZOP
- **Guide Words** : `src/lib/hazop/templates.ts`
- **Parameters** : `src/lib/hazop/templates.ts`

---

## 📊 Flow Diagram (Éditeur de diagrammes)

### Éditeur
- **Component** : `src/components/flow/flow-editor.tsx`
- **Node custom** : `src/components/flow/process-node.tsx`

### Intégration dans projet
- **Component** : `src/components/hazop/flow-diagram.tsx`
- **Usage** : Dans project-view

### Connexions
- **Model** : `prisma/schema.prisma` (`NodeConnection`)
- **API** : (À implémenter si nécessaire)

---

## 📝 Documentation utilisateur

### Pages documentation
- **Route** : `/docs`
- **Layout** : `src/app/docs/layout.tsx`
- **Home** : `src/app/docs/page.mdx`

### Sections
- **Architecture** : `src/app/docs/architecture/`
- **Méthodologie** : `src/app/docs/methodology/`
- **Guide utilisateur** : `src/app/docs/user-guide/`

### Composants docs
- **Content** : `src/components/docs/docs-content.tsx`
- **Sidebar** : `src/components/docs/docs-sidebar.tsx`
- **Search** : `src/components/docs/search.tsx`
- **TOC** : `src/components/docs/toc.tsx`

---

## 🎨 UI Components (shadcn/ui)

Tous dans `src/components/ui/` :

### Formulaires
- `button.tsx` - Boutons
- `input.tsx` - Champs texte
- `label.tsx` - Labels
- `select.tsx` - Dropdowns
- `switch.tsx` - Toggle
- `textarea.tsx` - Texte multiligne
- `form.tsx` - Form wrapper (react-hook-form)

### Feedback
- `alert.tsx` - Messages d'alerte
- `sonner.tsx` - Toasts notifications
- `skeleton.tsx` - Loading placeholders
- `status-button.tsx` - Boutons avec état

### Layout
- `card.tsx` - Cartes
- `separator.tsx` - Séparateurs
- `tabs.tsx` - Onglets
- `scroll-area.tsx` - Zone scrollable
- `sheet.tsx` - Side panel

### Overlays
- `dialog.tsx` - Modales
- `alert-dialog.tsx` - Modales de confirmation
- `dropdown-menu.tsx` - Menus déroulants
- `popover.tsx` - Popovers
- `command.tsx` - Command palette

### Data Display
- `table.tsx` - Tableaux
- `badge.tsx` - Badges
- `avatar.tsx` - Avatars

---

## 🧱 Layout Components

### Sidebar
- **Context** : `src/components/layout/sidebar-context.tsx`
- **Component** : `src/components/layout/sidebar.tsx`
- **Usage** : Dans `(dashboard)/layout.tsx`

### Page Header
- **Component** : `src/components/layout/page-header.tsx`

### Main Content
- **Component** : `src/components/layout/main-content.tsx`

---

## ⚙️ Settings

### User Settings
- **Route** : `/settings`
- **Page** : `src/app/(dashboard)/settings/page.tsx`
- **View** : `src/app/(dashboard)/settings/settings-view.tsx`

### Org Settings
- **Route** : `/org/[slug]/settings`
- (Voir section Organisations ci-dessus)

---

## 🎨 Theming

### Theme Provider
- **Component** : `src/components/theme-provider.tsx`
- **Usage** : Wrapper dans root layout

### Theme Toggle
- **Component** : `src/components/theme-toggle.tsx`
- **Usage** : Dans header/sidebar

### Colors
- **Config** : `src/app/globals.css`
  - CSS variables pour dark/light mode
  - Tailwind theme colors

---

## 🗄️ Base de données

### Schéma Prisma
- **File** : `prisma/schema.prisma`

### Client Prisma
- **Singleton** : `src/lib/db.ts`
- **Usage** :
```typescript
import prisma from "@/lib/db";
const users = await prisma.user.findMany();
```

### Migrations
- **Folder** : `prisma/migrations/`
- **Commands** :
  - `npx prisma migrate dev` - Créer migration
  - `npx prisma migrate deploy` - Appliquer en prod
  - `npx prisma studio` - UI admin

---

## 📧 Email

### Service
- **Provider** : Resend
- **Helper** : `src/lib/email.ts`
  - `sendInvitationEmail()`
  - `sendPasswordResetEmail()`

### Templates
- Inline dans `email.ts` (HTML strings)

---

## 🛠️ Utilities

### Utils généraux
- **File** : `src/lib/utils.ts`
  - `cn()` - Merge classnames (Tailwind)

### Auth helpers
- **File** : `src/lib/auth.ts`
  - Voir section Authentification

### HAZOP helpers
- **File** : `src/lib/hazop/templates.ts`
  - Guide words
  - Parameters
  - Templates

---

## 📱 Responsive Design

### Breakpoints Tailwind
```
sm: 640px   - Mobile landscape
md: 768px   - Tablet
lg: 1024px  - Desktop
xl: 1280px  - Large desktop
2xl: 1536px - Extra large
```

### Mobile-first
- Tous les composants sont mobile-first
- Desktop = ajout de classes `md:` `lg:`

---

## 🔍 Recherche (Future)

**Status** : À implémenter

**Recommandations** :
- Component : `src/components/search/` (à créer)
- Command palette : Utiliser `cmdk` (déjà installé)
- API : `src/app/api/search/route.ts` (à créer)

---

## 📊 Analytics (Future)

**Status** : À implémenter

**Recommandations** :
- Component : `src/components/analytics/` (à créer)
- Dashboard : Nouvelle page `/org/[slug]/analytics`
- Charts : Utiliser Recharts

---

## 💬 Commentaires (Future)

**Status** : À implémenter

**Recommandations** :
- Model : Ajouter `Comment` dans schema.prisma
- Component : `src/components/hazop/comments.tsx` (à créer)
- API : `src/app/api/comments/` (à créer)

---

## 📄 Export (Future)

**Status** : À implémenter

**Recommandations** :
- API : `src/app/api/projects/[id]/export/route.ts` (à créer)
- Library : `@react-pdf/renderer` ou `puppeteer`

---

## 🧪 Tests (Future)

**Status** : Non configuré

**Recommandations** :
```
tests/
├── unit/           # Tests unitaires
├── integration/    # Tests API
└── e2e/           # Tests Playwright
```

---

## 📦 Configuration Files

### Next.js
- `next.config.mjs` - Config Next.js
- `tsconfig.json` - TypeScript config
- `next-env.d.ts` - Types Next.js

### Styling
- `tailwind.config.ts` - Config Tailwind
- `postcss.config.mjs` - PostCSS
- `src/app/globals.css` - CSS global

### Linting
- `eslint.config.mjs` - ESLint config

### UI
- `components.json` - shadcn/ui config

### Git
- `.gitignore`
- `.env` (ignoré, à créer localement)

---

## 🚀 Scripts npm

```json
{
  "dev": "next dev",           // Dev server
  "build": "next build",       // Production build
  "start": "next start",       // Production server
  "studio": "prisma studio",   // DB UI
  "lint": "eslint"            // Linter
}
```

---

## 📚 Ressources externes

### Documentation
- Next.js : https://nextjs.org/docs
- Prisma : https://www.prisma.io/docs
- Tailwind : https://tailwindcss.com/docs
- shadcn/ui : https://ui.shadcn.com
- ReactFlow : https://reactflow.dev

### APIs
- OpenAI : https://platform.openai.com/docs
- Anthropic : https://docs.anthropic.com
- Google AI : https://ai.google.dev/docs
- Resend : https://resend.com/docs

---

## 🗺️ Comment naviguer ?

### Je veux ajouter une feature
1. Consulter [04-features-ideas.md](04-features-ideas.md)
2. Identifier les fichiers à créer/modifier dans ce document
3. Suivre les patterns existants
4. Tester

### Je cherche où est X
1. Ctrl+F dans ce document
2. Ou utiliser la recherche VSCode (Cmd+Shift+F)
3. Ou demander à Copilot

### Je veux comprendre le flux
1. Commencer par la route dans `src/app/`
2. Suivre les imports
3. Remonter jusqu'à l'API si nécessaire

---

**Dernière mise à jour** : 2 février 2026

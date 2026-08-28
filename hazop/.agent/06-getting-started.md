# Getting Started - Guide développeur

## 🚀 Setup initial

### Prérequis
- Node.js 20+ 
- npm/pnpm/yarn
- Git

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/ethancls/hazop.git
cd hazop

# 2. Installer les dépendances
npm install

# 3. Copier .env.example → .env
cp .env.example .env

# 4. Configurer les variables d'environnement
# Éditer .env avec vos clés API

# 5. Initialiser la base de données
npx prisma migrate dev

# 6. (Optionnel) Seed la DB avec données de test
npx prisma db seed

# 7. Lancer le serveur de dev
npm run dev
```

Ouvrir http://localhost:3000

---

## 🔐 Variables d'environnement

### Minimum requis

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth
JWT_SECRET="votre-secret-super-long-et-aleatoire"

# Email
RESEND_API_KEY="re_xxxxxxxxxxxx"
FROM_EMAIL="noreply@votredomaine.com"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Optionnelles (IA)

```env
# Les clés IA sont optionnelles
# Elles peuvent être configurées via l'UI par organisation

# OpenAI
OPENAI_API_KEY="sk-xxxx"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-xxxx"

# Google
GOOGLE_API_KEY="AIzaxxxx"

# Ollama (local)
# Pas de clé requise, juste avoir Ollama installé
```

---

## 📁 Structure du projet

```
hazop/
├── .agent/              # 🆕 Documentation projet
├── prisma/
│   ├── schema.prisma   # Schéma DB
│   └── migrations/     # Migrations
├── public/             # Assets statiques
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── (auth)/    # Routes auth
│   │   ├── (dashboard)/  # Routes protégées
│   │   ├── api/       # API endpoints
│   │   └── docs/      # Documentation utilisateur
│   ├── components/    # React components
│   │   ├── ui/       # shadcn/ui
│   │   ├── hazop/    # HAZOP features
│   │   ├── flow/     # Flow diagram
│   │   └── layout/   # Layout
│   ├── lib/          # Utilities
│   │   ├── db.ts    # Prisma client
│   │   ├── auth.ts  # Auth helpers
│   │   └── ai/      # AI clients
│   └── types/       # TypeScript types
├── .env              # Variables d'environnement
├── package.json
└── tsconfig.json
```

---

## 🗄️ Base de données

### Commandes Prisma utiles

```bash
# Créer une migration
npx prisma migrate dev --name ma_nouvelle_migration

# Appliquer les migrations (prod)
npx prisma migrate deploy

# Ouvrir Prisma Studio (UI admin)
npx prisma studio

# Générer le client Prisma (après modif schema)
npx prisma generate

# Reset la DB (⚠️ dev only!)
npx prisma migrate reset

# Format le schema
npx prisma format
```

### Accéder à la DB

```typescript
import prisma from "@/lib/db";

// Exemple : récupérer les projets
const projects = await prisma.project.findMany({
  where: { organizationId: "xxx" },
  include: { nodes: true }
});
```

---

## 🎨 Ajouter un composant UI

```bash
# shadcn/ui CLI
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add table

# Les composants sont copiés dans src/components/ui/
```

---

## 🧭 Routage

### Routes publiques
- `/login` - Connexion
- `/register` - Inscription
- `/forgot-password` - Oubli MDP
- `/docs` - Documentation

### Routes protégées (nécessitent auth)
- `/` - Dashboard
- `/org/[slug]` - Organisation
- `/org/[slug]/projects/[id]` - Projet HAZOP
- `/org/[slug]/settings` - Paramètres
- `/settings` - Paramètres utilisateur

### API Routes
- `/api/auth/*` - Authentification
- `/api/organizations/*` - Organisations
- `/api/projects/*` - Projets
- `/api/ai/*` - IA

---

## 🔒 Authentification

### Protéger une page

```typescript
// src/app/(dashboard)/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <div>Protected content</div>;
}
```

### Protéger une API route

```typescript
// src/app/api/route.ts
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }
  
  // ...
}
```

---

## 🤖 Utiliser l'IA

### Configuration

1. Aller dans `/org/[slug]/settings/ai`
2. Choisir un provider
3. Entrer l'API key (sauf Ollama)
4. Choisir un modèle
5. Activer l'IA

### Utiliser dans le code

```typescript
import { AIClient } from "@/lib/ai/client";

const client = new AIClient({
  provider: "OPENAI",
  apiKey: "sk-xxx",
  model: "gpt-4o-mini"
});

const response = await client.analyzeHAZOP({
  nodeId: "node-1",
  nodeName: "Reactor",
  parameter: "Temperature",
  guideWord: "MORE"
});

console.log(response.causes);
console.log(response.consequences);
```

---

## 🧪 Tests (à implémenter)

```bash
# Créer vitest.config.ts
npm install -D vitest @vitejs/plugin-react

# Lancer les tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 🎨 Styling

### Tailwind CSS

```tsx
// Utiliser les classes Tailwind
<div className="flex items-center gap-4 p-6 bg-card rounded-lg">
  <Button variant="outline" size="sm">
    Click me
  </Button>
</div>
```

### Thème personnalisé

Éditer `tailwind.config.ts` :

```typescript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          // ...
          900: '#0c4a6e',
        }
      }
    }
  }
}
```

---

## 📝 Conventions de code

### TypeScript
- Toujours typer les props des composants
- Éviter `any`, utiliser `unknown` si nécessaire
- Interfaces > Types (convention)

### React
- Server Components par défaut
- Ajouter `"use client"` seulement si nécessaire (hooks, events)
- Extraire la logique dans des hooks custom

### Naming
- Composants : `PascalCase`
- Fichiers : `kebab-case.tsx`
- Fonctions : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`

### Imports
```typescript
// Ordre recommandé :
// 1. React/Next
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. External libs
import { Button } from "@/components/ui/button";

// 3. Internal
import { getCurrentUser } from "@/lib/auth";

// 4. Types
import type { User } from "@prisma/client";
```

---

## 🐛 Debug

### Logs
```typescript
console.log("Debug:", data);
console.error("Error:", error);
```

### Prisma Studio
```bash
npx prisma studio
# Ouvre http://localhost:5555
```

### Next.js Dev Tools
- Ouvrir DevTools → Components
- Voir les Server Components
- Inspecter les props

### VSCode extensions recommandées
- Prisma
- Tailwind CSS IntelliSense
- ESLint
- Pretty TypeScript Errors

---

## 🚀 Déploiement

### Vercel (recommandé)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Production
vercel --prod
```

### Variables d'environnement
Ajouter dans Vercel Dashboard :
- DATABASE_URL (PostgreSQL connection string)
- JWT_SECRET
- RESEND_API_KEY
- etc.

### Build command
```bash
npx prisma generate && next build
```

---

## 📚 Ressources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [ReactFlow](https://reactflow.dev/)

### Communauté
- Next.js Discord
- Prisma Discord
- Stack Overflow

---

## 🆘 Problèmes courants

### "Module not found: @/..."
```bash
# Régénérer le client Prisma
npx prisma generate
```

### "Cannot find module 'prisma/schema.prisma'"
```bash
# Vérifier que prisma/schema.prisma existe
# Puis générer
npx prisma generate
```

### "JWT Secret not set"
```bash
# Vérifier .env
echo $JWT_SECRET  # Doit afficher quelque chose
```

### Port 3000 déjà utilisé
```bash
# Changer le port
npm run dev -- -p 3001
```

---

## ✅ Checklist avant commit

- [ ] Code compile sans erreur TypeScript
- [ ] ESLint passe sans erreur
- [ ] Tests passent (quand implémentés)
- [ ] Pas de `console.log` oubliés
- [ ] Variables d'environnement documentées si ajoutées
- [ ] Migration Prisma créée si schéma modifié

---

## 🎉 Prêt à contribuer !

Lire [04-features-ideas.md](04-features-ideas.md) pour les idées de features à implémenter.

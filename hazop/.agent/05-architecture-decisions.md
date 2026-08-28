# Décisions d'architecture - HAZOP Labs

## 🎯 Principes directeurs

1. **Simplicité d'abord** : Éviter la sur-ingénierie
2. **Type-safety** : TypeScript partout
3. **Developer Experience** : DX > prématurée optimisation
4. **Évolutivité** : Architecture permettant la croissance
5. **Sécurité** : Security by design

---

## 🏗️ Décisions architecturales

### 1. Next.js App Router (vs Pages Router)

**✅ Choix : App Router**

**Raisons** :
- React Server Components par défaut
- Meilleure performance (streaming, suspense)
- Layouts imbriqués plus propres
- Colocation de fichiers
- Future-proof (direction de Next.js)

**Trade-offs** :
- ❌ Courbe d'apprentissage plus raide
- ❌ Certaines librairies pas encore compatibles
- ✅ Mais : Meilleures performances et DX

---

### 2. SQLite (vs PostgreSQL initial)

**✅ Choix : SQLite pour MVP**

**Raisons** :
- Déploiement ultra-simple
- Pas de serveur DB à gérer
- Excellent pour démos/PoC
- Prisma supporte migration facile vers PostgreSQL

**Migration future** :
```prisma
// Changer simplement :
datasource db {
  provider = "postgresql"  // au lieu de "sqlite"
  url      = env("DATABASE_URL")
}
```

**Quand migrer ?** :
- > 100 organisations actives
- > 1000 projets HAZOP
- Besoin de réplication
- Recherche full-text avancée

---

### 3. Authentification custom (vs Auth.js/Clerk)

**✅ Choix : Auth custom avec JWT**

**Raisons** :
- Contrôle total sur le flow
- Pas de dépendance externe
- Coût : $0
- Apprentissage : comprendre l'auth

**Trade-offs** :
- ❌ Maintenance du code auth
- ❌ Gérer soi-même les sessions
- ✅ Mais : flexibilité maximale

**Sécurité implémentée** :
- Hashing bcrypt (cost: 10)
- JWT HTTP-only cookies
- Expiration sessions (7 jours)
- Reset password sécurisé
- CSRF protection (via SameSite cookies)

**Amélioration future** :
- Rate limiting (express-rate-limit)
- 2FA (TOTP avec speakeasy)
- SSO (SAML/OAuth2)

---

### 4. Multi-provider IA (vs vendor lock-in)

**✅ Choix : Abstraction multi-provider**

**Architecture** :
```typescript
interface AIClient {
  chat(messages): Promise<string>
  analyzeHAZOP(request): Promise<Response>
}

class AIClient {
  constructor(provider, apiKey, model)
  // Implémentation spécifique cachée
}
```

**Avantages** :
- Pas de vendor lock-in
- Choix selon budget/besoins
- Ollama = option gratuite/locale
- Fallback si provider down

**Providers supportés** :
1. OpenAI (GPT) - Meilleur qualité
2. Anthropic (Claude) - Meilleur raisonnement
3. Google (Gemini) - Bon rapport qualité/prix
4. Ollama (local) - Gratuit, privé

---

### 5. shadcn/ui (vs Material-UI / Chakra)

**✅ Choix : shadcn/ui**

**Raisons** :
- Composants copiables (pas de dépendance runtime)
- Radix UI = accessible par défaut (ARIA)
- Tailwind-based = cohérent avec design system
- Customisation facile
- Léger (tree-shakeable)

**Trade-offs** :
- ❌ Moins de composants prêts que MUI
- ✅ Mais : contrôle total, bundle size réduit

---

### 6. Prisma ORM (vs TypeORM / Drizzle)

**✅ Choix : Prisma**

**Raisons** :
- Type-safety excellente
- Schema-first (single source of truth)
- Migrations automatiques
- Prisma Studio (UI admin gratuite)
- Excellente DX

**Trade-offs** :
- ❌ Abstraction lourde (queries complexes)
- ❌ Pas de lazy loading
- ✅ Mais : productivité ++

---

### 7. ReactFlow (vs D3.js / Cytoscape)

**✅ Choix : ReactFlow**

**Raisons** :
- Composants React natifs
- Drag & drop intégré
- Excellente performance
- Mini-map, controls, background inclus
- Active development

**Use case parfait** : Flow diagrams process engineering

---

## 🔒 Sécurité

### Authentification
- JWT stockés dans HTTP-only cookies
- Expiration sessions : 7 jours
- Refresh tokens : pas encore (TODO)

### Autorisation
- Vérification rôle sur chaque API route
- Server-side uniquement (pas de client-side auth)
- Organisation isolation stricte

### Données sensibles
- API keys : devraient être chiffrées (TODO: AES-256)
- Passwords : bcrypt (cost: 10)
- Sessions : tokens aléatoires (crypto.randomBytes)

### Headers sécurité (TODO)
```typescript
// next.config.mjs
headers: [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
]
```

---

## 📦 Structure du code

### Organisation des fichiers
```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/          # Auth routes (login, register)
│   ├── (dashboard)/     # Protected routes
│   └── api/             # API endpoints
├── components/          # React components
│   ├── ui/             # shadcn/ui base
│   ├── hazop/          # HAZOP-specific
│   ├── flow/           # Flow diagram
│   └── layout/         # Layout components
├── lib/                 # Utilities
│   ├── db.ts           # Prisma client
│   ├── auth.ts         # Auth helpers
│   └── ai/             # AI clients
└── types/              # TypeScript types
```

### Convention de nommage
- **Composants** : PascalCase (`FlowEditor.tsx`)
- **Utilities** : camelCase (`auth.ts`)
- **API routes** : kebab-case folders
- **Types** : PascalCase interfaces

---

## 🚀 Performance

### Optimisations actuelles
- React Server Components (RSC)
- Image optimization (next/image)
- Font optimization (next/font)
- Code splitting automatique (Next.js)

### Optimisations futures
- [ ] React Query pour cache
- [ ] ISR (Incremental Static Regeneration)
- [ ] Edge runtime pour API routes
- [ ] CDN pour assets statiques
- [ ] Database connection pooling

---

## 🧪 Testing (TODO)

### Stratégie recommandée
```
Pyramid de tests :
  /\
 /  \  E2E (Playwright)           - 10%
/----\  Integration (Vitest)      - 30%
/------\ Unit (Vitest)             - 60%
```

### Outils suggérés
- **Unit** : Vitest (compatible Vite)
- **Integration** : Vitest + Testing Library
- **E2E** : Playwright
- **Component** : Storybook (optionnel)

---

## 📊 Monitoring & Observabilité (TODO)

### Recommandations
- **Errors** : Sentry
- **Analytics** : Vercel Analytics ou PostHog
- **Logs** : Structured logging (winston/pino)
- **APM** : New Relic ou Datadog

### Métriques clés à tracker
- Temps réponse API
- Taux d'erreur
- Utilisation IA (tokens consumed)
- Conversions (signup → premier projet)
- Engagement (projets créés/semaine)

---

## 🔄 CI/CD (TODO)

### Pipeline suggéré
```yaml
# .github/workflows/main.yml
1. Lint (ESLint)
2. Type check (tsc)
3. Test (Vitest)
4. Build (next build)
5. Deploy (Vercel)
```

### Branches
- `main` : Production
- `develop` : Staging
- `feature/*` : Features

---

## 🌍 Environnements

### Local Development
- SQLite file DB
- Emails mockés (console)
- AI calls réels ou mockés

### Staging
- PostgreSQL (Supabase/Neon)
- Emails réels (Resend)
- AI calls réels

### Production
- PostgreSQL avec réplication
- CDN (Vercel Edge)
- Monitoring actif
- Backups quotidiens

---

## 📝 Documentation

### Types de docs
1. **Technique** (ce dossier `.agent/`)
2. **Utilisateur** (`/docs` - Nextra)
3. **API** (future : Swagger/OpenAPI)
4. **Code** (JSDoc/TSDoc inline)

### Maintenance
- Mettre à jour après chaque feature majeure
- Documenter les décisions d'architecture
- Garder un CHANGELOG.md

---

## 🔮 Évolution future

### Potentielles ré-architectures

**Quand l'app scale (> 10k users)** :
1. **Microservices** : Séparer IA service
2. **Queue system** : BullMQ pour jobs async
3. **Cache layer** : Redis pour sessions/cache
4. **Search service** : Elasticsearch/Meilisearch
5. **File storage** : S3/R2 pour exports
6. **WebSockets** : Pour real-time collaboration

**Pour le moment : monolithe Next.js suffit amplement !**

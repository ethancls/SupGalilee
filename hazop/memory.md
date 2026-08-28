# Memory - Leçons apprises et erreurs à éviter

## Session : Réparation Lint & TypeScript (Février 2026)

### ✅ Leçons importantes apprises

#### 1. Résolution des modules TypeScript
- **Problème rencontré** : TypeScript ne trouvait pas les exports de `@xyflow/react` et `react-hook-form` alors qu'ils existaient
- **Solution** : Réinstallation complète des `node_modules` avec `rm -rf node_modules package-lock.json && npm install`
- **Leçon** : Avant de modifier du code pour contourner des erreurs de types, vérifier d'abord l'intégrité des node_modules
- **À faire en priorité** : 
  1. Vérifier que les packages existent dans package.json
  2. Vérifier l'installation avec `npm ls <package>`
  3. Si les types existent dans node_modules mais TypeScript ne les trouve pas → réinstaller les dépendances
  4. Seulement ensuite, chercher des solutions de code

#### 2. Schéma Prisma et cohérence avec l'API
- **Erreur commise** : Le code API utilisait des champs et relations inexistants dans le schéma Prisma
- **Solution appliquée** : Amélioration du schéma au lieu de dégrader l'API
- **Principe** : Toujours améliorer le schéma pour supporter les intentions de l'API, pas l'inverse
- **Approche correcte** :
  ```prisma
  // ✅ BON : Support flexible avec champs simples ET relations structurées
  model Deviation {
    cause          String?  // Simple text
    causesDetailed DeviationCause[]  // Structured data
  }
  
  // ❌ MAUVAIS : Retirer des fonctionnalités pour correspondre à un schéma limité
  ```

#### 3. Migration Prisma après modification du schéma
- **Commande essentielle** : `prisma-migrate-dev` avec un nom descriptif
- **Timing** : Toujours créer la migration immédiatement après modification du schéma
- **Vérification** : Tester avec `prisma-migrate-status` si doute sur l'état

#### 4. Gestion des effets React (useEffect)
- **Erreur ESLint** : "Calling setState synchronously within an effect"
- **Solutions** :
  1. **Initialiser l'état avec une fonction** :
     ```typescript
     // ✅ BON
     const [state, setState] = useState(() => {
       if (typeof window === "undefined") return defaultValue;
       return localStorage.getItem(key) || defaultValue;
     });
     ```
  2. **Utiliser queueMicrotask pour setState asynchrone** :
     ```typescript
     // ✅ BON
     useEffect(() => {
       queueMicrotask(() => setState(value));
     }, []);
     ```
  3. **Éviter setState synchrone dans useEffect** :
     ```typescript
     // ❌ MAUVAIS
     useEffect(() => {
       setState(value); // Cascading renders!
     }, []);
     ```

#### 5. Types TypeScript avec `any`
- **Règle** : Toujours définir des types explicites au lieu de `any`
- **Pattern** :
  ```typescript
  // ❌ MAUVAIS
  nodes.map((node: any) => ...)
  
  // ✅ BON
  type RawNode = { id?: string; label?: string; type?: string };
  nodes.map((node: RawNode) => ...)
  ```

#### 6. Nettoyage des imports inutilisés
- **Importance** : Les imports inutilisés créent du bruit et de la confusion
- **Vérification systématique** : Après chaque modification, vérifier les imports
- **Pattern courant** : Les icônes Lucide-react souvent importées mais non utilisées

### ❌ Erreurs à ne plus commettre

#### 1. Ne pas vérifier l'intégrité des node_modules en premier
- Symptôme : "Module has no exported member X" alors que le package est installé
- Réflexe : Réinstaller les dépendances AVANT de chercher des solutions de code

#### 2. Dégrader l'API au lieu d'améliorer le schéma
- **Erreur** : Supprimer des fonctionnalités API pour correspondre à un schéma limité
- **Correct** : Enrichir le schéma pour supporter les besoins de l'API
- **Principe** : Le schéma de données doit servir l'application, pas la contraindre

#### 3. Corriger les warnings de dépendances useEffect sans analyse
- **Piège** : Ajouter aveuglément des dépendances peut créer des boucles infinies
- **Analyse requise** : 
  - La dépendance change-t-elle dans le composant ?
  - Cela va-t-il créer un re-render en boucle ?
  - Est-ce vraiment nécessaire ou le linter est-il trop strict ?

#### 4. Supprimer partiellement du code inutilisé
- **Erreur** : Supprimer une déclaration de fonction mais laisser son utilisation
- **Solution** : Toujours vérifier toutes les références avant de supprimer

#### 5. Ne pas tester après chaque modification majeure
- **Erreur** : Accumuler plusieurs changements avant de tester
- **Correct** : Tester TypeScript et ESLint après chaque correction importante

### 🎯 Workflow optimal découvert

1. **Analyse initiale**
   ```bash
   npx tsc --noEmit          # Erreurs TypeScript
   npm run lint              # Erreurs ESLint
   ```

2. **Priorisation**
   - Erreurs d'infrastructure (node_modules, configuration)
   - Erreurs de schéma/base de données
   - Erreurs de types TypeScript
   - Warnings ESLint

3. **Corrections par catégorie**
   - Regrouper les corrections similaires
   - Tester après chaque catégorie
   - Ne pas mélanger différents types de corrections

4. **Vérification continue**
   ```bash
   npx tsc --noEmit && npm run lint
   ```

5. **Validation finale**
   ```bash
   npm run lint              # Doit retourner 0 errors, 0 warnings
   npx tsc --noEmit          # Doit réussir sans sortie
   ```

### 📚 Connaissances techniques acquises

#### Prisma ORM
- Support des champs JSON en SQLite via `String` + parsing manuel
- Les migrations peuvent ajouter des tables ET des champs simultanément
- Relations optionnelles avec `?` sur le type de champ
- Nommage des relations avec `@relation("Name")`

#### ReactFlow (@xyflow/react v12)
- Exports organisés par catégorie : components, hooks, types, utilities
- Types principaux : `Node`, `Edge`, `NodeProps`, `OnConnect`
- Composants : `ReactFlow`, `Controls`, `Background`, `MiniMap`, `Panel`
- Fonctions : `applyNodeChanges`, `applyEdgeChanges`, `addEdge`

#### react-hook-form v7
- Exports principaux : `Controller`, `FormProvider`, `useFormContext`, `useFormState`
- Types : `ControllerProps`, `FieldPath`, `FieldValues`
- Pattern avec Zod pour validation

#### Next.js 16
- `proxy.ts` remplace `middleware.ts`
- Turbopack par défaut en dev
- Route handlers avec `Promise<{ params }>` pour params

### 🔧 Commandes essentielles

```bash
# Vérification
npx tsc --noEmit                    # TypeScript
npm run lint                        # ESLint
npm run lint -- --max-warnings=0    # ESLint strict (0 warnings)

# Réparation
rm -rf node_modules package-lock.json && npm install  # Réinstaller dépendances
rm -rf .next                        # Nettoyer cache Next.js

# Prisma
npx prisma migrate dev --name descriptive_name  # Créer migration
npx prisma migrate status                        # Vérifier l'état
npx prisma generate                              # Régénérer le client

# Git
git status                          # Vérifier les changements
git diff                           # Voir les modifications
```

### 🎓 Principes de conception

1. **Flexibilité du schéma de données**
   - Supporter plusieurs niveaux de complexité (simple → avancé)
   - Champs textuels pour usage basique
   - Relations pour données structurées
   - Ne pas forcer un seul modèle

2. **Gestion d'état React**
   - Initialiser avec fonction pour données synchrones (localStorage)
   - useEffect pour opérations asynchrones (fetch)
   - queueMicrotask pour éviter cascading renders
   - Limiter les dépendances useEffect au strict nécessaire

3. **Types TypeScript**
   - Jamais de `any` sans raison valable
   - Définir des interfaces/types explicites
   - Utiliser les utilitaires TypeScript (`Partial`, `Pick`, `Omit`)
   - Typer les paramètres de callbacks

4. **Architecture API**
   - Les routes API doivent refléter les capacités du schéma
   - Le schéma doit évoluer avec les besoins des routes
   - Validation des données en entrée
   - Gestion d'erreurs cohérente

### 📋 Checklist avant commit

- [ ] `npx tsc --noEmit` réussit sans erreur
- [ ] `npm run lint` retourne 0 errors, 0 warnings
- [ ] Migrations Prisma créées si schéma modifié
- [ ] Imports inutilisés supprimés
- [ ] Variables inutilisées supprimées
- [ ] Pas de `any` TypeScript sans justification
- [ ] useEffect correctement implémentés (pas de setState synchrone)
- [ ] Tests manuels des fonctionnalités modifiées

### 🚀 Améliorations futures recommandées

1. **CI/CD**
   - Ajouter pre-commit hook avec lint + type check
   - GitHub Actions pour vérification automatique

2. **Configuration**
   - Activer `strict: true` dans tsconfig.json (déjà fait ✅)
   - Configurer ESLint pour bloquer les `any` explicites

3. **Documentation**
   - Documenter le schéma Prisma avec commentaires
   - README pour expliquer l'architecture

4. **Tests**
   - Tests unitaires pour les utilitaires
   - Tests d'intégration pour les routes API
   - Tests E2E pour les workflows critiques

---

**Date de création** : 3 février 2026  
**Contexte** : Réparation complète du code après problèmes de lint et TypeScript  
**Résultat** : 0 erreurs TypeScript, 0 erreurs ESLint, 0 warnings ESLint ✅

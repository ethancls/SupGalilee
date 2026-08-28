# Tests End-to-End (E2E) - HAZOP Labs

## 🎯 Vue d'ensemble

Ce dossier contient les tests E2E de l'application HAZOP Labs, utilisant [Playwright](https://playwright.dev/).

## 📁 Structure des tests

```
e2e/
├── README.md                  # Ce fichier
├── global.setup.ts            # Configuration globale (nettoyage DB)
├── utils/
│   └── test-helpers.ts        # Fonctions utilitaires partagées
├── auth.spec.ts               # Tests d'authentification
├── organizations.spec.ts      # Tests de gestion des organisations
├── projects.spec.ts           # Tests CRUD projets
├── nodes-deviations.spec.ts   # Tests nœuds et déviations HAZOP
├── flow-editor.spec.ts        # Tests éditeur de flux
├── ai-settings.spec.ts        # Tests configuration IA
└── user-settings.spec.ts      # Tests paramètres utilisateur
```

## 🚀 Exécution des tests

### Commandes disponibles

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Exécuter en mode UI (interface graphique)
npm run test:e2e:ui

# Exécuter en mode headed (navigateur visible)
npm run test:e2e:headed

# Mode debug (pas à pas)
npm run test:e2e:debug

# Voir le rapport HTML
npm run test:e2e:report
```

### Exécuter des tests spécifiques

```bash
# Un fichier spécifique
npx playwright test auth.spec.ts

# Un test spécifique par nom
npx playwright test -g "should register a new user"

# Un groupe de tests
npx playwright test --grep "Authentication"
```

## 🔧 Configuration

La configuration Playwright se trouve dans `playwright.config.ts` à la racine du projet.

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `BASE_URL` | URL de l'application | `http://localhost:3000` |
| `CI` | Mode CI (désactive retries) | - |

## 📝 Conventions de test

### Nommage

- Fichiers: `<feature>.spec.ts`
- Describe: Nom de la fonctionnalité
- Tests: "should <action>"

### Structure d'un test

```typescript
import { test, expect } from '@playwright/test';
import { registerUser, uniqueEmail } from './utils/test-helpers';

test.describe('Feature Name', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup
    const user = {
      email: uniqueEmail('feature'),
      password: 'Test123!',
      name: 'Test User',
    };
    await registerUser(page, user);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');
    
    // Act
    await page.getByRole('button', { name: /action/i }).click();
    
    // Assert
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

### Bonnes pratiques

1. **Sélecteurs robustes**: Utiliser `getByRole`, `getByLabel`, `getByText` plutôt que des sélecteurs CSS
2. **Attente explicite**: Utiliser `await expect().toBeVisible()` plutôt que des timeouts fixes
3. **Isolation**: Chaque test doit être indépendant (créer ses propres données)
4. **Gestion des erreurs**: Utiliser `.catch(() => false)` pour les vérifications conditionnelles

## 🧹 Nettoyage

Le fichier `global.setup.ts` nettoie la base de données avant chaque exécution pour garantir des tests isolés.

## 📊 Rapports

Les rapports HTML sont générés automatiquement dans `playwright-report/`.

Pour les ouvrir:
```bash
npm run test:e2e:report
```

## 🔍 Debugging

### Mode debug
```bash
npm run test:e2e:debug
```

### Générer une trace
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Screenshots sur échec
Les screenshots sont automatiquement capturés sur échec en mode CI.

## 🤖 Intégration CI/CD

Les tests sont configurés pour s'exécuter en CI avec:
- Retries désactivés
- Screenshots sur échec
- Traces sur premier retry

Exemple GitHub Actions:
```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
```

## ✅ Couverture actuelle

| Module | Tests | Couverture |
|--------|-------|------------|
| Authentification | 8 | ✅ Complet |
| Organisations | 6 | ✅ Complet |
| Projets | 7 | ✅ Complet |
| Nœuds & Déviations | 10 | ✅ Complet |
| Éditeur de flux | 7 | ✅ Complet |
| Configuration IA | 8 | ✅ Complet |
| Paramètres utilisateur | 10 | ✅ Complet |

## 🚧 À faire

- [ ] Tests de l'export PDF/Excel
- [ ] Tests multi-navigateur (Firefox, Safari)
- [ ] Tests mobile/responsive
- [ ] Tests de performance
- [ ] Tests d'accessibilité (a11y)

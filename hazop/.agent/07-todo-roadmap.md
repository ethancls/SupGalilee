# 📋 TODO & Roadmap - HAZOP Labs

## 🔥 TODO Immédiat (This Week)

### Bugs à corriger
- [ ] Tester le champ baseUrl pour Ollama après modification
- [ ] Vérifier que l'export de projet avec nœuds fonctionne
- [ ] Corriger le placeholder API key qui s'affiche mal

### Améliorations rapides
- [ ] Ajouter un loader pendant la génération IA
- [ ] Améliorer les messages d'erreur IA (plus explicites)
- [ ] Ajouter un toast de confirmation après sauvegarde
- [ ] Valider que l'URL Ollama est bien formée (regex)

### Documentation
- [x] Créer dossier `.agent` avec documentation complète
- [ ] Ajouter des commentaires JSDoc sur fonctions clés
- [ ] Créer un CHANGELOG.md
- [ ] Documenter les variables d'environnement dans .env.example

---

## 🚀 Sprint 1 - MVP Amélioré (2-3 semaines)

### 1. Export de rapports HAZOP 📄
**Priority: CRITICAL**
- [ ] Export PDF de base (projet + déviations)
- [ ] Export Excel (format HAZOP standard)
- [ ] Template PDF avec logo organisation
- [ ] Bouton export dans l'interface projet
- [ ] Historique des exports (optionnel)

**Stack** : `@react-pdf/renderer` ou `puppeteer`

---

### 2. Système de notifications 🔔
**Priority: HIGH**
- [ ] Modèle DB `Notification`
- [ ] API pour créer/lire/marquer lu
- [ ] Badge avec compteur dans header
- [ ] Dropdown liste notifications
- [ ] Types de notifications :
  - [ ] Nouveau membre dans organisation
  - [ ] Projet complété
  - [ ] Invitation acceptée
  - [ ] Mention dans commentaire (future)

**Stack** : Server-Sent Events ou polling simple

---

### 3. Commentaires sur déviations 💬
**Priority: HIGH**
- [ ] Modèle DB `Comment`
- [ ] Interface commentaires sous chaque déviation
- [ ] Support Markdown basique
- [ ] Édition/suppression de commentaires
- [ ] Thread de discussion (réponses)
- [ ] Mention @user (avec autocomplete)

---

### 4. Recherche globale 🔍
**Priority: MEDIUM**
- [ ] Command palette (Cmd+K)
- [ ] Recherche projets par nom
- [ ] Recherche nœuds
- [ ] Recherche déviations
- [ ] Filtres (statut, risque)
- [ ] Navigation rapide vers résultats

**Stack** : `cmdk` (déjà installé)

---

## 📊 Sprint 2 - Analytics & Collaboration (3-4 semaines)

### 5. Dashboard Analytics
- [ ] Composant Dashboard
- [ ] Widget : Projets par statut (pie chart)
- [ ] Widget : Déviations par niveau de risque
- [ ] Widget : Timeline d'activité
- [ ] Widget : Top contributeurs
- [ ] Export des métriques en CSV

**Stack** : Recharts

---

### 6. Assignation & Workflow
- [ ] Champ `assignedTo` dans `Deviation`
- [ ] Interface d'assignation (dropdown users)
- [ ] Filtrer déviations par assigné
- [ ] Vue "Mes déviations"
- [ ] Statuts personnalisés par organisation
- [ ] Workflow configurable (state machine)

---

### 7. Matrice des risques interactive
- [ ] Composant matrice 5x5
- [ ] Placement déviations sur matrice
- [ ] Click → voir détails déviation
- [ ] Filtres par nœud/projet
- [ ] Heat map colors
- [ ] Export image de la matrice

---

### 8. Historique & Versioning
- [ ] Modèle `AuditLog`
- [ ] Capture automatique des changements
- [ ] Interface historique (timeline)
- [ ] Voir qui a modifié quoi
- [ ] Comparaison versions (diff)
- [ ] Restauration version précédente

---

## 🎨 Sprint 3 - UX & Performance (2-3 semaines)

### 9. Templates de projets
- [ ] Modèle `ProjectTemplate`
- [ ] Bibliothèque de templates
- [ ] Créer projet depuis template
- [ ] Templates personnalisés par org
- [ ] Partage de templates (marketplace?)

---

### 10. Amélioration IA
- [ ] Génération complète diagramme depuis description
- [ ] Suggestions de connexions entre nœuds
- [ ] RAG sur documentation HAZOP
- [ ] Fine-tuning suggestions
- [ ] Feedback loop (thumbs up/down)
- [ ] Historique des analyses IA

**Stack** : Vector DB (Pinecone?) pour RAG

---

### 11. Performance & Optimization
- [ ] Implémenter React Query pour cache
- [ ] Lazy loading des composants lourds
- [ ] Optimiser bundle size
- [ ] ISR pour pages statiques
- [ ] Edge runtime pour API critiques
- [ ] Database indexing review

---

## 🔒 Sprint 4 - Sécurité & Scale (2 semaines)

### 12. Sécurité renforcée
- [ ] Chiffrement API keys (AES-256)
- [ ] Rate limiting sur API
- [ ] CSRF protection améliorée
- [ ] Headers de sécurité (CSP, etc.)
- [ ] Audit log des actions sensibles
- [ ] 2FA (TOTP)

---

### 13. Tests automatisés
- [ ] Setup Vitest
- [ ] Tests unitaires (lib/, utils)
- [ ] Tests integration (API routes)
- [ ] Tests E2E (Playwright)
- [ ] CI/CD avec tests automatiques
- [ ] Coverage > 70%

---

### 14. Monitoring & Observabilité
- [ ] Intégration Sentry (errors)
- [ ] Structured logging (winston/pino)
- [ ] Métriques business (analytics)
- [ ] Health check endpoint
- [ ] Status page

---

## 🌟 Future (Backlog)

### Features innovantes
- [ ] Reconnaissance P&ID (Computer Vision)
- [ ] Assistant vocal IA
- [ ] Collaboration temps réel (CRDT)
- [ ] Application mobile (React Native)
- [ ] Simulation de scénarios
- [ ] Prédiction ML des risques

### Intégrations
- [ ] Jira sync
- [ ] Slack/Teams notifications
- [ ] SSO (SAML, OAuth2)
- [ ] Google Drive / OneDrive
- [ ] API publique (REST + GraphQL)

### Infrastructure
- [ ] Migration PostgreSQL
- [ ] Redis cache layer
- [ ] Queue system (BullMQ)
- [ ] Elasticsearch pour recherche
- [ ] S3/R2 pour fichiers
- [ ] WebSockets pour real-time

---

## 📋 Backlog Non-priorisé

### Idées vrac
- Mode hors ligne (PWA)
- Import P&ID PDF
- Génération automatique de safeguards
- Bibliothèque de causes/conséquences communes
- Templates d'email personnalisables
- Webhooks
- API GraphQL
- Multi-langue (i18n)
- Thèmes personnalisés
- Marketplace de plugins

---

## 🏆 Milestones

### v0.1 - MVP Initial ✅
- [x] Auth + Organizations
- [x] Projets HAZOP
- [x] Nœuds + Déviations
- [x] Flow Editor
- [x] IA multi-provider

### v0.2 - MVP Amélioré (Target: Mars 2026)
- [ ] Export rapports
- [ ] Notifications
- [ ] Commentaires
- [ ] Recherche globale
- [ ] Dashboard analytics

### v0.3 - Production Ready (Target: Juin 2026)
- [ ] Assignation & workflow
- [ ] Historique & versioning
- [ ] Matrice des risques
- [ ] Templates
- [ ] Tests automatisés
- [ ] Monitoring

### v1.0 - Launch (Target: Septembre 2026)
- [ ] SSO
- [ ] Intégrations (Slack, Jira)
- [ ] App mobile (beta)
- [ ] API publique
- [ ] Documentation complète
- [ ] Migration PostgreSQL

---

## 🎯 OKRs (Objectives & Key Results)

### Q1 2026
**Objective** : Atteindre Product-Market Fit
- [ ] 10+ organisations actives
- [ ] 50+ projets HAZOP créés
- [ ] 500+ déviations analysées
- [ ] NPS > 40

### Q2 2026
**Objective** : Scale & Growth
- [ ] 50+ organisations actives
- [ ] 1000+ utilisateurs
- [ ] < 100ms temps réponse API (p95)
- [ ] 99.9% uptime

### Q3 2026
**Objective** : Enterprise Ready
- [ ] SSO implémenté
- [ ] SOC 2 compliance (début)
- [ ] 3+ intégrations tierces
- [ ] API publique documentée

---

## 📊 Métriques à tracker

### Product Metrics
- Nombre d'organisations actives
- Nombre de projets créés / semaine
- Nombre de déviations analysées
- Taux d'activation (signup → premier projet)
- Taux de rétention (D7, D30)

### Technical Metrics
- Temps de réponse API (p50, p95, p99)
- Uptime
- Taux d'erreur
- Bundle size
- Lighthouse score

### Business Metrics
- MRR (Monthly Recurring Revenue)
- Churn rate
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- NPS (Net Promoter Score)

---

## 🔄 Processus de développement

### Workflow
1. Choisir une tâche dans ce TODO
2. Créer une branche `feature/nom-feature`
3. Développer + tester
4. Créer PR avec description
5. Code review
6. Merge dans `develop`
7. Deploy sur staging
8. Tester en staging
9. Merge dans `main` → production

### Definition of Done
- [ ] Code fonctionne
- [ ] Tests passent (quand implémentés)
- [ ] Pas de warnings TypeScript/ESLint
- [ ] Documentation mise à jour si nécessaire
- [ ] PR reviewée et approuvée
- [ ] Testé en staging

---

## 💡 Comment contribuer ?

1. Lire [06-getting-started.md](06-getting-started.md)
2. Choisir une tâche dans ce TODO (commencer par 🔥 ou Sprint 1)
3. Commenter la tâche pour la "réserver"
4. Créer une branche
5. Coder en suivant les conventions
6. Ouvrir une PR
7. Célébrer ! 🎉

---

**Dernière mise à jour** : 2 février 2026

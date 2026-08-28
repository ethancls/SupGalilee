# Schéma de base de données - HAZOP Labs

## 📊 Vue d'ensemble

Le schéma est organisé en plusieurs domaines fonctionnels :

1. **Utilisateurs & Authentification**
2. **Organisations & Multi-tenancy**
3. **Configuration IA**
4. **Équipes**
5. **Invitations**
6. **Projets HAZOP**
7. **Nœuds & Déviations**

---

## 1️⃣ Utilisateurs & Authentification

### User
Représente un utilisateur de la plateforme.

```prisma
model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String
  avatar        String?
  passwordHash  String
  platformRole  PlatformRole @default(USER)
  isActive      Boolean      @default(true)
  emailVerified DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

enum PlatformRole {
  SUPER_ADMIN  // Admin plateforme
  USER         // Utilisateur normal
}
```

**Relations** :
- → Session (1:N)
- → OrganizationMember (1:N)
- → Project (créateur)
- → Deviation (créateur)
- → Invitation (invité par)

### Session
Sessions actives avec JWT tokens.

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  userAgent String?
  ipAddress String?
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

### PasswordResetToken
Tokens temporaires pour reset password.

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 2️⃣ Organisations & Multi-tenancy

### Organization
Tenant principal - isolation des données.

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique  // URL-friendly
  description String?
  logo        String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Relations** :
- → OrganizationMember (1:N)
- → Team (1:N)
- → Project (1:N)
- → AISettings (1:1)
- → OrganizationSettings (1:1)
- → Invitation (1:N)

### OrganizationMember
Table de liaison : Users ↔ Organizations avec rôles.

```prisma
model OrganizationMember {
  id             String           @id @default(cuid())
  organizationId String
  userId         String
  role           OrganizationRole @default(MEMBER)
  joinedAt       DateTime         @default(now())
  
  @@unique([organizationId, userId])
}

enum OrganizationRole {
  OWNER   // Peut tout faire
  ADMIN   // Gestion membres + projets
  MEMBER  // Créer/éditer projets
  VIEWER  // Lecture seule
}
```

### OrganizationSettings
Configuration par organisation.

```prisma
model OrganizationSettings {
  id                     String  @id @default(cuid())
  organizationId         String  @unique
  allowMemberInvites     Boolean @default(false)
  requireAdminApproval   Boolean @default(false)
  notifyOnMemberJoin     Boolean @default(true)
  notifyOnProjectCreate  Boolean @default(true)
}
```

---

## 3️⃣ Configuration IA

### AISettings
Configuration IA par organisation.

```prisma
model AISettings {
  id             String      @id @default(cuid())
  organizationId String      @unique
  provider       AIProvider  @default(OPENAI)
  apiKey         String?     // Chiffré
  model          String?     // ex: gpt-4o-mini
  baseUrl        String?     // Pour Ollama
  enabled        Boolean     @default(false)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

enum AIProvider {
  OPENAI      // GPT models
  ANTHROPIC   // Claude models
  GOOGLE      // Gemini models
  OLLAMA      // Local models
}
```

**Sécurité** :
- `apiKey` devrait être chiffré (TODO: AES encryption)
- Accès limité aux OWNER/ADMIN

---

## 4️⃣ Équipes

### Team
Groupes optionnels au sein d'une organisation.

```prisma
model Team {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  description    String?
  color          String   @default("#3b82f6")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([organizationId, name])
}
```

### TeamMember
Membres d'une équipe.

```prisma
model TeamMember {
  id       String   @id @default(cuid())
  teamId   String
  userId   String
  role     TeamRole @default(MEMBER)
  joinedAt DateTime @default(now())
  
  @@unique([teamId, userId])
}

enum TeamRole {
  LEAD    // Chef d'équipe
  MEMBER  // Membre
}
```

---

## 5️⃣ Invitations

### Invitation
Invitations par email pour rejoindre une organisation.

```prisma
model Invitation {
  id             String           @id @default(cuid())
  email          String
  organizationId String
  role           OrganizationRole @default(MEMBER)
  token          String           @unique
  status         InvitationStatus @default(PENDING)
  invitedById    String
  expiresAt      DateTime
  acceptedAt     DateTime?
  createdAt      DateTime         @default(now())
}

enum InvitationStatus {
  PENDING   // En attente
  ACCEPTED  // Acceptée
  DECLINED  // Refusée
  REVOKED   // Révoquée par l'admin
  EXPIRED   // Expirée
}
```

**Workflow** :
1. Admin crée invitation → email envoyé
2. User clique lien → token validé
3. User accepte → OrganizationMember créé
4. Status → ACCEPTED

---

## 6️⃣ Projets HAZOP

### Project
Projet d'étude HAZOP.

```prisma
model Project {
  id             String        @id @default(cuid())
  organizationId String
  name           String
  description    String?
  status         ProjectStatus @default(DRAFT)
  createdById    String
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

enum ProjectStatus {
  DRAFT        // Création en cours
  IN_PROGRESS  // Analyse en cours
  REVIEW       // En revue
  COMPLETED    // Terminé
  ARCHIVED     // Archivé
}
```

**Relations** :
- → Node (1:N) : Nœuds du projet

---

## 7️⃣ Nœuds & Déviations

### Node
Nœud de procédé (équipement).

```prisma
model Node {
  id           String   @id @default(cuid())
  projectId    String
  name         String   // ex: "Reactor R-101"
  description  String?
  designIntent String?  // Intention de design
  parameters   String?  // JSON: ["Flow", "Temperature", "Pressure"]
  position     String?  // JSON: {x: 100, y: 200}
  nodeType     String?  // pump, vessel, heat_exchanger...
  color        String?  // Couleur du nœud
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### NodeConnection
Connexion entre deux nœuds.

```prisma
model NodeConnection {
  id        String   @id @default(cuid())
  sourceId  String
  targetId  String
  label     String?  // "Feed", "Product", etc.
  createdAt DateTime @default(now())
  
  @@unique([sourceId, targetId])
}
```

### Deviation
Déviation HAZOP analysée.

```prisma
model Deviation {
  id              String          @id @default(cuid())
  nodeId          String
  guideWord       String          // NO, MORE, LESS, REVERSE...
  parameter       String          // Flow, Temperature, Pressure...
  deviation       String          // "NO Flow", "MORE Temperature"
  cause           String?         // Cause de la déviation
  consequence     String?         // Conséquence
  safeguards      String?         // Protections existantes
  recommendations String?         // Actions recommandées
  likelihood      Int?            // 1-5
  severity        Int?            // 1-5
  riskLevel       RiskLevel?      // Calculé
  status          DeviationStatus @default(OPEN)
  createdById     String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

enum RiskLevel {
  LOW       // Risque faible
  MEDIUM    // Risque moyen
  HIGH      // Risque élevé
  CRITICAL  // Risque critique
}

enum DeviationStatus {
  OPEN        // Ouverte
  IN_PROGRESS // En cours de traitement
  RESOLVED    // Résolue
  ACCEPTED    // Risque accepté
  CLOSED      // Fermée
}
```

**Calcul du risque** :
```
riskLevel = likelihood × severity
  1-5:   LOW
  6-12:  MEDIUM
  13-20: HIGH
  21-25: CRITICAL
```

---

## 📈 Index de performance

Index créés pour optimiser les requêtes :

```prisma
// User
@@index([email])

// Session
@@index([token])
@@index([userId])

// OrganizationMember
@@index([organizationId])
@@index([userId])

// Project
@@index([organizationId])
@@index([createdById])

// Node
@@index([projectId])

// Deviation
@@index([nodeId])
@@index([createdById])

// Invitation
@@index([token])
@@index([email])
@@index([organizationId])
```

---

## 🔄 Migrations

Migrations Prisma existantes :
1. `20260129141349_init` - Schéma initial
2. `20260129160744_add_user_avatar` - Ajout avatar user
3. `20260129174324_add_ai_settings_and_flow` - IA + flow
4. `20260202193026_add_base_url_to_ai_settings` - URL Ollama

---

## 💾 Capacités SQLite actuelles

### Avantages
- ✅ Simplicité de déploiement
- ✅ Pas de serveur DB à gérer
- ✅ Excellent pour dev/demo
- ✅ Transactions ACID

### Limitations
- ❌ Pas de concurrence élevée
- ❌ Pas de réplication
- ❌ Recherche full-text limitée
- ❌ Pas de types JSON natifs

### Migration future vers PostgreSQL
Pour production avec trafic élevé :
1. Changer `provider = "postgresql"` dans schema.prisma
2. Mettre à jour DATABASE_URL
3. Relancer `prisma migrate deploy`
4. Avantages : JSON natif, full-text search, scalabilité

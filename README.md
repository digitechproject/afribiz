# 🌟 AfriBiz Suite — ERP & SaaS Multi-Tenant V6

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Security](https://img.shields.io/badge/Security-scrypt%20%2B%20RBAC-059669?style=for-the-badge&logo=shield)](https://github.com/digitechproject/afribiz)

> **AfriBiz Suite** est une suite de gestion d'entreprise (ERP/CRM) moderne, modulaire et hautement sécurisée, conçue pour les entreprises, PME et indépendants opérant en Afrique francophone (espace OHADA, conformité fiscale IFU et RCCM).

---

## 📑 Table des Matières

- [1. Piliers & Fonctionnalités Clés](#-1-piliers--fonctionnalit%C3%A9s-cl%C3%A9s)
- [2. Architecture & Organisation du Code](#-2-architecture--organisation-du-code)
- [3. Démarrage Rapide](#-3-d%C3%A9marrage-rapide)
- [4. Moteur de Permissions RBAC](#-4-moteur-de-permissions-rbac)
- [5. Sécurité & Cryptographie](#-5-s%C3%A9curit%C3%A9--cryptographie)
- [6. Personnalisation & Branding Live](#-6-personnalisation--branding-live)
- [7. Scripts Utiles & Tests](#-7-scripts-utiles--tests)

---

## 🚀 1. Piliers & Fonctionnalités Clés

```mermaid
graph TD
    A[Compte Central User & SSO] --> B[Multi-Tenant & Sous-domaines]
    B --> C[Workspace Entreprise Dédié]
    C --> D[CRM & Facturation IFU]
    C --> E[Gestion RH, Postes & Départements]
    C --> F[Branding & Domaines Custom DNS]
    C --> G[Coffre-fort Documents Anti-IDOR]
```

### 🏢 Architecture Multi-Tenant & Sous-domaines
- **Sous-domaines automatiques** : Chaque entreprise dispose d'un espace privé accessible via `[company_slug].afribizsuite.com` (ou `[company_slug].localhost:3000` en local).
- **Protection des sous-domaines réservés** : 18 sous-domaines système (`api`, `admin`, `app`, `auth`, `billing`, `portal`, etc.) sont strictement bloqués.
- **Domaines personnalisés** : Prise en charge de domaines d'entreprise tiers (ex. `erp.maboutique.com`) avec enregistrement CNAME et vérification DNS.

### 🔐 Identité Unique & Authentification Contextualisée
- **Compte personnel unique** : Un utilisateur possède un compte centralisé unique et peut appartenir à plusieurs entreprises avec des rôles et postes distincts.
- **Sécurité `scrypt`** : Hachage des mots de passe avec sel cryptographique de 16 octets et rétrocompatibilité transparente pour les anciens comptes.
- **Sessions persistées & Révocation globale** : Traçabilité de l'adresse IP, du User-Agent et révocation de session en un clic.

### 👥 Socle RH & Organisation de l'Équipe
- **Règle des 4 concepts** : Séparation stricte entre le **Statut de collaboration** (*Salarié, Prestataire, Stagiaire, Associé*), la **Fiche de poste**, le **Département** et les **Droits d'accès RBAC**.
- **Invitations progressives** : Parcours en 3 étapes avec capture du type de contrat (CDI, CDD, etc.) et dates d'embauche.
- **Offboarding sécurisé** : Révocation des accès et archivage de l'historique collaborateur.

### 🎨 Studio de Branding & Live Customizer
- **Thème dynamique** : Choix des couleurs primaire, secondaire et d'accent avec calcul automatique du contraste WCAG (luminance YIQ).
- **Simulateur en direct** : Prévisualisation instantanée de la page de connexion et de l'interface aux couleurs de la marque.

### 📁 Coffre-fort de Documents & Audit Logging
- **Protection Anti-IDOR** : Vérification systématique de l'appartenance des documents (`userId === session.userId`).
- **Audit de sécurité complet** : Journalisation PostgreSQL de toutes les actions sensibles dans la table `AuditLog`.

---

## 📂 2. Architecture & Organisation du Code

```text
afribiz-suite/
├── app/                              # Next.js 16 App Router
│   ├── (tenant)/app/[company_slug]/  # Espace privé du workspace entreprise
│   │   ├── dashboard/                # Tableau de bord entreprise
│   │   ├── settings/                 # Studio Réglages, Branding, RH, Domaines
│   │   └── login/                    # Page de connexion personnalisée du tenant
│   ├── dashboard/                    # Dashboard personnel (Mes espaces, Documents, Invitations)
│   ├── select-workspace/             # Sélecteur d'espace & activation IFU
│   ├── onboarding/                   # Création guidée d'entreprise
│   ├── documents/                    # Coffre-fort de documents personnels
│   └── api/auth/                     # Routes d'authentification et déconnexion
├── lib/                              # Services transversaux et utilitaires centraux
│   ├── auth.ts                       # Gestion des sessions et cookies cross-subdomain
│   ├── authz.ts                      # Moteur RBAC déclaratif et catalogue de 30 permissions
│   ├── crypto.ts                     # Hachage scrypt et auto-rehash
│   ├── tenant.ts                     # Résolution DNS des sous-domaines et domaines custom
│   ├── branding.ts                   # Calcul du contraste WCAG et injection tokens CSS
│   ├── audit.ts                      # Journalisation d'audit de sécurité
│   ├── email/                        # Providers email (Console en dev, Resend en prod)
│   └── db.ts                         # Client Prisma singleton
├── modules/                          # Server Actions modulaires par domaine métier
│   ├── auth/                         # Inscription, OTP, connexion, reset mot de passe
│   ├── tenants/                      # Paramètres entreprise, invitations, domaines DNS
│   ├── hr/                           # Postes, départements, cycle collaborateur & offboarding
│   └── onboarding/                   # Logique d'initialisation des entreprises
├── prisma/
│   ├── schema.prisma                 # Modèle de données PostgreSQL complet
│   ├── migrations/                   # Historique des migrations SQL
│   └── seed.ts                       # Seeding automatique des rôles et 30 permissions
└── scripts/                          # Scripts de test et vérifications automatisées
```

---

## 🛠️ 3. Démarrage Rapide

### Prérequis
- **Node.js** version 20.x ou supérieure
- **PostgreSQL** 15+ (en local ou via Docker)
- **Git**

### Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/digitechproject/afribiz.git
   cd afribiz
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement** :
   Copiez le fichier exemple :
   ```bash
   cp .env.example .env
   ```
   Renseignez votre chaîne de connexion PostgreSQL dans `.env` :
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/afribiz_db?schema=public"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
   ```

4. **Initialiser la base de données & les rôles** :
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application est disponible sur [http://localhost:3000](http://localhost:3000).

---

## 🛡️ 4. Moteur de Permissions RBAC

Les autorisations s'effectuent de façon déclarative et typée via la fonction `can()` :

```typescript
import { can } from "@/lib/authz";

// Vérifie si l'utilisateur a le droit de facturer dans cette entreprise
const isAllowed = await can(session.userId, company.id, "BILLING", "INVOICES_CREATE");

if (!isAllowed) {
  throw new Error("Accès refusé.");
}
```

### Matrice des 7 Rôles Système
| Rôle | Description | Droits Clés |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Propriétaire de l'entreprise | Wildcard total (`*`), gestion des abonnements et suppression |
| **`ADMIN`** | Directeur / Gérant | Paramètres complets, gestion des membres, RH et finances |
| **`MANAGER`** | Responsable opérationnel | Gestion des projets, clients et équipe opérationnelle |
| **`COMPTABLE`** | Responsable financier | Devis, facturation, encaissements et rapports fiscaux |
| **`RH_MANAGER`** | Responsable des ressources humaines | Recrutements, contrats, fiches de poste et départements |
| **`COMMERCIAL`** | Agent des ventes | Prospection, fiches clients et édition de devis |
| **`COLLABORATOR`** | Employé standard | Tâches assignées, profil personnel et lecture simple |

---

## 🔒 5. Sécurité & Cryptographie

- **Hachage Moderne `scrypt`** : `scrypt(password, salt, 64, N=16384, r=8, p=1)`.
- **Régénération Automatique** : Lors d'une connexion réussie avec un mot de passe legacy (PBKDF2), le système calcule et enregistre automatiquement le hash `scrypt` en base de données.
- **Cookies HttpOnly & SameSite** : Sécurisation contre les attaques XSS et CSRF avec prise en charge cross-subdomain via `COOKIE_DOMAIN`.

---

## 🎨 6. Personnalisation & Branding Live

Chaque tenant peut personnaliser son interface depuis l'onglet **Branding & Thème** :
- **Variables CSS injectées** : `--brand-primary`, `--brand-secondary`, `--brand-accent`.
- **Calcul automatique de contraste** :
  ```typescript
  import { getContrastColor } from "@/lib/branding";
  const textColor = getContrastColor(primaryColor); // Retourne #ffffff ou #0f172a
  ```

---

## 🧪 7. Scripts Utiles & Tests

| Commande | Rôle |
| :--- | :--- |
| `npm run dev` | Démarre le serveur Next.js en mode développement |
| `npm run build` | Compile l'application pour la production |
| `npm run lint` | Lance l'audit de qualité ESLint |
| `npx tsc --noEmit` | Vérifie la compilation et les types TypeScript sans émission |
| `npx tsx scripts/test-v6-crypto.ts` | Valide l'algorithme scrypt et la rétrocompatibilité |
| `npx tsx scripts/test-v6-authz.ts` | Valide la matrice des 30 permissions RBAC |
| `npx prisma studio` | Interface visuelle d'exploration de la base de données |

---

## 📄 Licence & Droits

Propriété exclusive de **Digitech Project / AfriBiz Suite**. Tous droits réservés.

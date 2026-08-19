# Rapport d'audit V6 — AfriBiz Suite

Conformément aux §90, §120, §121 et §127 du document, **aucune modification n'a été apportée au code**. Voici l'audit.

## A. Architecture actuelle (constatée)

- **Stack** : Next.js 16.2.9 (App Router), React 19, Prisma 6 / PostgreSQL, JWT via `jose`, Tailwind v4, zod. Aucun test, aucun seed, aucun dossier `prisma/migrations`.
- **Taille réelle** : 41 fichiers TS/TSX, 5 modules de server actions, 13 modèles Prisma.
- **Résolution tenant** : par sous-domaine dans `@/e:/dev/crmcloud/AFRIBIZ/afribiz-suite/middleware.ts:13-101`, avec `rewrite` vers `app/(tenant)/app/[company_slug]/...`.
- **Contrôle d'accès tenant** : uniquement dans `@/e:/dev/crmcloud/AFRIBIZ/afribiz-suite/app/(tenant)/app/[company_slug]/layout.tsx:28-48`.
- **Session** : JWT stateless en cookie `session` (`@/e:/dev/crmcloud/AFRIBIZ/afribiz-suite/lib/auth.ts:38-56`), avec `activeCompanyId/Slug/Role` dans le payload.

## B. Matrice d'écart (§90)

| Domaine | État actuel | Niveau | Compatible cible | Action |
|---|---|---|---|---|
| Identité / User | 1 user global, email+phone uniques, profil pro V5 en champs plats | **Complet** | Oui | Conserver |
| Authentification | login email/phone + password, OTP console | **Partiel** | Oui | Renforcer (hash, OTP réel) |
| Session | JWT 7j, cookie **host-only**, table `Session` **jamais écrite** | **Partiel / incohérent** | **Non** | Refonte cookie + session serveur |
| Tenants (Company) | slug + subdomain, onboarding 5 étapes | **Complet** | Oui | Étendre |
| Memberships | table OK, champs RH V5 présents | **Partiel** | Oui | Corriger contrôle `status` |
| Sous-domaines | `subdomain = slug`, pas de mots réservés | **Partiel** | Non | Ajouter validation §18 |
| Domaine personnalisé | **Absent** | Absent | — | À construire (§19-20) |
| Branding | `logo` + `primaryColor` injectés en `<style>` | **Prototype** | Non | Refonte (thème dérivé, §21-23) |
| Templates login | 1 seule page, non paramétrable | **Prototype** | Non | À construire (§24-27) |
| Invitations | création + acceptation + création de compte fonctionnelles | **Complet (hors email)** | Oui | Conserver, étendre |
| Rôles | chaînes en dur, table `Role` vide (fallback codé) | **Mock** | Non | Refonte (§43) |
| Permissions | table `Permission` vide, `customPermissions[]`/`allowedModules[]` **jamais lus** | **Mock** | **Non** | Refonte totale (§40-42, §83) |
| Modules | aucune notion d'activation tenant ; sidebar dérivée du `sector` avec `href="#"` | **Prototype** | Non | À construire (§82-83, §111-113) |
| RH | `CompanyDepartment` / `CompanyPosition` **définis mais utilisés nulle part** | **Absent (code mort)** | Partiel | À construire (§100) |
| Engagements / Contrats | **Absent** (seul `Invitation.contractType`) | Absent | — | À construire (§48-72) |
| Documents | upload disque local + partage par lien fonctionnels | **Partiel** | Non (stockage) | Migrer stockage + ACL |
| Email / messagerie | **Absent** — tout en `console.log` | Absent | — | À construire (§29-32) |
| DNS / SPF / DKIM | **Absent** | Absent | — | À construire (§99) |
| Audit log | **Absent** | Absent | — | À construire (§107) |
| Quotas / plans | `subscriptionPlan` (champ texte seul) | **Prototype** | Non | Socle abonnement (§113-114) |
| Stats tenant | `TenantSummary` créée à 0 et **jamais mise à jour** | **Mock** | Non | Calcul réel ou suppression |

## C. Écarts bloquants (à corriger avant tout module RH)

1. **SSO inter-sous-domaines cassé** — le cookie est posé sans `domain` (`@/e:/dev/crmcloud/AFRIBIZ/afribiz-suite/lib/auth.ts:41-47`). La session de `afribizsuite.com` **n'est pas** envoyée à `sofitarcom.afribizsuite.com`. Le §11 (« détecter sa session centrale ») est donc non fonctionnel, et le bouton « Entrer » du dashboard renverra vers le login.
2. **Membership inactif = accès autorisé** — le layout ne teste que l'existence du membership, pas `status === "ACTIVE"` (`layout.tsx:38`). Contredit §8 (« membre **actif** ») et §75 (offboarding).
3. **Aucun moteur d'autorisation** — les droits sont des comparaisons littérales `roleId !== "SUPER_ADMIN" && roleId !== "ADMIN"` répétées dans [settingsActions.ts](cci:7://file:///e:/dev/crmcloud/AFRIBIZ/afribiz-suite/modules/tenants/settingsActions.ts:0:0-0:0) et [inviteActions.ts](cci:7://file:///e:/dev/crmcloud/AFRIBIZ/afribiz-suite/modules/tenants/inviteActions.ts:0:0-0:0). Ni module, ni fonctionnalité, ni action, ni portée (§40-42, §83).
4. **IDOR sur les documents** — [handleDeleteDocument](cci:1://file:///e:/dev/crmcloud/AFRIBIZ/afribiz-suite/app/documents/page.tsx:109:2-117:3) supprime par `docId` **sans vérifier le propriétaire** (`@/e:/dev/crmcloud/AFRIBIZ/afribiz-suite/app/documents/page.tsx:111-118`). Viole §108.
5. **Aucun canal email** — invitations, OTP et resets sont imprimés en console ; l'OTP est même passé en clair dans l'URL (`actions.ts:79`). Bloque §14, §29-32.
6. **Hachage faible** — PBKDF2-SHA512 à **1000 itérations** (`@/e:/dev/crmcloud/AFRIBIZ/afribiz-suite/lib/crypto.ts:5`), très en dessous des recommandations actuelles, et comparaison non constant-time.
7. **Pas de migrations Prisma** — le schéma a manifestement évolué par `db push`. Toute évolution V6 est risquée sans historique de migration.

## D. Ce qui est conservable tel quel

Identité centrale unique, modèle `Membership` (userId+companyId unique), routage par sous-domaine du middleware, flux d'invitation (y compris création de compte depuis invitation, §14), interdiction de [/register](cci:9://file:///e:/dev/crmcloud/AFRIBIZ/afribiz-suite/app/register:0:0-0:0) sur sous-domaine (§13, `middleware.ts:96-101`), garde-fous « dernier Super Admin » (`settingsActions.ts:141-151`), upload/partage de documents personnels, onboarding entreprise.

## E. Refactoring nécessaire

- [lib/auth.ts](cci:7://file:///e:/dev/crmcloud/AFRIBIZ/afribiz-suite/lib/auth.ts:0:0-0:0) → session serveur persistée (table `Session` déjà présente) + cookie `.domain` racine + résolution de contexte tenant hors du payload JWT.
- Extraction d'un `lib/authz.ts` unique (`can(user, tenant, module, resource, action, scope)`), et remplacement des tests de rôle en dur.
- `lib/tenant.ts` : résolution tenant unique (sous-domaine **et** domaine personnalisé) + helper de requête tenant-scopée.
- Branding : passer de `primaryColor` inline à un modèle `TenantBranding` + génération de tokens de thème et contrôle de contraste.
- Documents : passer du disque local (`public/uploads`, non viable en prod serverless) à un stockage objet + ACL `owner`/`beneficiary` (§76).

## F. Migrations de données

Faibles, la base est jeune : seed du catalogue `Role`/`Permission`/modules ; `Company.subdomain` → contrôle d'unicité + mots réservés ; `Membership.allowedModules/customPermissions` → tables relationnelles ; `Invitation`/`Membership` → séparation `Invitation` / `Membership` / `Engagement` (§48).

## G. Risques

- Changer le domaine du cookie **invalide toutes les sessions** existantes (impact faible en dev).
- Introduire l'autorisation réelle **peut verrouiller des utilisateurs existants** si le seed des rôles est incomplet.
- Le `TenantSummary` mocké est aujourd'hui affiché comme un vrai KPI dans le dashboard tenant : le corriger changera visiblement l'UI.
- Les nombreux `as any` sur `db.invitation`, `db.document`, `db.membership` masquent des erreurs de typage : le client Prisma semble désynchronisé du schéma.

## H. Priorités

- **Bloquants** : 1, 2, 3, 4, 5, 7 (section C).
- **Importants** : mots réservés sous-domaine, audit log, activation des modules, seed catalogue, stockage documents.
- **Secondaires** : templates de login, domaines personnalisés + DNS, extraction de couleurs du logo, quotas, vidéo login.

## I. Plan d'exécution proposé

1. **Étape 0** — Baseline : `prisma migrate` initiale + régénération du client, suppression des `as any`.
2. **Étape 1** — Socle session : cookie cross-subdomain, persistance `Session`, révocation, durcissement du hash.
3. **Étape 2** — Socle tenant : résolution unifiée, mots réservés, contrôle `membership.status`, helper tenant-scopé.
4. **Étape 3** — Socle autorisations : catalogue permissions/modules/scopes + `can()` + seed rôles + remplacement des tests en dur.
5. **Étape 4** — Audit log + correction IDOR documents.
6. **Étape 5** — Messagerie transactionnelle (queue + statuts §30) et bascule OTP/invitations/resets.
7. **Étape 6** — Branding tenant (thème dérivé + fallback §28) puis templates de login.
8. **Étape 7** — Domaines personnalisés + DNS/SPF/DKIM.
9. **Étape 8+** — Socle RH : départements, postes, statuts, engagements, contrats versionnés, rémunération.

## J. Validation requise

Je m'arrête ici comme l'exige §121-J et §127. Trois décisions sont nécessaires avant toute ligne de code :

- **Portée de l'étape 1** : peut-on invalider les sessions actuelles et durcir le hash (les mots de passe existants devront être re-hachés à la prochaine connexion) ?
- **Stratégie Prisma** : baseline de migration sur le schéma actuel, ou repartir d'une base propre ?
- **Fournisseur email et stockage** : quel service transactionnel (Resend / SES / Brevo) et quel stockage objet (S3 / R2 / Supabase) pour les étapes 5 et 6 ?
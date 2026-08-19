AFRIBIZ SUITE — MISE À JOUR V6

Socle SaaS multi-tenant, identité personnelle, authentification contextualisée, espaces entreprise, administration, RH, contrats, permissions, branding, domaines et messagerie

\---

1\. OBJECTIF DE CETTE MISE À JOUR

Cette mise à jour ne constitue pas encore une instruction d’implémentation directe.

Elle constitue la définition fonctionnelle et architecturale de l’ambition à atteindre.

Le développeur ou le LLM chargé de travailler sur la codebase doit d’abord :

1\. analyser l’architecture existante ;  
2\. identifier ce qui est déjà implémenté ;  
3\. identifier ce qui est partiellement implémenté ;  
4\. identifier ce qui est simulé ou basé sur des données mock ;  
5\. identifier les incohérences avec la présente vision ;  
6\. déterminer ce qui peut être amélioré sans rupture ;  
7\. identifier ce qui nécessite une refonte ;  
8\. identifier les migrations nécessaires ;  
9\. proposer un plan de transition ;  
10\. attendre validation avant toute modification destructive ou majeure.

Aucune fonctionnalité ne doit être réécrite simplement parce qu’une architecture plus moderne est décrite ici.

Le premier objectif est de comprendre l’existant.

Le second est de définir comment l’existant peut évoluer vers la cible.

Le troisième seulement est d’implémenter.

\---

2\. VISION GLOBALE DU SYSTÈME

AfriBiz Suite doit être conçu comme une infrastructure SaaS multi-tenant de gestion professionnelle.

Le système repose désormais sur deux espaces principaux :

2.1. L’espace personnel

L’espace personnel appartient à une personne physique.

Il permet à cette personne de :

\- gérer son identité ;  
\- gérer son profil professionnel ;  
\- consulter ses entreprises ;  
\- consulter ses invitations ;  
\- accéder à ses espaces entreprises ;  
\- conserver ses documents personnels ;  
\- recevoir les documents qui lui sont délivrés par des entreprises ;  
\- consulter son historique professionnel ;  
\- gérer ses préférences ;  
\- préparer ultérieurement son profil pour le recrutement et la mobilité professionnelle.

L’espace personnel ne remplace pas l’ERP.

Il constitue l’identité professionnelle de la personne.

\---

3\. L’ESPACE ENTREPRISE

Chaque entreprise possède son propre tenant.

Chaque tenant doit être considéré comme un environnement autonome.

Exemple :

sofitarcom.afribizsuite.com

frbusiness.afribizsuite.com

restoogo.afribizsuite.com

L’entreprise dispose de :

\- ses données ;  
\- ses employés ;  
\- ses clients ;  
\- ses factures ;  
\- ses projets ;  
\- ses documents ;  
\- ses paramètres ;  
\- ses modules activés ;  
\- ses rôles ;  
\- ses permissions ;  
\- son branding ;  
\- son domaine ;  
\- sa configuration RH ;  
\- ses modèles de documents ;  
\- ses modèles de contrats ;  
\- ses paramètres de messagerie.

L’entreprise doit avoir le sentiment de posséder son propre logiciel.

AfriBiz Suite fournit le moteur SaaS, l’infrastructure et les services centraux, mais l’interface visible doit placer l’entreprise au centre.

\---

4\. LA PLATEFORME PRINCIPALE

La plateforme principale reste :

afribizsuite.com

Elle permet notamment :

\- création du compte personnel ;  
\- connexion générale ;  
\- dashboard personnel ;  
\- gestion du profil ;  
\- gestion des documents personnels ;  
\- visualisation des entreprises ;  
\- création d’entreprise ;  
\- sélection d’un workspace ;  
\- gestion des abonnements ;  
\- gestion des invitations ;  
\- accès à l’espace entreprise ;  
\- gestion globale des préférences.

La plateforme principale n’est pas le lieu de travail quotidien des employés.

Elle constitue le portail personnel et global.

\---

5\. PRINCIPE D’IDENTITÉ CENTRALE

Une personne ne doit pas posséder plusieurs identités AfriBiz Suite.

Elle possède une identité personnelle centrale.

Exemple :

Koffi

Compte global :

\- email ;  
\- téléphone ;  
\- mot de passe ;  
\- profil ;  
\- documents personnels.

Cette identité peut être associée à plusieurs entreprises.

Exemple :

Koffi → Sofitarcom → Comptable

Koffi → FrBusiness → Responsable stock

Koffi → Entreprise X → Prestataire

Koffi → Entreprise Y → Ancien employé

L’identité demeure unique.

Les relations professionnelles changent selon l’entreprise.

\---

6\. AUTHENTIFICATION CONTEXTUALISÉE

Il faut distinguer :

\- identité ;  
\- authentification ;  
\- contexte ;  
\- autorisation.

L’identité appartient à la personne.

L’authentification confirme cette identité.

Le contexte détermine où elle tente d’entrer.

L’autorisation détermine ce qu’elle peut faire.

\---

7\. CONNEXION GÉNÉRALE

La connexion générale se fait depuis :

afribizsuite.com/login

L’utilisateur saisit :

\- email ou identifiant global ;  
\- mot de passe.

Après authentification, il accède à son espace personnel.

Il ne doit pas être automatiquement envoyé dans une entreprise simplement parce qu’il en possède une.

Le dashboard personnel devient le point central de navigation.

\---

8\. CONNEXION DIRECTE À UNE ENTREPRISE

Chaque entreprise possède une page de connexion propre.

Exemple :

sofitarcom.afribizsuite.com/login

Cette page doit être visuellement propre à Sofitarcom.

Mais elle utilise toujours l’identité AfriBiz Suite de la personne.

Le système doit comprendre :

Utilisateur global : Koffi

Contexte demandé : Sofitarcom

Question :

Koffi est-il membre actif de Sofitarcom ?

Si oui :

accès autorisé.

Si non :

accès refusé.

\---

9\. RECOMMANDATION IMPORTANTE SUR LE MOT DE PASSE PAR ENTREPRISE

La vision initiale envisage la possibilité que chaque entreprise puisse définir un identifiant ou un mot de passe propre à son espace.

Cette possibilité doit être fortement encadrée.

Recommandation

Ne pas créer un deuxième compte utilisateur ni un deuxième mot de passe permanent par entreprise.

Cela provoquerait :

\- multiplication des mots de passe ;  
\- récupération de mots de passe complexe ;  
\- risque de comptes incohérents ;  
\- sécurité plus difficile ;  
\- logique SSO dégradée ;  
\- confusion entre identité et accès.

Le compte personnel doit rester la source d’identité.

En revanche, l’entreprise peut éventuellement définir :

\- un identifiant interne ;  
\- un matricule ;  
\- un username local ;  
\- un code employé.

Exemple :

Compte global :

koffi@gmail.com

Identifiant interne Sofitarcom :

KOFFI-024

Le système peut permettre à Koffi de saisir :

koffi@gmail.com

ou, selon la configuration autorisée :

KOFFI-024

Mais cela doit toujours résoudre vers le même utilisateur central.

Le mot de passe reste celui du compte central.

\---

10\. POURQUOI CETTE APPROCHE EST PRÉFÉRABLE

Elle permet :

\- une seule identité ;  
\- une seule récupération de mot de passe ;  
\- une seule vérification email/téléphone ;  
\- accès multi-entreprises ;  
\- SSO contextualisé ;  
\- application mobile future simplifiée ;  
\- meilleure sécurité ;  
\- meilleure gestion des sessions ;  
\- meilleure traçabilité.

Le sous-domaine ne représente donc pas un compte différent.

Il représente un contexte différent.

\---

11\. SESSION ET CONTEXTE TENANT

Lorsqu’un utilisateur déjà connecté à AfriBiz Suite visite :

sofitarcom.afribizsuite.com

le système doit détecter sa session centrale.

Il n’est pas nécessaire de lui redemander son mot de passe si sa session est toujours valide.

Le système vérifie :

\- identité ;  
\- tenant ;  
\- membership ;  
\- statut ;  
\- permissions.

Si l’accès est valide :

redirection vers le dashboard entreprise.

Sinon :

accès refusé.

Exemple :

Koffi est connecté à AfriBiz Suite.

Il visite :

sofitarcom.afribizsuite.com

Le système reconnaît Koffi.

Il vérifie :

Koffi appartient-il à Sofitarcom ?

Oui.

Accès accordé.

\---

12\. CAS D’UNE PERSONNE QUI VIENT DIRECTEMENT SANS ÊTRE CONNECTÉE

Une personne peut recevoir uniquement :

sofitarcom.afribizsuite.com

Elle ouvre l’adresse.

Elle arrive sur la page de connexion Sofitarcom.

Elle saisit son email et son mot de passe AfriBiz Suite.

Le système vérifie son identité.

Puis il vérifie son accès à Sofitarcom.

L’utilisateur n’est jamais obligé de passer par :

afribizsuite.com

C’est précisément l’un des intérêts du sous-domaine entreprise.

\---

13\. SI LA PERSONNE N’A PAS DE COMPTE ET N’A PAS D’INVITATION

Elle peut voir la page login de l’entreprise.

Elle peut essayer de se connecter.

Mais elle ne peut pas créer un compte depuis cette page.

Elle reçoit simplement :

“Vous n’avez pas accès à cet espace entreprise. Si vous pensez devoir y avoir accès, contactez l’administrateur de l’entreprise.”

Il ne faut pas afficher :

“Créer un compte”.

L’espace entreprise est privé.

\---

14\. EXCEPTION : INVITATION VALIDE

La seule situation permettant à une personne sans compte de créer son compte depuis le contexte entreprise est une invitation valide.

Exemple :

sofitarcom.afribizsuite.com/invitation/accept?token=XXX

Le système vérifie :

\- invitation existante ;  
\- invitation non expirée ;  
\- invitation non annulée ;  
\- entreprise correspondante ;  
\- destinataire correspondant ;  
\- rôle prévu ;  
\- informations de l’invitation.

Si la personne n’a pas de compte :

elle crée son compte personnel.

Puis elle accepte l’invitation.

Le système crée alors la relation entre :

utilisateur \+ entreprise.

\---

15\. LE DASHBOARD PERSONNEL

Le dashboard personnel doit afficher :

Mes espaces

\- Sofitarcom ;  
\- FrBusiness ;  
\- RestooGo ;  
\- autres espaces actifs.

Pour chaque entreprise :

\- nom ;  
\- logo ;  
\- rôle ;  
\- statut ;  
\- poste ;  
\- mini-statistiques autorisées ;  
\- dernière activité ;  
\- bouton “Entrer”.

Le bouton “Entrer” redirige vers le sous-domaine.

Exemple :

Sofitarcom → sofitarcom.afribizsuite.com/dashboard

\---

16\. SÉLECTEUR DE WORKSPACE

Le système doit disposer d’un sélecteur de workspace global.

Il peut être présent :

\- dans le dashboard personnel ;  
\- dans le header personnel ;  
\- dans le profil ;  
\- éventuellement dans le header entreprise sous forme de switcher.

Fonctions :

\- ouvrir un espace ;  
\- revenir à l’espace personnel ;  
\- créer une entreprise ;  
\- voir les invitations ;  
\- voir les espaces anciens.

\---

17\. STRUCTURE DU TENANT

L’entreprise devient une entité autonome.

Chaque tenant doit posséder au minimum :

\- identité ;  
\- forme juridique ;  
\- secteur ;  
\- coordonnées ;  
\- documents administratifs ;  
\- branding ;  
\- domaine ;  
\- paramètres ;  
\- utilisateurs ;  
\- départements ;  
\- postes ;  
\- rôles ;  
\- permissions ;  
\- modules ;  
\- contrats ;  
\- paramètres RH ;  
\- modèles de documents ;  
\- messagerie ;  
\- abonnement.

\---

18\. SOUS-DOMAINE AUTOMATIQUE

À la création d’une entreprise :

Nom :

Sofitarcom

Slug :

sofitarcom

Sous-domaine :

sofitarcom.afribizsuite.com

Le sous-domaine doit être réservé au tenant.

Le système doit vérifier :

\- unicité ;  
\- caractères autorisés ;  
\- mots réservés ;  
\- noms interdits ;  
\- disponibilité.

Il faut prévoir les mots réservés comme :

www  
app  
api  
admin  
mail  
support  
help  
billing  
status  
docs  
auth

et tout autre sous-domaine réservé à l’infrastructure.

\---

19\. DOMAINE PERSONNALISÉ

Une entreprise doit plus tard pouvoir utiliser son propre domaine ou sous-domaine.

Exemples :

app.sofitarcom.com

gestion.sofitarcom.com

espace.sofitarcom.com

Le domaine personnalisé doit être rattaché au même tenant.

Il ne doit pas créer un deuxième tenant.

\---

20\. VÉRIFICATION DU DOMAINE PERSONNALISÉ

Le processus doit comprendre :

1\. ajout du domaine ;  
2\. génération des instructions DNS ;  
3\. vérification ;  
4\. validation ;  
5\. émission ou activation SSL ;  
6\. activation du domaine ;  
7\. routage vers le tenant.

Le système doit afficher clairement le statut :

\- non configuré ;  
\- DNS en attente ;  
\- vérification en cours ;  
\- vérifié ;  
\- SSL en préparation ;  
\- actif ;  
\- erreur.

\---

21\. BRANDING DE L’ENTREPRISE

Chaque entreprise doit pouvoir personnaliser son espace.

Le branding doit être géré au niveau du tenant.

Informations principales :

\- logo ;  
\- nom affiché ;  
\- slogan ;  
\- couleur principale ;  
\- couleur secondaire ;  
\- couleur d’accent ;  
\- couleur de fond ;  
\- favicon ;  
\- image de connexion ;  
\- message de bienvenue.

\---

22\. EXTRACTION AUTOMATIQUE DES COULEURS DU LOGO

Lorsqu’un logo est uploadé, AfriBiz Suite peut proposer une analyse automatique.

Exemple :

Logo détecté.

Couleurs principales détectées :

\- bleu ;  
\- blanc ;  
\- orange.

Couleur dominante proposée :

Bleu \#XXXXXX

Message :

“Nous avons détecté cette couleur comme dominante dans votre logo. Voulez-vous l’utiliser comme couleur principale de votre espace ?”

Choix :

\- utiliser cette couleur ;  
\- conserver ma couleur actuelle ;  
\- choisir une autre couleur.

\---

23\. RÈGLES DE THÈME

Le système ne doit pas simplement enregistrer “une couleur”.

Il doit produire un système de thème cohérent.

Exemple :

Couleur principale.

À partir de celle-ci, le système génère :

\- hover ;  
\- active ;  
\- soft background ;  
\- border ;  
\- text accent ;  
\- focus ;  
\- badge ;  
\- bouton ;  
\- sidebar.

Il faut également vérifier automatiquement le contraste.

Une couleur choisie par une entreprise ne doit pas rendre les boutons ou textes illisibles.

\---

24\. PAGE DE CONNEXION PERSONNALISÉE

Chaque entreprise doit pouvoir personnaliser :

\- logo ;  
\- nom ;  
\- texte ;  
\- couleur de fond ;  
\- couleur de carte ;  
\- couleur du bouton ;  
\- couleur du texte ;  
\- image de fond ;  
\- position du formulaire ;  
\- slogan ;  
\- texte secondaire ;  
\- footer.

Une mention discrète peut rester :

“Propulsé par AfriBiz Suite”

Elle peut être configurable selon le plan.

\---

25\. TEMPLATES DE PAGE DE CONNEXION

Le système doit fonctionner avec un système de templates.

Exemple :

Template Classic

Template Modern

Template Corporate

Template Minimal

Template Image

Template Premium

Chaque template possède :

\- structure ;  
\- zones configurables ;  
\- paramètres de couleur ;  
\- paramètres de typographie ;  
\- paramètres de logo ;  
\- paramètres de fond.

Le tenant choisit un template puis le personnalise.

Cela prépare également un futur modèle économique de templates premium.

\---

26\. PERSONNALISATION PREMIUM FUTURE

Plus tard, certains templates pourraient être réservés à certains plans.

Exemple :

\- Basic ;  
\- Corporate ;  
\- Premium ;  
\- Enterprise.

Un grand groupe pourrait vouloir une expérience beaucoup plus personnalisée qu'une petite TPE.

\---

27\. VIDÉO ET ANIMATIONS SUR LA PAGE DE CONNEXION

Le système peut éventuellement accepter :

\- image ;  
\- animation légère ;  
\- vidéo courte.

Mais cette fonctionnalité doit être contrôlée.

Limites recommandées :

\- poids maximal ;  
\- durée maximale ;  
\- formats autorisés ;  
\- compression ;  
\- fallback image ;  
\- chargement différé.

Une vidéo lourde ne doit jamais dégrader le temps de chargement d’une page d’authentification.

\---

28\. FALLBACK BRANDING

Si aucune personnalisation :

logo absent → nom de l’entreprise.

couleur absente → thème AfriBiz Suite.

message absent → message standard.

background absent → background standard.

L’espace doit toujours paraître terminé et professionnel.

\---

29\. MAILING CENTRAL DE LA PLATEFORME

Le système doit disposer d’un service de messagerie transactionnelle central.

Il doit pouvoir gérer :

\- invitations ;  
\- réinitialisation mot de passe ;  
\- vérification email ;  
\- notifications ;  
\- documents ;  
\- contrats ;  
\- alertes RH ;  
\- rappels ;  
\- factures ;  
\- rapports.

Les emails doivent être mis en file d’attente et suivis.

\---

30\. ÉTATS DES EMAILS

Chaque email important doit pouvoir avoir un statut :

\- créé ;  
\- en attente ;  
\- envoyé ;  
\- délivré ;  
\- rejeté ;  
\- bounce ;  
\- plainte ;  
\- expiré.

Ces informations permettront de diagnostiquer les problèmes d’envoi.

\---

31\. EXPÉDITEUR PERSONNALISÉ DE L’ENTREPRISE

Une entreprise doit pouvoir utiliser son propre domaine d’envoi.

Exemple :

notifications@sofitarcom.com

hr@sofitarcom.com

no-reply@sofitarcom.com

Mais elle ne doit pas pouvoir déclarer librement un domaine qu’elle ne possède pas.

Le domaine doit être vérifié.

Les pratiques modernes reposent notamment sur l’authentification DNS avec SPF et DKIM, et DMARC peut être ajouté pour renforcer l’authentification et la protection contre l’usurpation. Les fournisseurs d’envoi transactionnel permettent typiquement de vérifier le domaine avant d’autoriser l’envoi depuis celui-ci.

\---

32\. ARCHITECTURE D’ENVOI DES EMAILS

Si aucune configuration personnalisée :

From :

AfriBiz Suite

Si domaine vérifié :

From :

Sofitarcom

notifications@sofitarcom.com

La configuration du domaine email doit être indépendante de la configuration du domaine web.

Une entreprise peut utiliser :

sofitarcom.afribizsuite.com

avec

notifications@sofitarcom.com

sans problème.

\---

33\. MODULE HR : POURQUOI IL DEVIENT PRIORITAIRE

Le module RH devient maintenant un module fondamental.

Cependant, il ne doit pas être développé avant le socle de sécurité, identité, tenant et permissions.

Le module RH dépend directement de :

\- utilisateurs ;  
\- entreprises ;  
\- memberships ;  
\- postes ;  
\- départements ;  
\- rôles ;  
\- permissions ;  
\- documents ;  
\- contrats ;  
\- notifications.

Il devient donc le premier grand module métier à construire après le socle.

\---

34\. NE PAS CONFONDRE QUATRE CONCEPTS

C’est une règle fondamentale.

AfriBiz Suite doit séparer :

1\. Statut de collaboration.  
2\. Poste.  
3\. Rôle système.  
4\. Permissions.

Exemple :

Personne :

Koffi

Statut :

Employé

Poste :

Comptable

Rôle système :

Comptable

Permissions :

\- lire factures ;  
\- créer factures ;  
\- lire paiements ;  
\- enregistrer paiement ;  
\- consulter rapports.

Ces quatre informations ne doivent jamais être fusionnées.

\---

35\. STATUT DE COLLABORATION

Le statut décrit la nature de la relation avec l’entreprise.

Exemples :

\- employé ;  
\- stagiaire ;  
\- apprenti ;  
\- prestataire ;  
\- consultant ;  
\- freelance ;  
\- intérimaire ;  
\- occasionnel ;  
\- bénévole ;  
\- associé ;  
\- dirigeant ;  
\- gérant ;  
\- collaborateur externe.

Le catalogue doit être configurable par pays.

\---

36\. POSTE

Le poste décrit la fonction.

Exemples :

\- comptable ;  
\- assistant RH ;  
\- commercial ;  
\- directeur financier ;  
\- responsable stock ;  
\- caissier ;  
\- développeur ;  
\- graphiste ;  
\- community manager ;  
\- chauffeur ;  
\- serveur ;  
\- cuisinier ;  
\- responsable marketing.

Un poste n’est pas un contrat.

Un poste n’est pas une permission.

Un poste peut être occupé par plusieurs personnes.

\---

37\. DÉPARTEMENTS

L’entreprise doit pouvoir créer des départements.

Exemples :

\- Direction ;  
\- Administration ;  
\- Finance ;  
\- Comptabilité ;  
\- Ressources humaines ;  
\- Commercial ;  
\- Marketing ;  
\- Production ;  
\- Technique ;  
\- IT ;  
\- Logistique ;  
\- Stock ;  
\- Support ;  
\- Opérations.

Le collaborateur peut être rattaché à un département.

\---

38\. CRÉATION DES POSTES

Le module RH permet aux administrateurs autorisés de créer des postes.

Lorsqu’un poste est créé :

Nom :

Comptable

Description :

Responsable de la saisie et du suivi comptable.

Département :

Finance

Modules recommandés :

\- Comptabilité ;  
\- Facturation ;  
\- Paiements ;  
\- Rapports.

Le poste ne doit pas définir le contrat.

Le poste définit uniquement les besoins professionnels et fonctionnels recommandés.

\---

39\. MODULES PAR POSTE

Chaque poste peut avoir des modules recommandés.

Exemple :

Poste Comptable :

\- Comptabilité ;  
\- Facturation ;  
\- Paiements ;  
\- Dépenses ;  
\- Rapports.

Poste RH :

\- RH ;  
\- Employés ;  
\- Documents ;  
\- Congés ;  
\- Présences.

Poste Commercial :

\- CRM ;  
\- Clients ;  
\- Ventes ;  
\- Devis ;  
\- Facturation.

Ces recommandations ne doivent pas être des autorisations définitives.

Elles servent de modèle lors de l’invitation.

\---

40\. PERMISSIONS : NIVEAU HIÉRARCHIQUE

La permission doit être pensée selon cette hiérarchie :

Entreprise

→ Module

→ Fonctionnalité

→ Ressource

→ Action

→ Portée

Exemple :

Entreprise :

Sofitarcom

Module :

Facturation

Fonctionnalité :

Factures

Action :

Modifier

Portée :

Ses propres factures / son équipe / toutes les factures

Cette structure permettra un système beaucoup plus puissant que le simple CRUD.

\---

41\. ACTIONS DE PERMISSION

Actions de base :

\- read ;  
\- create ;  
\- update ;  
\- delete.

Mais AfriBiz Suite doit prévoir aussi :

\- approve ;  
\- reject ;  
\- send ;  
\- export ;  
\- import ;  
\- upload ;  
\- download ;  
\- share ;  
\- assign ;  
\- archive ;  
\- restore ;  
\- publish ;  
\- validate ;  
\- manage ;  
\- invite ;  
\- configure.

Toutes les ressources n’ont pas besoin de toutes les actions.

\---

42\. PORTÉE DES PERMISSIONS

Une permission peut avoir une portée.

Exemple :

read\_invoice

Portée :

\- own ;  
\- team ;  
\- department ;  
\- all.

Exemple :

Un commercial voit uniquement ses clients.

Un chef commercial voit les clients de son équipe.

Un directeur voit tous les clients.

\---

43\. RÔLES SYSTÈME

AfriBiz Suite doit fournir des rôles prédéfinis.

Exemples :

\- Super Admin ;  
\- Administrateur ;  
\- Manager ;  
\- RH ;  
\- Comptable ;  
\- Commercial ;  
\- Collaborateur ;  
\- Lecture seule.

Ces rôles sont des ensembles de permissions.

\---

44\. NE PAS UTILISER “ÉLITE” COMME CONCEPT TECHNIQUE CENTRAL

Le terme “élite” peut rester dans l’expérience produit si tu l’aimes, mais le système ne doit pas en faire une notion technique vague.

Il vaut mieux avoir :

\- propriétaire ;  
\- administrateur d’organisation ;  
\- administrateur RH ;  
\- administrateur sécurité ;  
\- administrateur financier ;  
\- manager.

Une personne peut être “élite” dans le sens métier tout en ayant un ensemble précis de droits techniques.

\---

45\. PROPRIÉTAIRE DU TENANT

Le créateur de l’entreprise devient initialement :

Propriétaire \+ Super Admin.

Mais le système ne doit pas considérer que son compte personnel est techniquement impossible à supprimer.

Ce qu’il faut empêcher :

\- suppression du dernier propriétaire ;  
\- retrait du dernier administrateur ;  
\- suppression d’une organisation sans procédure ;  
\- perte irrécupérable des accès.

Le système doit plutôt permettre :

\- transfert de propriété ;  
\- ajout d’un second administrateur ;  
\- retrait du propriétaire après transfert ;  
\- récupération contrôlée.

\---

46\. ADMINISTRATEURS SUPPLÉMENTAIRES

Le propriétaire peut nommer d’autres administrateurs.

Mais l’accès aux paramètres sensibles doit rester soumis à des permissions.

Exemple :

Administrateur RH :

peut gérer RH.

Administrateur sécurité :

peut gérer authentification et accès.

Administrateur finance :

peut gérer paramètres financiers.

Cela évite qu’un simple directeur RH puisse automatiquement modifier l’abonnement, les domaines DNS ou la sécurité de l’organisation.

\---

47\. MODULE RH : INVITATION D’UNE PERSONNE

L’invitation devient un processus professionnel.

Informations de base :

\- prénom ;  
\- nom ;  
\- email ;  
\- téléphone ;  
\- poste ;  
\- département ;  
\- manager ;  
\- statut de collaboration ;  
\- date prévue de début ;  
\- date prévue de fin ;  
\- type d’engagement ;  
\- modèle de contrat ;  
\- rémunération proposée ;  
\- modules ;  
\- rôle ;  
\- permissions ;  
\- message personnel.

\---

48\. L’INVITATION N’EST PAS ENCORE L’EMPLOYÉ

C’est une distinction importante.

Avant acceptation :

Invitation \= projet d’ajout.

Après acceptation :

Membership \= relation d’accès.

Après validation RH :

Employment/engagement record \= relation professionnelle.

Cela permet de gérer :

\- invitations refusées ;  
\- invitations expirées ;  
\- recrutement annulé ;  
\- personne qui n’accepte jamais ;  
\- changement de poste avant prise de fonction.

\---

49\. TYPE D’ENGAGEMENT

Le système doit distinguer les catégories.

Exemples :

\- emploi salarié ;  
\- stage ;  
\- apprentissage ;  
\- prestation ;  
\- conseil ;  
\- freelance ;  
\- mission temporaire ;  
\- autre.

Le contrat dépend ensuite de cette relation.

Il ne faut pas traiter :

“prestataire”

comme un simple “employé avec CDD”.

C’est une relation contractuelle différente.

Le modèle doit être conçu pour plusieurs juridictions.

\---

50\. CONTRAT DE TRAVAIL

Pour un salarié, les principaux modèles à prévoir au Bénin doivent notamment distinguer :

\- CDD ;  
\- CDI ;  
\- période d’essai associée au contrat selon les règles applicables.

Le Code du travail béninois accessible actuellement distingue explicitement CDD et CDI et encadre les conditions de l’engagement à l’essai. Le ministère du Travail publie également la loi n°2017-05 relative à l’embauche et à la rupture du contrat de travail.

Le système ne doit cependant jamais figer ces règles dans du code métier universel.

Elles doivent être configurables par pays et version réglementaire.

\---

51\. CDD

Lorsqu’un CDD est choisi, le système doit permettre de renseigner :

\- date de début ;  
\- date de fin ;  
\- durée ;  
\- motif ou contexte ;  
\- poste ;  
\- rémunération ;  
\- période d’essai si applicable ;  
\- conditions particulières ;  
\- lieu d’exécution ;  
\- renouvellement éventuel ;  
\- statut de validation.

Le système doit surveiller automatiquement :

\- date d’expiration ;  
\- échéance de renouvellement ;  
\- échéance de période d’essai ;  
\- documents manquants.

Le code du travail accessible actuellement au Bénin contient notamment des règles spécifiques sur la durée et l’écrit du CDD ; ces règles devront être revalidées avec la réglementation applicable au moment du déploiement et par pays.

\---

52\. CDI

Pour un CDI :

\- date de début ;  
\- période d’essai éventuelle ;  
\- rémunération ;  
\- poste ;  
\- lieu ;  
\- temps de travail ;  
\- avantages ;  
\- clauses ;  
\- statut.

Il n’existe pas de date automatique de fin.

Le système suit donc :

\- ancienneté ;  
\- période d’essai ;  
\- modifications contractuelles ;  
\- historique de carrière ;  
\- rémunération.

\---

53\. CONTRAT DE STAGE

Le stage doit être traité comme une catégorie distincte.

Il doit pouvoir contenir :

\- établissement de provenance ;  
\- formation ;  
\- période ;  
\- encadreur ;  
\- service ;  
\- objectifs ;  
\- gratification si applicable ;  
\- documents ;  
\- attestation de fin.

Il ne faut pas le forcer dans une logique CDI/CDD sans validation juridique.

Le modèle doit être paramétrable par pays.

\---

54\. CONTRAT DE PRESTATION

Le prestataire n’est pas nécessairement un salarié.

Le système doit pouvoir gérer :

\- objet de la mission ;  
\- livrables ;  
\- période ;  
\- montant ;  
\- mode de paiement ;  
\- échéancier ;  
\- conditions ;  
\- confidentialité ;  
\- propriété intellectuelle ;  
\- résiliation ;  
\- documents.

Le contrat de prestation doit être séparé des contrats de travail.

\---

55\. CONTRAT DE CONSULTANT

Même logique :

\- mission ;  
\- livrables ;  
\- durée ;  
\- honoraires ;  
\- échéancier ;  
\- obligations ;  
\- confidentialité ;  
\- propriété intellectuelle ;  
\- résiliation.

Le système doit éviter de mélanger cette relation avec la paie salariée.

\---

56\. RÉMUNÉRATION

Lors de l’invitation, l’entreprise peut définir une rémunération proposée.

Mais il faut distinguer :

Rémunération proposée

et

Rémunération contractuelle validée.

L’invitation peut contenir :

\- montant proposé ;  
\- devise ;  
\- fréquence ;  
\- nature : salaire, honoraires, gratification, etc.

Après acceptation et validation du contrat, la rémunération définitive devient une donnée RH officielle.

\---

57\. CONFIGURATION DE LA RÉMUNÉRATION

Pour les salariés :

\- salaire de base ;  
\- primes ;  
\- indemnités ;  
\- avantages ;  
\- retenues ;  
\- avances ;  
\- fréquence de paiement ;  
\- période de paie.

Pour un prestataire :

\- honoraires ;  
\- montant de mission ;  
\- échéancier.

Pour un stagiaire :

\- gratification si applicable.

Pour un consultant :

\- honoraires.

\---

58\. CNSS ET CHARGES

La paie future doit fonctionner avec un moteur de règles paramétrable.

Il ne faut jamais écrire :

“CNSS \= telle formule pour toujours”.

Les taux et règles doivent être versionnés.

Au Bénin, la CNSS distingue notamment la part patronale et la part salariale et précise les règles de déclaration et de versement. Certaines branches ont également des taux dépendant de la nature de l’activité.

Le système doit donc avoir :

Pays :

Bénin

Régime :

règles CNSS version X

Date d’effet :

date

Date de fin :

date éventuelle

Ainsi les changements réglementaires pourront être intégrés sans réécrire le module.

\---

59\. GÉNÉRATEUR DE CONTRATS

Le module RH doit prévoir un éditeur de modèles.

Un modèle est constitué de :

\- métadonnées ;  
\- titre ;  
\- clauses ;  
\- articles ;  
\- variables ;  
\- annexes ;  
\- signature ;  
\- cachet ;  
\- version.

\---

60\. CONSTRUCTION PAR ARTICLES

L’utilisateur autorisé doit pouvoir construire un contrat article par article.

Exemple :

Article 1 — Objet

Article 2 — Fonction

Article 3 — Lieu de travail

Article 4 — Rémunération

Article 5 — Durée

Article 6 — Période d’essai

Article 7 — Congés

Article 8 — Obligations

Article 9 — Confidentialité

Article 10 — Résiliation

etc.

L’ordre des articles doit pouvoir être modifié.

\---

61\. VARIABLES DYNAMIQUES

Les modèles peuvent utiliser des variables.

Exemples :

{{employee.first\_name}}

{{employee.last\_name}}

{{employee.position}}

{{company.name}}

{{company.address}}

{{contract.start\_date}}

{{contract.end\_date}}

{{compensation.base\_salary}}

{{manager.name}}

Le système remplace automatiquement les variables lors de la génération.

\---

62\. VERSIONING DES MODÈLES

Un modèle de contrat ne doit jamais être simplement écrasé.

Il doit être versionné.

Exemple :

Contrat CDI — version 1

Contrat CDI — version 2

Contrat CDI — version 3

Une modification future ne doit pas modifier rétroactivement les contrats déjà générés.

Chaque contrat généré doit conserver :

\- modèle utilisé ;  
\- version du modèle ;  
\- données au moment de la génération ;  
\- date ;  
\- auteur ;  
\- modifications ;  
\- statut.

\---

63\. MODÈLES GLOBAUX AFRIBIZ

La plateforme principale peut fournir des modèles de base.

Exemples :

\- CDI ;  
\- CDD ;  
\- stage ;  
\- apprentissage ;  
\- prestation ;  
\- consultant ;  
\- attestation de travail ;  
\- attestation de stage ;  
\- certificat de collaboration.

Mais ces modèles doivent être :

\- spécifiques au pays ;  
\- versionnés ;  
\- clairement identifiés ;  
\- personnalisables par l’entreprise.

Les modèles juridiques doivent être présentés comme modèles opérationnels et validés juridiquement avant une mise en production engageante.

\---

64\. SEEDING À LA CRÉATION D’UN TENANT

Lorsqu’une entreprise est créée, le système peut précharger des données standards.

Mais ces données ne doivent pas être directement partagées comme des références immuables avec le catalogue global.

Le tenant doit recevoir une copie/version initiale.

Cela permettra à l’entreprise de modifier son modèle sans modifier le modèle global.

\---

65\. DONNÉES PAR DÉFAUT D’UN TENANT

À la création :

Postes suggérés

\- Direction ;  
\- Administration ;  
\- Comptabilité ;  
\- Finance ;  
\- Ressources humaines ;  
\- Commercial ;  
\- Marketing ;  
\- Technique ;  
\- Opérations ;  
\- Support.

Départements suggérés

\- Direction ;  
\- Administration ;  
\- Finance ;  
\- RH ;  
\- Commercial ;  
\- Opérations.

Modèles de contrats suggérés

Selon pays :

\- CDI ;  
\- CDD ;  
\- stage ;  
\- prestation ;  
\- consultant.

Modèles de documents

\- attestation ;  
\- lettre ;  
\- note interne ;  
\- certificat ;  
\- courrier.

Catégories RH

\- actif ;  
\- période d’essai ;  
\- suspendu ;  
\- congé ;  
\- départ ;  
\- archivé.

Permissions

Catalogue standard fourni par AfriBiz Suite.

\---

66\. LES DONNÉES PAR DÉFAUT DOIVENT RESTER MODIFIABLES

Le tenant doit pouvoir :

\- modifier ;  
\- désactiver ;  
\- archiver ;  
\- créer ;  
\- dupliquer ;  
\- personnaliser.

Mais le système doit distinguer :

Donnée système

Donnée tenant

Exemple :

“Comptable” peut être fourni comme poste système.

Sofitarcom peut le personnaliser.

Mais le poste système original reste intact au niveau global.

\---

67\. DOCUMENTS ET SIGNATURES DE L’ENTREPRISE

L’entreprise doit pouvoir définir ses éléments officiels :

\- logo ;  
\- cachet ;  
\- signatures autorisées ;  
\- signature du dirigeant ;  
\- signature RH ;  
\- signature financière ;  
\- coordonnées ;  
\- informations légales.

Ces éléments peuvent être utilisés dans :

\- contrats ;  
\- attestations ;  
\- lettres ;  
\- factures ;  
\- rapports ;  
\- documents RH.

\---

68\. SIGNATURE ET CACHEt

Une image de signature ou de cachet peut être téléversée.

Le système peut proposer :

\- suppression automatique du fond ;  
\- transparence ;  
\- nettoyage ;  
\- recadrage ;  
\- redimensionnement ;  
\- prévisualisation.

Mais cette image ne doit pas être présentée automatiquement comme une signature électronique juridiquement équivalente à une signature électronique qualifiée ou réglementée.

Il s’agit d’abord d’un spécimen graphique.

Une véritable signature électronique devra être un futur workflow spécifique avec :

\- consentement ;  
\- identité ;  
\- horodatage ;  
\- traçabilité ;  
\- intégrité du document ;  
\- preuve ;  
\- éventuellement OTP ;  
\- mécanisme de signature conforme au cadre légal ciblé.

\---

69\. SIGNATURE DE LA PERSONNE

Chaque utilisateur peut également disposer d’un “spécimen de signature”.

Ce spécimen appartient à son espace personnel.

Il peut être partagé avec une entreprise lorsqu’il est nécessaire à la production de documents.

L’entreprise ne doit pas avoir automatiquement accès à toutes les signatures personnelles.

\---

70\. ACCEPTATION D’UN CONTRAT

Lorsqu’une invitation implique un contrat :

1\. contrat préparé ;  
2\. invitation envoyée ;  
3\. utilisateur crée ou connecte son compte ;  
4\. utilisateur voit le résumé de la proposition ;  
5\. utilisateur consulte le contrat ;  
6\. utilisateur accepte ou refuse ;  
7\. si signature requise, signature ;  
8\. contrat finalisé ;  
9\. PDF final généré ;  
10\. copie conservée dans l’entreprise ;  
11\. copie visible dans l’espace personnel de la personne.

\---

71\. NE PAS CONFONDRE “ACCEPTER L’INVITATION” ET “SIGNER LE CONTRAT”

Le système doit pouvoir distinguer :

Invitation acceptée

Contrat accepté

Contrat signé

Prise de fonction validée

Ces quatre états peuvent être différents.

Une personne peut accepter l’accès au système mais ne pas avoir encore signé son contrat.

\---

72\. CONTRAT FINAL IMMUTABLE

Une fois le contrat final validé/signé :

Le PDF final doit être conservé comme un document figé.

Une modification ultérieure ne doit jamais modifier rétroactivement le contrat original.

Toute modification nécessite :

\- avenant ;  
\- nouvelle version ;  
\- nouveau document ;  
\- historique.

\---

73\. ESPACE PERSONNEL : CONTRATS REÇUS

Après finalisation :

La personne voit :

Mon espace personnel

→ Documents reçus

→ Sofitarcom

→ Contrat de travail

→ Version finale

Elle peut :

\- consulter ;  
\- télécharger ;  
\- partager selon les règles ;  
\- conserver.

\---

74\. EXPIRATION ET ALERTES

Le système doit suivre les dates importantes :

\- fin CDD ;  
\- fin stage ;  
\- période d’essai ;  
\- fin mission ;  
\- renouvellement ;  
\- échéance document ;  
\- échéance permis ;  
\- échéance administrative.

Des notifications peuvent être déclenchées automatiquement.

\---

75\. OFFBOARDING

Quand une personne quitte l’entreprise :

L’entreprise peut :

\- désactiver son accès ;  
\- clôturer son engagement ;  
\- renseigner la date de départ ;  
\- produire une attestation ;  
\- remettre les documents ;  
\- archiver les éléments RH.

La personne garde dans son espace personnel les documents qui lui ont été remis et son historique professionnel.

Elle ne garde pas l’accès aux données internes de l’entreprise.

\---

76\. SÉPARATION STRICTE DES DONNÉES

Un document d’entreprise ne devient pas personnel simplement parce qu’il est visible dans l’espace personnel.

Le système doit distinguer :

Propriétaire de la donnée

et

Bénéficiaire d’un partage.

Exemple :

Contrat de travail

Propriété organisationnelle :

Sofitarcom

Bénéficiaire :

Koffi

Ainsi les responsabilités restent claires.

\---

77\. DOCUMENT PERSONNEL

L’utilisateur peut également importer ses propres documents :

\- CV ;  
\- diplôme ;  
\- pièce d’identité ;  
\- acte de naissance ;  
\- attestations ;  
\- certificats ;  
\- documents professionnels.

Ces documents ne doivent pas être accessibles à une entreprise sans autorisation explicite.

\---

78\. PERMISSIONS SUR DOCUMENTS

Les documents doivent pouvoir avoir :

\- privé ;  
\- partagé avec entreprise ;  
\- partagé par lien ;  
\- visible par RH ;  
\- visible par manager ;  
\- visible par personne désignée.

\---

79\. INVITATION : PARCOURS COMPLET

Le processus recommandé devient :

Étape 1

RH ou administrateur clique sur :

Ajouter une personne.

Étape 2

Choix :

\- employé ;  
\- stagiaire ;  
\- prestataire ;  
\- consultant ;  
\- autre.

Étape 3

Informations personnelles.

Étape 4

Poste.

Étape 5

Département.

Étape 6

Manager.

Étape 7

Type d’engagement.

Étape 8

Contrat/modèle.

Étape 9

Rémunération proposée.

Étape 10

Modules.

Étape 11

Rôle.

Étape 12

Permissions.

Étape 13

Date de début.

Étape 14

Documents requis.

Étape 15

Prévisualisation.

Étape 16

Envoi.

\---

80\. LE SYSTÈME DOIT ÉVITER DE DEMANDER TROP DE CHOSES

Le formulaire ne doit pas être une énorme page.

Il doit être progressif.

Exemple :

“Qui souhaitez-vous ajouter ?”

Puis :

“Quel poste ?”

Puis :

“Quel type de relation ?”

Puis :

“Quel accès ?”

Puis :

“Quel contrat ?”

Le système adapte les questions au contexte.

\---

81\. PERMISSIONS CALCULÉES À PARTIR DU POSTE

Lors de l’invitation :

Poste :

Comptable

Le système propose automatiquement :

Modules :

\- Comptabilité ;  
\- Facturation ;  
\- Paiements ;  
\- Dépenses.

Puis propose :

Permissions recommandées.

L’administrateur peut :

\- accepter la configuration ;  
\- modifier ;  
\- ajouter ;  
\- retirer.

Cela réduit considérablement le travail administratif.

\---

82\. MODULE ACTIVÉ ≠ PERMISSION

C’est une règle fondamentale.

Une entreprise peut avoir le module Comptabilité actif.

Cela ne signifie pas que tous les employés y ont accès.

Exemple :

Module Comptabilité :

activé.

Koffi :

permission de lecture.

Awa :

permission de création.

Fernando :

permission complète.

\---

83\. ORDRE D’APPLICATION DES ACCÈS

Le système doit considérer :

1\. Le module est-il activé pour le tenant ?  
2\. L’utilisateur a-t-il accès à ce module ?  
3\. Son rôle possède-t-il la permission ?  
4\. Une permission directe la modifie-t-elle ?  
5\. La portée autorise-t-elle cette donnée ?  
6\. Une règle de sécurité particulière bloque-t-elle l’action ?

Si le module n’est pas activé :

l’utilisateur ne peut jamais l’utiliser, même s’il possède théoriquement la permission.

\---

84\. APPROBATION ET SÉPARATION DES TÂCHES

AfriBiz Suite doit prévoir que certaines actions sensibles ne soient pas faites par une seule personne.

Exemple :

Création d’une facture

→ validation

→ envoi.

Création d’une dépense

→ validation.

Création d’un contrat

→ validation RH.

Modification du salaire

→ validation administrateur.

Cela prépare le système aux entreprises plus grandes.

\---

85\. ADMINISTRATION RH

Le module RH doit permettre aux administrateurs autorisés de gérer :

\- départements ;  
\- postes ;  
\- collaborateurs ;  
\- statuts ;  
\- contrats ;  
\- documents ;  
\- rémunérations ;  
\- présence ;  
\- congés ;  
\- historique.

Mais ces fonctionnalités doivent toutes utiliser les permissions du socle central.

\---

86\. PARAMÈTRES DE L’ENTREPRISE

Les paramètres doivent rester un espace d’administration.

Ils doivent contenir :

Identité

\- nom ;  
\- nom légal ;  
\- logo ;  
\- IFU ;  
\- RCCM ;  
\- adresse.

Apparence

\- thème ;  
\- couleurs ;  
\- template login ;  
\- branding.

Accès

\- administrateurs ;  
\- rôles ;  
\- politiques.

Modules

\- modules activés ;  
\- configuration.

RH

\- configurations RH générales ;  
\- règles ;  
\- modèles.

Documents

\- modèles ;  
\- signatures ;  
\- cachets.

Domaine

\- sous-domaine ;  
\- domaines personnalisés.

Messagerie

\- domaine d’envoi ;  
\- expéditeur ;  
\- modèles d’emails.

Sécurité

\- sessions ;  
\- politiques ;  
\- 2FA ;  
\- audit.

\---

87\. CE QUI DOIT ÊTRE DANS LE MODULE RH ET NON DANS LES PARAMÈTRES

La logique métier RH doit vivre dans le module RH.

Les paramètres doivent seulement définir les configurations globales.

Exemple :

Créer un poste :

RH.

Gérer un employé :

RH.

Créer une invitation :

RH ou Administration selon les permissions.

Créer un modèle de contrat :

RH.

Configurer une politique générale :

Paramètres RH.

Cette séparation évite de transformer les paramètres en “deuxième RH”.

\---

88\. MODULE HR COMME PREMIER MODULE MÉTIER

Le module RH peut être le premier grand module métier construit, mais uniquement après le socle.

Ordre :

Socle

\- identité ;  
\- authentification ;  
\- tenant ;  
\- domaine ;  
\- session ;  
\- membership ;  
\- rôles ;  
\- permissions ;  
\- modules ;  
\- audit ;  
\- notifications ;  
\- documents ;  
\- messagerie.

Puis RH

\- départements ;  
\- postes ;  
\- personnes ;  
\- engagements ;  
\- invitations ;  
\- contrats ;  
\- documents RH ;  
\- rémunération.

\---

89\. SOCLE TECHNIQUE FONCTIONNEL À FINALISER AVANT RH

Avant de commencer le développement profond du RH, le système doit savoir :

\- qui est l’utilisateur ;  
\- quel tenant est courant ;  
\- quel membership existe ;  
\- quel rôle est actif ;  
\- quelles permissions existent ;  
\- quels modules sont actifs ;  
\- quels domaines correspondent au tenant ;  
\- quel branding correspond au tenant ;  
\- quelles notifications doivent être envoyées ;  
\- où sont les documents ;  
\- comment tracer les événements.

\---

90\. AUDIT OBLIGATOIRE DE LA CODEBASE AVANT MODIFICATION

Le LLM chargé du développement doit commencer par un audit.

Il doit produire une matrice :

Domaine| État actuel| Niveau| Compatible cible| Action  
Authentification| ...| complet/partiel| oui/non| ...  
Users| ...| ...| ...| ...  
Tenants| ...| ...| ...| ...  
Memberships| ...| ...| ...| ...  
Subdomains| ...| ...| ...| ...  
Branding| ...| ...| ...| ...  
Invitations| ...| ...| ...| ...  
Roles| ...| ...| ...| ...  
Permissions| ...| ...| ...| ...  
RH| ...| ...| ...| ...  
Contracts| ...| ...| ...| ...  
Documents| ...| ...| ...| ...  
Email| ...| ...| ...| ...  
DNS| ...| ...| ...| ...

\---

91\. LE LLM DOIT DISTINGUER

Pour chaque fonctionnalité :

Déjà entièrement implémenté

fonctionnelle et exploitable.

Partiellement implémenté

fonctionne mais ne respecte pas encore la cible.

Prototype

interface présente mais logique absente.

Mock

données simulées.

Architecture existante incompatible

nécessite refonte.

Absent

à construire.

\---

92\. LE LLM NE DOIT PAS CASSER L’EXISTANT SANS RAISON

Avant toute refonte :

Il doit déterminer :

\- ce qui dépend de la fonctionnalité ;  
\- les routes utilisées ;  
\- les composants ;  
\- les données ;  
\- les relations ;  
\- les APIs ;  
\- les effets secondaires.

Il doit proposer :

Migration progressive

plutôt que :

suppression brutale.

\---

93\. ORDRE DE CONSTRUCTION RECOMMANDÉ

Phase 0 — Audit

Aucune implémentation.

Analyse complète.

Livrable :

rapport d’écart.

\---

94\. PHASE 1 — SOCLE D’IDENTITÉ

\- compte personnel ;  
\- vérification ;  
\- session ;  
\- récupération ;  
\- profil ;  
\- sécurité.

\---

95\. PHASE 2 — SOCLE MULTI-TENANT

\- tenant ;  
\- membership ;  
\- résolution du tenant ;  
\- sous-domaines ;  
\- domaines personnalisés ;  
\- contexte courant ;  
\- séparation des données.

\---

96\. PHASE 3 — AUTHENTIFICATION CONTEXTUALISÉE

\- login principal ;  
\- login entreprise ;  
\- session centrale ;  
\- contrôle membership ;  
\- refus d’accès ;  
\- invitation ;  
\- accès direct.

\---

97\. PHASE 4 — SOCLE DES AUTORISATIONS

\- modules ;  
\- fonctionnalités ;  
\- permissions ;  
\- rôles ;  
\- scopes ;  
\- administration ;  
\- audit.

\---

98\. PHASE 5 — BRANDING ET TENANT EXPERIENCE

\- logo ;  
\- couleurs ;  
\- templates login ;  
\- branding dashboard ;  
\- fallback ;  
\- prévisualisation ;  
\- personnalisation.

\---

99\. PHASE 6 — MESSAGERIE ET DOMAINES

\- email transactionnel ;  
\- templates ;  
\- queue ;  
\- événements ;  
\- domaine d’envoi ;  
\- DNS ;  
\- SPF ;  
\- DKIM ;  
\- DMARC ;  
\- domaines web personnalisés.

\---

100\. PHASE 7 — SOCLE RH

\- départements ;  
\- postes ;  
\- statuts de collaboration ;  
\- collaborateurs ;  
\- managers ;  
\- engagements ;  
\- documents RH.

\---

101\. PHASE 8 — INVITATION RH

\- invitation ;  
\- contrat proposé ;  
\- rémunération proposée ;  
\- modules ;  
\- rôle ;  
\- permissions ;  
\- documents requis ;  
\- acceptation.

\---

102\. PHASE 9 — CONTRATS

\- catalogue ;  
\- modèles ;  
\- articles ;  
\- variables ;  
\- versioning ;  
\- génération ;  
\- validation ;  
\- signature ;  
\- PDF ;  
\- historique.

\---

103\. PHASE 10 — ESPACE PERSONNEL

\- documents personnels ;  
\- documents reçus ;  
\- contrats ;  
\- attestations ;  
\- profil professionnel ;  
\- historique professionnel.

\---

104\. PHASE 11 — PAIE ET RH AVANCÉ

\- rémunération ;  
\- primes ;  
\- retenues ;  
\- CNSS ;  
\- congés ;  
\- présence ;  
\- fiches de paie ;  
\- déclarations.

Les règles doivent être paramétrables par pays et par période réglementaire.

\---

105\. ARCHITECTURE DE GOUVERNANCE DES DONNÉES

Il faut distinguer :

Catalogue global AfriBiz

Contient :

\- permissions ;  
\- modules ;  
\- templates ;  
\- pays ;  
\- règles ;  
\- modèles de postes ;  
\- modèles de contrats.

Configuration tenant

Contient :

\- activation modules ;  
\- branding ;  
\- postes propres ;  
\- contrats personnalisés ;  
\- permissions personnalisées ;  
\- domaines.

Données métier tenant

Contient :

\- employés ;  
\- contrats ;  
\- factures ;  
\- clients ;  
\- documents ;  
\- paiements.

Cette séparation est essentielle pour la maintenance.

\---

106\. VERSIONING DES CONFIGURATIONS

Les règles importantes doivent être versionnées.

Exemples :

\- contrat ;  
\- modèle de document ;  
\- règle CNSS ;  
\- modèle d'email ;  
\- permission ;  
\- thème ;  
\- politique.

Une modification ne doit pas réécrire l'historique.

\---

107\. AUDIT LOG GLOBAL

Tout événement sensible doit être journalisé.

Exemples :

\- connexion ;  
\- invitation ;  
\- acceptation ;  
\- changement rôle ;  
\- changement permission ;  
\- suppression utilisateur ;  
\- changement contrat ;  
\- changement salaire ;  
\- téléchargement document sensible ;  
\- modification domaine ;  
\- modification DNS ;  
\- modification branding ;  
\- transfert propriété.

Log :

\- qui ;  
\- quoi ;  
\- quand ;  
\- tenant ;  
\- avant ;  
\- après ;  
\- origine ;  
\- éventuellement IP/appareil.

\---

108\. SÉCURITÉ MULTI-TENANT

La règle fondamentale reste :

Aucune donnée métier ne doit être retournée sans vérification du tenant courant.

Une URL n’est jamais une preuve d’autorisation.

Exemple :

/sofitarcom/invoices/123

n’implique pas que l’utilisateur a le droit d’accéder à la facture 123\.

Le système doit vérifier :

\- utilisateur ;  
\- tenant ;  
\- membership ;  
\- permission ;  
\- portée ;  
\- statut de la ressource.

\---

109\. PROTECTION DES ADMINISTRATEURS

Certaines opérations doivent demander une confirmation renforcée.

Exemples :

\- suppression entreprise ;  
\- transfert de propriété ;  
\- changement d’administrateur principal ;  
\- changement domaine ;  
\- modification messagerie ;  
\- suppression d’un rôle ;  
\- modification salaire ;  
\- suppression contrat ;  
\- export massif.

Une authentification renforcée pourra être ajoutée plus tard.

\---

110\. DONNÉES DE CONFIGURATION PAR DÉFAUT

À la création du tenant, AfriBiz Suite doit pouvoir créer automatiquement :

\- thème par défaut ;  
\- modules ;  
\- rôles ;  
\- permissions ;  
\- départements proposés ;  
\- postes proposés ;  
\- catégories RH ;  
\- modèles de contrat ;  
\- modèles de document ;  
\- modèles email ;  
\- notifications ;  
\- paramètres régionaux ;  
\- devises ;  
\- moyens de paiement.

\---

111\. DÉPENDANCE ENTRE MODULES

Les modules peuvent avoir des dépendances.

Exemple :

RH

dépend de :

\- users ;  
\- documents ;  
\- rôles ;  
\- permissions.

Paie

dépend de :

\- RH ;  
\- contrats ;  
\- rémunération ;  
\- règles pays.

Comptabilité

dépend de :

\- facturation ;  
\- paiements ;  
\- dépenses ;  
\- référentiel financier.

Le système doit savoir :

module actif

mais aussi :

module requis.

\---

112\. CONFIGURATION PAR SECTEUR

À la création de tenant, les modules proposés dépendent du secteur.

Mais l’activation automatique doit rester un système de recommandation.

Exemple :

Agence

→ Clients

→ Projets

→ Tâches

→ Facturation

→ Documents

Restaurant

→ Commandes

→ Tables

→ Caisse

→ Stocks

→ Personnel

L’entreprise peut ensuite activer ou désactiver ce qui est approprié selon son offre.

\---

113\. PLAN COMMERCIAL ET MODULES

Les modules doivent également dépendre :

\- du plan ;  
\- des limites ;  
\- des licences ;  
\- des fonctionnalités premium.

Il faut donc avoir :

Tenant → abonnement → droits fonctionnels

et non :

Utilisateur → accès uniquement.

\---

114\. SYSTÈME DE LIMITES

Exemples :

\- nombre d’utilisateurs ;  
\- nombre d’entreprises ;  
\- espace disque ;  
\- nombre de documents ;  
\- nombre de modèles ;  
\- nombre de domaines ;  
\- nombre de templates ;  
\- modules premium.

Les limites ne doivent pas être dispersées dans chaque module.

Elles doivent être gérées par le socle abonnement/quota.

\---

115\. EXPÉRIENCE PERSONNELLE \+ ENTREPRISE

Le parcours final doit être :

Personne

afribizsuite.com

↓

Dashboard personnel

↓

Mes espaces

↓

Sofitarcom

↓

sofitarcom.afribizsuite.com

↓

Dashboard entreprise.

Puis :

RH

↓

Koffi

↓

Contrat

↓

Contrat finalisé

↓

Document envoyé à Koffi

↓

Espace personnel de Koffi.

On obtient ainsi une continuité complète entre :

personne → entreprise → RH → document → personne.

\---

116\. EXEMPLE COMPLET

Fernando possède Sofitarcom.

Il crée dans RH le poste :

Comptable.

Le système propose les modules :

\- Comptabilité ;  
\- Facturation ;  
\- Paiements ;  
\- Dépenses ;  
\- Rapports.

Fernando invite Koffi.

Statut :

Employé.

Poste :

Comptable.

Département :

Finance.

Contrat :

CDI.

Rémunération proposée :

250 000 FCFA / mois.

Modules :

Comptabilité \+ Facturation \+ Paiements \+ Dépenses.

Permissions :

\- lire ;  
\- créer ;  
\- modifier ;  
\- exporter.

Koffi reçoit :

“Vous êtes invité à rejoindre Sofitarcom.”

Il clique.

Il n’a pas de compte.

Il crée son compte personnel.

Son espace personnel est immédiatement disponible.

Il accepte l’invitation.

Le système crée :

\- compte personnel ;  
\- membership Sofitarcom ;  
\- profil collaborateur ;  
\- engagement RH ;  
\- contrat en attente de validation/signature.

Koffi entre dans :

sofitarcom.afribizsuite.com

Son compte personnel est reconnu.

Son accès est vérifié.

Il arrive sur son dashboard.

Il ne voit pas tout.

Il voit uniquement :

\- Comptabilité ;  
\- Facturation ;  
\- Paiements ;  
\- Dépenses ;  
\- Rapports.

Le contrat finalisé apparaît aussi dans :

Mon espace personnel → Documents reçus → Sofitarcom.

\---

117\. ÉVOLUTION FUTURE VERS LE RECRUTEMENT

Cette architecture prépare naturellement le recrutement.

Une entreprise pourra plus tard :

\- publier un poste ;  
\- publier une offre ;  
\- consulter les profils ;  
\- demander un dossier ;  
\- recevoir une candidature ;  
\- envoyer une invitation ;  
\- créer une proposition ;  
\- transformer la proposition en engagement ;  
\- générer un contrat ;  
\- créer le membership ;  
\- activer les permissions.

La personne possédant déjà un profil personnel :

\- n’a pas besoin de recréer toute son identité ;  
\- peut réutiliser son CV ;  
\- peut partager certains documents ;  
\- peut accepter l’offre ;  
\- peut rejoindre l’entreprise.

\---

118\. PRINCIPE CENTRAL À CONSERVER

Il faut absolument éviter de transformer AfriBiz Suite en une accumulation de modules indépendants.

Toutes les fonctionnalités doivent reposer sur le même socle.

Ce socle est :

Personne  
↓  
Identité  
↓  
Entreprise  
↓  
Membership  
↓  
Rôle  
↓  
Permission  
↓  
Module  
↓  
Fonctionnalité  
↓  
Action  
↓  
Portée

Et côté RH :

Personne  
↓  
Entreprise  
↓  
Engagement  
↓  
Poste  
↓  
Contrat  
↓  
Rémunération  
↓  
Documents  
↓  
Historique.

\---

119\. DÉCISION ARCHITECTURALE FINALE

AfriBiz Suite doit fonctionner comme suit :

Niveau 1 — Identité

Une personne physique.

Niveau 2 — Espace personnel

Son identité professionnelle.

Niveau 3 — Entreprise

Son ou ses espaces professionnels.

Niveau 4 — Membership

La relation entre la personne et l’entreprise.

Niveau 5 — Administration

Rôles et permissions.

Niveau 6 — Modules

Fonctionnalités disponibles pour l’entreprise.

Niveau 7 — Métier

RH, facturation, CRM, comptabilité, projets, etc.

\---

120\. RÈGLE DE DÉVELOPPEMENT À DONNER AU LLM

Avant toute modification du code :

1\. Auditer.  
2\. Cartographier.  
3\. Comparer.  
4\. Identifier les conflits.  
5\. Identifier les dépendances.  
6\. Proposer une architecture cible.  
7\. Proposer une stratégie de migration.  
8\. Proposer un ordre d’implémentation.  
9\. Signaler les éléments susceptibles de casser l’existant.  
10\. Attendre validation.

Ne jamais :

\- réécrire massivement sans analyse ;  
\- supprimer une fonctionnalité fonctionnelle sans justification ;  
\- remplacer une architecture existante sans vérifier ses dépendances ;  
\- mélanger données mock et données réelles ;  
\- faire passer une démonstration UI pour une fonctionnalité réelle ;  
\- introduire des règles métier non vérifiées.

\---

121\. LIVRABLE ATTENDU DU LLM AVANT CODAGE

Le LLM doit fournir un rapport structuré contenant :

A. Architecture actuelle

Ce qui existe.

B. Architecture cible

Ce qui doit exister.

C. Écart

Ce qui manque.

D. Compatibilité

Ce qui peut être conservé.

E. Refactoring

Ce qui doit être modifié.

F. Migration

Ce qui doit être transféré.

G. Risques

Ce qui peut casser.

H. Priorité

Blocants / importants / secondaires.

I. Plan d’exécution

Étape 1 → étape 2 → étape 3\.

J. Validation

Le développeur doit attendre l’autorisation avant les changements structurants.

\---

122\. CRITÈRES D’ACCEPTATION DU SOCLE

Le socle sera considéré comme solide lorsque :

\- une personne peut avoir une identité unique ;  
\- elle possède un espace personnel ;  
\- elle peut appartenir à plusieurs entreprises ;  
\- chaque entreprise a son tenant ;  
\- chaque tenant possède son sous-domaine ;  
\- un domaine personnalisé peut être prévu ;  
\- le login entreprise utilise l’identité centrale ;  
\- l’accès est vérifié par membership ;  
\- il n’existe pas d’inscription publique depuis un tenant ;  
\- une invitation peut créer un compte ;  
\- les rôles sont séparés des postes ;  
\- les permissions sont séparées des rôles ;  
\- les modules sont séparés des permissions ;  
\- les données sont isolées par tenant ;  
\- l’audit existe ;  
\- les modèles sont versionnés ;  
\- le branding est tenant-scopé ;  
\- le mailing est tenant-aware ;  
\- le RH peut s’appuyer sur le socle.

\---

123\. RÈGLE DE PHILOSOPHIE PRODUIT

AfriBiz Suite ne doit pas simplement donner aux entreprises des fonctionnalités.

Elle doit leur donner une infrastructure professionnelle.

Une entreprise doit pouvoir entrer dans son espace et trouver :

\- son identité ;  
\- ses employés ;  
\- ses contrats ;  
\- ses documents ;  
\- ses clients ;  
\- ses opérations ;  
\- ses finances ;  
\- ses règles ;  
\- ses utilisateurs ;  
\- ses accès ;  
\- ses communications ;  
\- son historique.

Et une personne doit pouvoir entrer dans son espace personnel et retrouver :

\- qui elle est ;  
\- où elle travaille ;  
\- où elle a travaillé ;  
\- ses documents ;  
\- ses contrats ;  
\- ses attestations ;  
\- ses accès ;  
\- son parcours professionnel.

\---

124\. PRINCIPE FINAL

Une personne est une identité.

Une entreprise est un tenant.

Un sous-domaine représente un tenant.

Un workspace n’est pas un compte utilisateur.

Un membership représente une relation.

Un poste représente une fonction.

Un statut représente une nature de collaboration.

Un rôle représente un ensemble de droits.

Une permission représente une action autorisée.

Un contrat représente un engagement.

Un document représente une information formalisée.

Un module représente une capacité.

Une fonctionnalité représente une opération.

Une action représente ce que l’utilisateur peut faire.

Une portée définit jusqu’où il peut le faire.

Cette séparation doit devenir le principe directeur de toute l’architecture AfriBiz Suite.

\---

125\. PRIORITÉ ABSOLUE POUR L’ÉTAPE ACTUELLE

Ne pas commencer directement par “coder tout le module RH”.

Commencer par finaliser le socle qui rend le module RH possible.

Ordre recommandé :

1\. Audit complet de la codebase.  
2\. Identité utilisateur.  
3\. Session centralisée.  
4\. Espace personnel.  
5\. Tenant.  
6\. Membership.  
7\. Résolution sous-domaine.  
8\. Authentification contextualisée.  
9\. Rôles.  
10\. Permissions.  
11\. Modules.  
12\. Branding tenant.  
13\. Domaine personnalisé.  
14\. Messagerie transactionnelle.  
15\. Invitations.  
16\. Départements.  
17\. Postes.  
18\. Statuts de collaboration.  
19\. Engagements.  
20\. Contrats.  
21\. Documents RH.  
22\. Rémunération.  
23\. Ensuite seulement : présences, congés, paie, CNSS et reste du module RH.

La réussite du module RH dépendra directement de la qualité de ce socle.

\---

126\. POSITIONNEMENT FINAL DU MODULE RH

Le module RH ne doit pas être considéré comme :

“un simple module où on ajoute des employés”.

Il doit devenir le système qui orchestre le cycle de vie professionnel d’une personne dans l’entreprise :

Invitation  
→ recrutement  
→ engagement  
→ accès  
→ poste  
→ contrat  
→ rémunération  
→ documents  
→ présence  
→ congés  
→ évolution  
→ changement de poste  
→ renouvellement  
→ départ  
→ archivage  
→ historique.

Cette architecture permettra ensuite de construire beaucoup plus facilement les autres modules.

\---

127\. INSTRUCTION FINALE AU LLM

Tu dois maintenant traiter cette spécification comme une vision cible à confronter à la codebase existante.

Tu ne dois pas supposer que les éléments décrits sont absents.

Tu ne dois pas supposer qu’ils sont correctement implémentés.

Tu dois vérifier.

Pour chaque élément :

\- inspecte l’existant ;  
\- localise le code ;  
\- identifie les données ;  
\- identifie les routes ;  
\- identifie les composants ;  
\- identifie les flux ;  
\- identifie les limitations ;  
\- classe le niveau d’implémentation ;  
\- évalue la compatibilité avec cette vision.

Ensuite, produis d’abord un rapport d’audit.

Le rapport doit répondre à :

“Voici ce que j’ai actuellement.”

“Voici ce que la vision V6 demande.”

“Voici ce qui correspond déjà.”

“Voici ce qui doit évoluer.”

“Voici ce qui doit être refactoré.”

“Voici ce qui doit être créé.”

“Voici les risques.”

“Voici l’ordre de migration recommandé.”

Aucune implémentation majeure ne doit commencer avant validation de ce rapport.

La priorité absolue est de construire un socle durable qui permette à AfriBiz Suite d’évoluer vers un ERP multi-tenant professionnel, sécurisé, personnalisable et extensible sans devoir refaire l’architecture à chaque nouveau module.  

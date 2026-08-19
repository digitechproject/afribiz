import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Users, FileText, Calendar, Building, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 glassmorphism border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md shadow-primary/20">
              A
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              AfriBiz Suite
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth"
              className="inline-flex h-10 items-center justify-center px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/10 hover:bg-primary/95 transition-all hover:scale-[1.02]"
            >
              Créer mon espace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 flex flex-col items-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 opacity-30 pointer-events-none">
          <div className="absolute -top-40 left-10 w-96 h-96 rounded-full bg-primary blur-[120px]" />
          <div className="absolute -top-20 right-10 w-96 h-96 rounded-full bg-secondary blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            La plateforme SaaS tout-en-un pour entrepreneurs africains
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl">
            Votre bureau numérique pour gérer votre entreprise simplement
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Centralisez vos clients, vos factures, vos projets et vos collaborateurs dans un espace de travail unique et multi-tenant, conçu pour la mobilité.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link
              href="/auth"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
            >
              Créer un espace gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center px-6 rounded-xl border border-border bg-card hover:bg-muted font-semibold transition-colors"
            >
              Démo interactive
            </Link>
          </div>

          {/* Premium UI Mockup preview */}
          <div className="w-full mt-16 rounded-2xl border border-border bg-card/50 p-2 shadow-2xl glassmorphism">
            <div className="rounded-xl border border-border/60 bg-background overflow-hidden aspect-[16/9] flex flex-col shadow-inner">
              {/* Mock Window Header */}
              <div className="h-10 border-b border-border px-4 flex items-center justify-between bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-card px-3 py-0.5 rounded border border-border">
                  afribizsuite.com/app/restoogo/dashboard
                </div>
                <div className="w-12" />
              </div>
              {/* Mock Dashboard Body */}
              <div className="flex-1 p-6 flex flex-col gap-6 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Bienvenue sur AfriBiz Suite, RestooGo 👋</h3>
                    <p className="text-xs text-muted-foreground">Voici l'aperçu de votre activité ce mois-ci.</p>
                  </div>
                  <span className="px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    Essai gratuit actif
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium">Clients</span>
                    <span className="text-2xl font-bold">12</span>
                    <span className="text-[10px] text-primary font-semibold">+3 ce mois-ci</span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium">Factures Impayées</span>
                    <span className="text-2xl font-bold text-amber-600">350,000 FCFA</span>
                    <span className="text-[10px] text-amber-600 font-semibold">2 relances en attente</span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium">Tâches Actives</span>
                    <span className="text-2xl font-bold text-primary">5 / 8</span>
                    <span className="text-[10px] text-muted-foreground">Dernière activité : aujourd'hui</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="features" className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Des modules adaptés à votre secteur d'activité
            </h2>
            <p className="text-muted-foreground">
              AfriBiz Suite s'adapte automatiquement à votre profil. Activez et configurez uniquement ce dont vous avez besoin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Clients & CRM</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Centralisez vos contacts, suivez vos prospects et gardez l'historique de vos échanges en un seul endroit.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Factures & Devis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Générez des factures professionnelles en FCFA ou autre devise, enregistrez les paiements et suivez les impayés.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Tâches & Projets</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Organisez le travail d'équipe, assignez des responsabilités et respectez vos échéances sans effort.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Multi-Workspace</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gérez plusieurs structures ou entreprises depuis votre compte unique, avec isolation totale des données.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Des tarifs clairs et sans surprise
            </h2>
            <p className="text-muted-foreground">
              Commencez avec un essai gratuit de 14 jours, puis choisissez l'offre qui correspond à la taille de votre entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Solo Plan */}
            <div className="p-8 rounded-2xl border border-border bg-card flex flex-col gap-6 shadow-sm">
              <div>
                <h3 className="font-bold text-xl">Offre Solo</h3>
                <p className="text-sm text-muted-foreground mt-1">Pour les freelances et auto-entrepreneurs.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold">5,000 FCFA</span>
                <span className="text-sm text-muted-foreground">/ mois</span>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> 1 utilisateur unique
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Facturation & CRM de base
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> 1 workspace d'entreprise
                </li>
              </ul>
              <Link
                href="/auth"
                className="inline-flex h-10 items-center justify-center px-4 rounded-lg border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Essayer gratuitement
              </Link>
            </div>

            {/* Starter Plan (Popular) */}
            <div className="p-8 rounded-2xl border-2 border-primary bg-card flex flex-col gap-6 shadow-md relative">
              <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                Populaire
              </span>
              <div>
                <h3 className="font-bold text-xl">Offre Starter</h3>
                <p className="text-sm text-muted-foreground mt-1">Pour les TPE et commerces en croissance.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold">15,000 FCFA</span>
                <span className="text-sm text-muted-foreground">/ mois</span>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Jusqu'à 5 collaborateurs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Modules complets (Factures, Tâches, CRM)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Rôles et permissions simples
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Support prioritaire
                </li>
              </ul>
              <Link
                href="/auth"
                className="inline-flex h-10 items-center justify-center px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/10 hover:bg-primary/95 transition-colors"
              >
                Démarrer l'essai gratuit
              </Link>
            </div>

            {/* Business Plan */}
            <div className="p-8 rounded-2xl border border-border bg-card flex flex-col gap-6 shadow-sm">
              <div>
                <h3 className="font-bold text-xl">Offre Business</h3>
                <p className="text-sm text-muted-foreground mt-1">Pour les PME, agences et structures établies.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold">35,000 FCFA</span>
                <span className="text-sm text-muted-foreground">/ mois</span>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Collaborateurs illimités
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Multi-workspaces illimités
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Rôles & permissions granulaires
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Intégration API & Rapports avancés
                </li>
              </ul>
              <Link
                href="/auth"
                className="inline-flex h-10 items-center justify-center px-4 rounded-lg border border-border hover:bg-muted text-sm font-semibold transition-colors"
              >
                Essayer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-muted/40 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-primary">AfriBiz Suite</span>
            <span className="text-xs text-muted-foreground">| © {new Date().getFullYear()} Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</a>
            <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

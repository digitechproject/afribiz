"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import {
  Users,
  FileText,
  Calendar,
  Building,
  CheckCircle2,
  Sparkles,
  Loader2,
  Check,
  Palette,
  Coins
} from "lucide-react";
import {
  saveOnboardingSector,
  saveOnboardingGoals,
  saveOnboardingBranding,
  saveOnboardingPlan,
  completeOnboarding
} from "@/modules/onboarding/actions";

export default function TenantOnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const companySlug = (params?.company_slug as string) || "";
  const step = searchParams.get("step") || "sector";

  // Stepper state
  const [selectedSector, setSelectedSector] = useState("AGENCY");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["clients", "invoices"]);
  const [primaryColor, setPrimaryColor] = useState("#0f766e"); // Emerald
  const [devise, setDevise] = useState("XOF"); // FCFA (West Africa)
  const [selectedPlan, setSelectedPlan] = useState("STARTER");
  const [formalizationLevel, setFormalizationLevel] = useState("PERSONAL_IFU_ONLY");

  // Step 6: Setup checklist simulation
  const [setupSteps, setSetupSteps] = useState([
    { label: "Création de l'espace entreprise", done: false },
    { label: "Activation des modules sectoriels", done: false },
    { label: "Préparation du tableau de bord", done: false },
    { label: "Sécurisation de vos accès", done: false }
  ]);

  useEffect(() => {
    if (step === "setup") {
      let currentStepIndex = 0;
      const interval = setInterval(() => {
        setSetupSteps((prev) => {
          const next = [...prev];
          if (next[currentStepIndex]) {
            next[currentStepIndex].done = true;
          }
          return next;
        });

        currentStepIndex++;
        if (currentStepIndex > 4) {
          clearInterval(interval);
          // Complete onboarding server action
          startTransition(async () => {
            const res = await completeOnboarding(companySlug);
            if (res.success && res.redirectTo) {
              router.push(res.redirectTo);
            }
          });
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [step, companySlug, router]);

  // Handles
  const handleSectorSubmit = () => {
    startTransition(async () => {
      const res = await saveOnboardingSector(companySlug, selectedSector);
      if (res.success && res.redirectTo) router.push(res.redirectTo);
    });
  };

  const handleGoalsSubmit = () => {
    startTransition(async () => {
      const res = await saveOnboardingGoals(companySlug, selectedGoals);
      if (res.success && res.redirectTo) router.push(res.redirectTo);
    });
  };

  const handleBrandingSubmit = () => {
    startTransition(async () => {
      const res = await saveOnboardingBranding(companySlug, primaryColor, devise, formalizationLevel);
      if (res.success && res.redirectTo) router.push(res.redirectTo);
    });
  };

  const handlePlanSubmit = () => {
    startTransition(async () => {
      const res = await saveOnboardingPlan(companySlug, selectedPlan);
      if (res.success && res.redirectTo) router.push(res.redirectTo);
    });
  };

  // Step indicator details
  const getStepNumber = () => {
    switch (step) {
      case "sector": return 3;
      case "goals": return 3;
      case "branding": return 4;
      case "plan": return 5;
      case "setup": return 5;
      default: return 3;
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans relative overflow-hidden items-center justify-center py-12 px-6">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-primary blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-secondary blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6 z-10 animate-fade-in">
        {step !== "setup" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Configuration de {companySlug.toUpperCase()}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight mt-1">
              {step === "sector" && "Quel est votre secteur d'activité ?"}
              {step === "goals" && "Que souhaitez-vous gérer en priorité ?"}
              {step === "branding" && "Personnalisez votre espace"}
              {step === "plan" && "Choisissez votre offre"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Étape {getStepNumber()} sur 5. Configurez vos besoins pour AfriBiz Suite.
            </p>
            {/* Progress Bar */}
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden mt-2 border border-border">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(getStepNumber() / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Wizard step cards */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8 glassmorphism">
          {/* STEP 1: SECTOR */}
          {step === "sector" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "FREELANCE", title: "Freelance / Indépendant", desc: "Consultants, développeurs, graphistes, rédacteurs.", icon: Users },
                  { id: "SHOP", title: "Commerce / Boutique", desc: "Vente de produits, gestion de stock, caisse, clients.", icon: FileText },
                  { id: "RESTAURANT", title: "Restaurant / Hôtel", desc: "Commandes de tables, menus, stocks, personnel.", icon: Calendar },
                  { id: "AGENCY", title: "Agence / Prestataire", desc: "Cabinets de conseil, agences immobilières, de com.", icon: Building }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSector(item.id)}
                      className={`p-5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                        selectedSector === item.id
                          ? "border-primary bg-primary/5 shadow-inner"
                          : "border-border bg-background/50 hover:border-primary/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedSector === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">{item.title}</span>
                      <span className="text-xs text-muted-foreground leading-relaxed">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleSectorSubmit}
                disabled={isPending}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 transition-all disabled:opacity-75 disabled:pointer-events-none"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Continuer
              </button>
            </div>
          )}

          {/* STEP 2: GOALS */}
          {step === "goals" && (
            <div className="flex flex-col gap-6">
              <p className="text-xs text-muted-foreground text-center mb-2">
                Sélectionnez au moins un objectif pour pré-configurer votre tableau de bord.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "clients", title: "Gérer mes clients (CRM)" },
                  { id: "invoices", title: "Créer des factures & devis" },
                  { id: "tasks", title: "Suivre mes tâches quotidiennes" },
                  { id: "projects", title: "Gérer mes projets d'équipe" },
                  { id: "stock", title: "Suivre mes produits & stocks" },
                  { id: "cashflow", title: "Piloter ma caisse & trésorerie" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleGoal(item.id)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedGoals.includes(item.id)
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background/50 hover:border-primary/50"
                    }`}
                  >
                    <span className="font-bold text-xs">{item.title}</span>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      selectedGoals.includes(item.id) ? "bg-primary border-primary text-primary-foreground" : "border-border"
                    }`}>
                      {selectedGoals.includes(item.id) && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleGoalsSubmit}
                disabled={isPending}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 transition-all disabled:opacity-75 disabled:pointer-events-none"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Continuer
              </button>
            </div>
          )}

          {/* STEP 3: BRANDING */}
          {step === "branding" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4" /> Couleur principale de l'espace
                </span>
                <div className="flex gap-4 justify-center py-2">
                  {[
                    { color: "#0f766e", name: "Emeraude" },
                    { color: "#ca8a04", name: "Or" },
                    { color: "#1d4ed8", name: "Bleu" },
                    { color: "#4f46e5", name: "Indigo" },
                    { color: "#7c3aed", name: "Violet" }
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setPrimaryColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                        primaryColor === c.color ? "border-foreground scale-105" : "border-transparent"
                      }`}
                    >
                      {primaryColor === c.color && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4" /> Devise de facturation par défaut
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "XOF", label: "FCFA (XOF)" },
                    { id: "EUR", label: "Euro (€)" },
                    { id: "USD", label: "Dollar ($)" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setDevise(item.id)}
                      className={`p-3 rounded-lg border text-xs font-bold text-center transition-all ${
                        devise === item.id ? "border-primary bg-primary/5 text-primary" : "border-border"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> Niveau de formalisation
                </span>
                <select
                  value={formalizationLevel}
                  onChange={(e) => setFormalizationLevel(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="NOT_FORMALIZED">Je ne suis pas encore formalisé / En cours</option>
                  <option value="PERSONAL_IFU_ONLY">J'ai uniquement mon IFU personnel</option>
                  <option value="ESTABLISHMENT_RCCM">Établissement individuel avec RCCM</option>
                  <option value="SOCIETY_RCCM_IFU">Société commerciale enregistrée (RCCM + IFU)</option>
                </select>
              </div>

              <button
                onClick={handleBrandingSubmit}
                disabled={isPending}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 transition-all disabled:opacity-75 disabled:pointer-events-none"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Continuer
              </button>
            </div>
          )}

          {/* STEP 4: PLAN */}
          {step === "plan" && (
            <div className="flex flex-col gap-6">
              <p className="text-xs text-muted-foreground text-center">
                Tous les plans commencent par un essai gratuit de 14 jours. Aucun paiement immédiat n'est requis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "SOLO", title: "Solo (Essai)", price: "5,000 FCFA/m", desc: "1 utilisateur unique, CRM, Factures." },
                  { id: "STARTER", title: "Starter (Essai)", price: "15,000 FCFA/m", desc: "Jusqu'à 5 utilisateurs, rôles simples." },
                  { id: "BUSINESS", title: "Business (Essai)", price: "35,000 FCFA/m", desc: "Utilisateurs illimités, multi-workspaces." },
                  { id: "ENTERPRISE", title: "Entreprise (Essai)", price: "Sur mesure", desc: "Support dédié, rapports personnalisés." }
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{plan.title}</span>
                      <span className="text-xs font-semibold text-primary">{plan.price}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-relaxed">{plan.desc}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handlePlanSubmit}
                disabled={isPending}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 transition-all disabled:opacity-75 disabled:pointer-events-none"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Démarrer l'essai gratuit
              </button>
            </div>
          )}

          {/* STEP 5: SETUP LOAD ANIMATION */}
          {step === "setup" && (
            <div className="flex flex-col items-center gap-6 py-6 text-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <Sparkles className="w-5 h-5 text-secondary absolute" />
              </div>

              <div>
                <h3 className="font-extrabold text-lg">Préparation de votre bureau numérique...</h3>
                <p className="text-xs text-muted-foreground mt-1">Veuillez patienter quelques secondes.</p>
              </div>

              {/* Steps Checklist */}
              <div className="w-full max-w-sm flex flex-col gap-3 border border-border bg-background/50 rounded-xl p-4 text-left">
                {setupSteps.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      s.done ? "bg-primary border-primary text-primary-foreground" : "border-border bg-card"
                    }`}>
                      {s.done ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                      )}
                    </div>
                    <span className={s.done ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

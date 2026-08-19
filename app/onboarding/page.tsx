"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { createCompany } from "@/modules/onboarding/actions";

export default function RootOnboardingPage() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await createCompany(prevState, formData);
      if (res.success && res.redirectTo) {
        router.push(res.redirectTo);
      }
      return res;
    },
    { success: false }
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans relative overflow-hidden items-center justify-center py-12 px-6">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-primary blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-secondary blur-[100px]" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 z-10 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/select-workspace"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour aux espaces
          </Link>
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md shadow-primary/20">
            A
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Créer votre espace entreprise
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Étape 2 sur 5 : Renseignez les informations de base de votre structure.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8 glassmorphism">
          <form action={formAction} className="flex flex-col gap-4">
            {state?.error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
                {state.error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Nom commercial
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ex. Sofitarcom"
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Raison sociale / Nom légal <span className="text-muted-foreground/60">(optionnel)</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  name="legalName"
                  placeholder="Ex. Sofitarcom SARL"
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Type d'activité
              </label>
              <select
                name="activityType"
                required
                defaultValue="FREELANCE"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="FREELANCE">Freelance / Travailleur indépendant</option>
                <option value="INDIVIDUAL_ESTABLISHMENT">Établissement individuel / Promoteur unique</option>
                <option value="SOCIETY">Société commerciale (SARL, SUARL, SAS, SA, GIE)</option>
                <option value="ONG_ASSOCIATION">ONG / Association / Projet communautaire</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Forme juridique <span className="text-muted-foreground/60">(Pour les sociétés)</span>
              </label>
              <select
                name="legalForm"
                defaultValue=""
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">-- Sans objet / Autre --</option>
                <option value="SARL">SARL (Société à Responsabilité Limitée)</option>
                <option value="SUARL">SUARL (Société Unipersonnelle à Resp. Limitée)</option>
                <option value="SAS">SAS (Société par Actions Simplifiée)</option>
                <option value="SA">SA (Société Anonyme)</option>
                <option value="GIE">GIE (Groupement d'Intérêt Économique)</option>
                <option value="SCI">SCI (Société Civile Immobilière)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Pays
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="country"
                    required
                    defaultValue="Bénin"
                    className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ville
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="city"
                    required
                    defaultValue="Cotonou"
                    className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Téléphone professionnel
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+229 01..."
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Email professionnel <span className="text-muted-foreground/60">(optionnel)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  placeholder="contact@sofitarcom.com"
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 transition-all active:scale-[0.98] mt-2 disabled:opacity-75 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création de l'espace...
                </>
              ) : (
                "Continuer"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, Sparkles } from "lucide-react";
import { loginUser } from "@/modules/auth/actions";

interface CompanyLoginFormProps {
  company: {
    name: string;
    legalName?: string | null;
    logo: string | null;
    primaryColor: string;
    secondaryColor?: string;
    slug: string;
    loginHeadline?: string | null;
    loginTagline?: string | null;
  };
}

export default function CompanyLoginForm({ company }: CompanyLoginFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      // Injecter automatiquement le slug du tenant en cours
      formData.set("tenantSlug", company.slug);
      const res = await loginUser(prevState, formData);
      if (res.success && res.redirectTo) {
        router.push(res.redirectTo);
      }
      return res;
    },
    { success: false }
  );

  useEffect(() => {
    if (company.primaryColor) {
      document.documentElement.style.setProperty("--primary", company.primaryColor);
      document.documentElement.style.setProperty("--color-primary", company.primaryColor);
    }
    if (company.secondaryColor) {
      document.documentElement.style.setProperty("--secondary", company.secondaryColor);
      document.documentElement.style.setProperty("--color-secondary", company.secondaryColor);
    }
  }, [company.primaryColor, company.secondaryColor]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans relative overflow-hidden items-center justify-center py-12 px-6">
      {/* Arrière-plan décoratif avec les couleurs personnalisées */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-15 pointer-events-none">
        <div 
          className="absolute top-10 left-10 w-96 h-96 rounded-full blur-[120px]" 
          style={{ backgroundColor: company.primaryColor }}
        />
        <div 
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: company.secondaryColor || "#0284c7" }}
        />
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 z-10 animate-fade-in">
        {/* En-tête de marque contextualisé */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          {company.logo ? (
            <img 
              src={company.logo} 
              alt={company.name} 
              className="h-14 w-auto object-contain mb-1 drop-shadow-sm"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
              style={{ 
                backgroundColor: company.primaryColor,
                boxShadow: `0 8px 16px -4px ${company.primaryColor}33`
              }}
            >
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          <h1 className="text-2xl font-extrabold tracking-tight mt-1.5">
            {company.loginHeadline || `Bienvenue chez ${company.name}`}
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            {company.loginTagline || "Connectez-vous pour accéder à votre espace de travail professionnel."}
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8 glassmorphism">
          <form action={formAction} className="flex flex-col gap-4">
            {state?.error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center animate-shake">
                {state.error}
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Email ou Téléphone
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  name="identifier"
                  required
                  placeholder="koffi@example.com ou +229..."
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Mot de passe
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs font-semibold hover:underline"
                  style={{ color: company.primaryColor }}
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-white font-semibold shadow-md transition-all active:scale-[0.98] mt-2 disabled:opacity-75 disabled:pointer-events-none"
              style={{ 
                backgroundColor: company.primaryColor,
                boxShadow: `0 4px 12px -2px ${company.primaryColor}25`
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        {/* Pied de page */}
        <div className="flex flex-col items-center gap-1 mt-4">
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: company.primaryColor }} />
            Propulsé par <span className="font-extrabold text-foreground">AfriBiz Suite</span>
          </p>
        </div>
      </div>
    </div>
  );
}

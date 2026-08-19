import Link from "next/link";
import { Building, LogIn, ArrowLeft } from "lucide-react";

export default function AuthChoicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans relative overflow-hidden items-center justify-center py-12 px-6">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-primary blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-secondary blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-8 items-center z-10 animate-fade-in">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/20">
            A
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            AfriBiz Suite
          </h1>
          <p className="text-sm text-muted-foreground">
            Sélectionnez une option pour démarrer
          </p>
        </div>

        {/* Choice cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-4">
          {/* Card 1: Register */}
          <Link
            href="/register"
            className="flex flex-col gap-4 p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/50 transition-all hover:scale-[1.02] text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl group-hover:text-primary transition-colors">Créer un espace</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Vous êtes propriétaire, entrepreneur ou responsable de structure. Créez un nouvel espace entreprise pour votre équipe.
              </p>
            </div>
          </Link>

          {/* Card 2: Login */}
          <Link
            href="/login"
            className="flex flex-col gap-4 p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/50 transition-all hover:scale-[1.02] text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl group-hover:text-primary transition-colors">Se connecter</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Vous avez déjà un compte personnel ou vous avez été invité à rejoindre une entreprise existante.
              </p>
            </div>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-sm mt-4 leading-relaxed">
          Aucune installation requise. AfriBiz Suite est optimisé pour les téléphones et tablettes afin de vous suivre partout.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, Sparkles } from "lucide-react";
import { requestPasswordReset } from "@/modules/auth/resetActions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    startTransition(async () => {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Une erreur est survenue.");
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans relative overflow-hidden items-center justify-center py-12 px-6">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-primary blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-secondary blur-[100px]" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 z-10 animate-fade-in">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à la connexion
          </Link>
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md shadow-primary/20">
            A
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Mot de passe oublié
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Entrez votre email pour réinitialiser votre mot de passe.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8 glassmorphism">
          {success ? (
            <div className="flex flex-col gap-4 text-center">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs leading-relaxed">
                <span className="font-bold flex items-center justify-center gap-1.5 uppercase tracking-wide mb-1">
                  <Sparkles className="w-4 h-4" /> Demande enregistrée
                </span>
                Si un compte correspond à cette adresse email, un lien de réinitialisation a été généré.
                <p className="mt-2 font-semibold">
                  Consultez les logs de votre terminal local pour copier le lien simulé.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md"
              >
                Retourner à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Votre adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="koffi@example.com"
                    className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 transition-all active:scale-[0.98] mt-2 disabled:opacity-75"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Recevoir le lien"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

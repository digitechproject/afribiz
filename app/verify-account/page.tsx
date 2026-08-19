"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, Sparkles } from "lucide-react";
import { verifyOTP } from "@/modules/auth/actions";

function VerifyAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const userId = searchParams.get("userId") || "";
  const codeParam = searchParams.get("code") || "";

  const [code, setCode] = useState(codeParam);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Le code doit comporter 6 chiffres");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await verifyOTP(userId, code);
      if (res.success && res.redirectTo) {
        router.push(res.redirectTo);
      } else if (res.error) {
        setError(res.error);
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
            href="/register"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à l&apos;inscription
          </Link>
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md shadow-primary/20">
            A
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Vérifiez votre compte
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Un code de vérification à 6 chiffres vous a été envoyé par email.
          </p>
        </div>

        {/* Local Test Helper Banner */}
        {codeParam && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-1 text-sm text-primary animate-pulse">
            <span className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4" /> Mode Simulation Local
            </span>
            <p className="text-xs leading-relaxed">
              Pour faciliter les tests locaux, votre code OTP généré par le serveur est : <strong>{codeParam}</strong>.
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8 glassmorphism">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">
                Code de vérification (6 chiffres)
              </label>
              <div className="relative max-w-xs mx-auto w-full">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-lg font-bold tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
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
                  Vérification...
                </>
              ) : (
                "Vérifier mon compte"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <VerifyAccountContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building, 
  Loader2, 
  ShieldAlert, 
  CheckCircle, 
  Sparkles, 
  User, 
  Phone, 
  Lock, 
  Mail, 
  ArrowRight,
  UserPlus
} from "lucide-react";
import { acceptInvitation, InviteResponse } from "@/modules/tenants/inviteActions";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(() => Boolean(token));
  const [error, setError] = useState<string | null>(() =>
    !token ? "Token d'invitation manquant. Veuillez utiliser le lien reçu par email." : null
  );
  const [inviteDetails, setInviteDetails] = useState<InviteResponse | null>(null);
  
  // Registration form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isPending, startTransition] = useTransition();

  // Load invitation details on mount
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const checkInvite = async () => {
      try {
        const res = await acceptInvitation(token);
        if (!isMounted) return;
        if (res.success) {
          if (res.redirectTo) {
            // Logged in user successfully joined
            router.push(res.redirectTo);
            return;
          }
          setInviteDetails(res);
        } else {
          setError(res.error || "L'invitation est invalide ou a expiré.");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError("Impossible de charger les détails de l'invitation.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkInvite();
    return () => {
      isMounted = false;
    };
  }, [token, router]);

  // Handle registration submission for new user
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const res = await acceptInvitation(token, {
          firstName,
          lastName,
          phone,
          password,
        });

        if (res.success && res.redirectTo) {
          router.push(res.redirectTo);
        } else {
          setError(res.error || "Une erreur est survenue lors de la création de votre compte.");
        }
      } catch (err) {
        console.error(err);
        setError("Erreur technique lors de la validation.");
      }
    });
  };

  const getRoleBadge = (roleId?: string) => {
    switch (roleId) {
      case "SUPER_ADMIN":
        return "Propriétaire";
      case "ADMIN":
        return "Administrateur";
      case "MANAGER":
        return "Manager";
      case "COMPTABLE":
        return "Comptable";
      case "COLLABORATOR":
      default:
        return "Collaborateur";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans relative overflow-hidden items-center justify-center py-12 px-6">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-primary blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-secondary blur-[100px]" />
      </div>

      <div className="w-full max-w-lg flex flex-col gap-6 z-10 animate-fade-in">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/20">
            A
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
            AfriBiz Suite
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Rejoignez votre équipe et commencez à collaborer efficacement.
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xl p-8 glassmorphism">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-medium animate-pulse">
                Vérification de l'invitation...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Invitation invalide</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {error}
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex h-10 px-5 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:bg-primary/95 transition-all mt-2"
              >
                Aller à la connexion
              </Link>
            </div>
          ) : inviteDetails ? (
            <div className="flex flex-col gap-6">
              {/* Invitation Heading Info */}
              <div className="flex flex-col items-center text-center gap-3 border-b border-border pb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Building className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" /> Invitation
                  </span>
                  <h3 className="font-extrabold text-xl mt-1.5">
                    Rejoindre {inviteDetails.companyName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Vous avez été invité en tant que <span className="font-semibold text-foreground">{getRoleBadge(inviteDetails.roleId)}</span>.
                  </p>
                </div>
              </div>

              {/* Case 1: Account Already Exists */}
              {inviteDetails.userExists ? (
                <div className="flex flex-col gap-4 text-center">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-left leading-relaxed text-muted-foreground">
                    <strong className="text-foreground block mb-1">Un compte existe déjà !</strong>
                    Nous avons détecté qu'un compte AfriBiz existe déjà pour cette adresse email. Veuillez vous connecter pour accepter l'invitation.
                  </div>
                  
                  <Link
                    href={`/login?identifier=${encodeURIComponent(searchParams.get("email") || "")}&redirectTo=${encodeURIComponent(`/invitation/accept?token=${token}`)}`}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 transition-all active:scale-[0.98]"
                  >
                    Se connecter et rejoindre
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                /* Case 2: New Account Registration Required */
                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                      <UserPlus className="w-4 h-4 text-primary" />
                      Création de votre profil collaborateur
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Complétez vos informations pour activer votre accès.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Prénom
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Koffi"
                          className="w-full h-9 pl-8.5 pr-3 rounded-lg border border-border bg-background/50 text-xs focus:outline-none focus:ring-1.5 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Nom
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Mensah"
                          className="w-full h-9 pl-8.5 pr-3 rounded-lg border border-border bg-background/50 text-xs focus:outline-none focus:ring-1.5 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+229 90 00 00 00"
                        className="w-full h-9 pl-8.5 pr-3 rounded-lg border border-border bg-background/50 text-xs focus:outline-none focus:ring-1.5 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-9 pl-8.5 pr-3 rounded-lg border border-border bg-background/50 text-xs focus:outline-none focus:ring-1.5 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Confirmation
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-9 pl-8.5 pr-3 rounded-lg border border-border bg-background/50 text-xs focus:outline-none focus:ring-1.5 focus:ring-primary transition-all"
                        />
                      </div>
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
                        Finalisation de l'inscription...
                      </>
                    ) : (
                      "Activer mon compte et rejoindre"
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-[#0b0f19] text-[#f8fafc] items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}

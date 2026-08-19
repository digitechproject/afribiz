import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ArrowRight, LogOut, ShieldAlert, ArrowLeft, User, Sparkles, Layers } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateUserIfu } from "@/modules/auth/actions";
import { getCompanyUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ setupIfu?: string }>;
}

export default async function SelectWorkspacePage({ searchParams }: PageProps) {
  const session = await getSession();
  const resolvedSearchParams = await searchParams;
  const showSetupIfu = resolvedSearchParams.setupIfu === "true";

  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  const memberships = await db.membership.findMany({
    where: { userId: session.userId, status: "ACTIVE" },
    include: {
      company: {
        include: {
          branding: true,
        },
      },
    },
  });

  async function handleUpdateIfu(formData: FormData) {
    "use server";
    const ifu = formData.get("ifu") as string;
    const res = await updateUserIfu(ifu);
    if (res.success) {
      redirect("/onboarding");
    }
  }

  if (memberships.length === 0 && user.ifu && !showSetupIfu) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden items-center justify-center py-12 px-6">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full bg-teal-500/15 blur-[140px]" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      <div className="w-full max-w-lg flex flex-col gap-6 z-10 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-teal-500/20">
            A
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {showSetupIfu ? "Déclaration IFU Professionnel" : "Sélectionnez votre Workspace"}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              {showSetupIfu
                ? "Renseignez votre numéro IFU pour activer et administrer de nouvelles entreprises."
                : "Choisissez l'espace de travail avec lequel vous souhaitez interagir aujourd'hui."}
            </p>
          </div>
        </div>

        {/* Warning Banner if IFU is missing */}
        {!user.ifu && !showSetupIfu && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col gap-1.5 text-left leading-relaxed backdrop-blur-sm shadow-md">
            <span className="font-extrabold flex items-center gap-1.5 uppercase tracking-wide text-amber-400">
              <ShieldAlert className="w-4 h-4" /> IFU Personnel Requis pour créer
            </span>
            <p className="text-[11px] text-amber-200/80">
              Pour créer un nouvel espace entreprise autonome, votre identifiant fiscal est obligatoire. Vous pouvez néanmoins accéder à vos espaces existants.
            </p>
          </div>
        )}

        {/* Setup IFU Form view */}
        {showSetupIfu ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl p-8 backdrop-blur-xl">
            <form action={handleUpdateIfu} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Numéro IFU (13 chiffres au Bénin)
                </label>
                <input
                  type="text"
                  name="ifu"
                  required
                  placeholder="Ex. 12020XXXXXXXX"
                  className="w-full h-11 px-4 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-mono"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <Link
                  href="/select-workspace"
                  className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Link>
                <button
                  type="submit"
                  className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                >
                  Valider et Continuer
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Workspaces Card view */
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 backdrop-blur-xl flex flex-col gap-4">
            
            {/* Mon Espace Personnel */}
            <Link
              href="/dashboard"
              className="flex items-center justify-between p-4 rounded-2xl border border-teal-500/30 bg-teal-950/20 hover:border-teal-500/60 hover:bg-teal-950/30 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-sm text-white group-hover:text-teal-300 transition-colors flex items-center gap-1.5">
                    Mon Espace Personnel <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                    Profil global, documents sécurisés et invitations
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Espaces Entreprises
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* List of tenant workspaces */}
            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
              {memberships.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 text-center text-xs text-slate-400">
                  Vous n&apos;êtes membre d&apos;aucun espace d&apos;entreprise pour l&apos;instant.
                </div>
              ) : (
                memberships.map((m) => {
                  const company = m.company;
                  const branding = company.branding;
                  const primaryColor = branding?.primaryColor || company.primaryColor || "#0f766e";

                  return (
                    <a
                      key={m.id}
                      href={getCompanyUrl(company.slug, "/dashboard")}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-teal-500/40 hover:bg-slate-800/50 transition-all group text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        {company.logo || branding?.logoUrl ? (
                          <img
                            src={branding?.logoUrl || company.logo || ""}
                            alt={company.name}
                            className="w-11 h-11 rounded-xl object-contain bg-slate-900 p-1.5 border border-slate-800 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-extrabold text-sm text-white group-hover:text-teal-300 transition-colors">
                            {company.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {company.slug}.afribizsuite.com
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wide">
                          {m.roleId.replace("_", " ")}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </a>
                  );
                })
              )}
            </div>

            {/* Create Company Button */}
            <div className="pt-2 border-t border-slate-800">
              <Link
                href={user.ifu ? "/onboarding" : "/select-workspace?setupIfu=true"}
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-extrabold transition-all shadow-md active:scale-98"
              >
                <Plus className="w-4 h-4 text-teal-400" />
                Créer une nouvelle entreprise
              </Link>
            </div>

          </div>
        )}

        {/* Footer info */}
        <div className="flex justify-between items-center px-2 text-[11px] text-slate-400">
          <Link href="/dashboard" className="hover:text-teal-400 transition-colors flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <a
            href="/api/auth/logout"
            className="hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </a>
        </div>
      </div>
    </div>
  );
}

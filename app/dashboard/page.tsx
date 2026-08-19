import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Building2, 
  Plus, 
  ArrowRight, 
  LogOut, 
  FileText, 
  User, 
  Bell, 
  Briefcase, 
  Layers,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCompanyUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

export default async function PersonalDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Charger le profil complet de l'utilisateur
  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  // Charger toutes les entreprises (memberships) avec les résumés statistiques
  const memberships = await db.membership.findMany({
    where: { userId: session.userId, status: "ACTIVE" },
    include: {
      company: {
        include: {
          summary: true,
          branding: true,
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  // Charger les invitations en attente pour cet email
  const pendingInvitations = await db.invitation.findMany({
    where: {
      email: user.email,
      status: "PENDING",
    },
    include: {
      company: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Charger les documents personnels récents
  const recentDocuments = await db.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Action serveur pour accepter ou refuser une invitation
  async function handleInvitationAction(formData: FormData) {
    "use server";
    const invitationId = formData.get("invitationId") as string;
    const action = formData.get("action") as "ACCEPT" | "REJECT";
    const token = formData.get("token") as string;

    if (action === "ACCEPT") {
      redirect(`/invitation/accept?token=${token}`);
    } else {
      await db.invitation.update({
        where: { id: invitationId },
        data: { status: "REJECTED" },
      });
      redirect("/dashboard");
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("fr-BJ", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans relative selection:bg-teal-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/15 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[150px]" />
      </div>

      {/* Header bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl py-3.5 px-6 md:px-12 flex justify-between items-center z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-teal-500/20">
            A
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-100 bg-clip-text text-transparent">
              AfriBiz Suite
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20">
              Espace Personnel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
          <Link href="/dashboard" className="text-teal-400 font-bold flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> Mes Espaces
          </Link>
          <Link href="/profile" className="hover:text-slate-200 transition-colors flex items-center gap-1.5">
            <User className="w-4 h-4" /> Mon Profil
          </Link>
          <Link href="/documents" className="hover:text-slate-200 transition-colors flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Mes Documents
          </Link>
          <Link href="/invitations" className="hover:text-slate-200 transition-colors flex items-center gap-1.5">
            <Bell className="w-4 h-4" /> Invitations
            {pendingInvitations.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {pendingInvitations.length}
              </span>
            )}
          </Link>
        </nav>

        {/* User profile & logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/60 rounded-full py-1 pl-1 pr-3.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 text-xs font-black uppercase overflow-hidden shadow">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
              )}
            </div>
            <span className="text-xs font-bold text-slate-200 hidden sm:inline">
              {user.firstName} {user.lastName}
            </span>
          </div>

          <a
            href="/api/auth/logout"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all shadow-sm"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 z-10 flex flex-col gap-8">
        
        {/* Hero Welcome Banner */}
        <div className="relative rounded-3xl border border-slate-800/90 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-2xl font-bold shadow-inner">
                👋
              </div>
              <div className="text-left space-y-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Bonjour, {user.firstName} {user.lastName}
                </h1>
                <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
                  Bienvenue sur votre portail d&apos;identité professionnelle AfriBiz Suite. Sélectionnez un espace pour y entrer ou gérez votre portefeuille d&apos;entreprises.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/profile"
                className="inline-flex h-10 px-4 items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-md"
              >
                <User className="w-4 h-4 text-teal-400" />
                Mon Profil & CV
              </Link>
              <Link
                href={user.ifu ? "/onboarding" : "/select-workspace?setupIfu=true"}
                className="inline-flex h-10 px-5 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-teal-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Créer une entreprise
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Entreprises Actives</span>
              <span className="text-xl font-extrabold text-teal-400 mt-0.5">{memberships.length}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Invitations en attente</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-0.5">{pendingInvitations.length}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Documents Stockés</span>
              <span className="text-xl font-extrabold text-cyan-400 mt-0.5">{recentDocuments.length}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Identité Fiscale (IFU)</span>
              <span className="text-xs font-bold text-slate-300 mt-1.5 font-mono">
                {user.ifu || "Non renseigné"}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main 2 Columns: Workspaces */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold flex items-center gap-2 text-slate-200">
                <Briefcase className="w-5 h-5 text-teal-400" />
                Mes Espaces Entreprises
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                {memberships.length} actif(s)
              </span>
            </div>

            {memberships.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-inner">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="font-extrabold text-lg text-slate-200">Aucun espace entreprise associé</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Créez votre propre espace de travail ou rejoignez une entreprise existante via une invitation sécurisée reçue par email.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  <Link
                    href={user.ifu ? "/onboarding" : "/select-workspace?setupIfu=true"}
                    className="inline-flex h-10 px-5 items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-teal-500/10"
                  >
                    <Plus className="w-4 h-4" /> Créer mon entreprise
                  </Link>
                  <Link
                    href="/invitations"
                    className="inline-flex h-10 px-5 items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    Voir les invitations ({pendingInvitations.length})
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {memberships.map((membership) => {
                  const company = membership.company;
                  const summary = company.summary;
                  const branding = company.branding;
                  const isOwnerOrAdmin = membership.roleId === "SUPER_ADMIN" || membership.roleId === "ADMIN";
                  const primaryColor = branding?.primaryColor || company.primaryColor || "#0f766e";

                  return (
                    <div 
                      key={membership.id} 
                      className="group rounded-3xl border border-slate-800 bg-slate-900/80 hover:border-teal-500/40 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300 shadow-lg hover:shadow-teal-500/5 backdrop-blur-sm text-left relative overflow-hidden"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                        style={{ backgroundColor: primaryColor }}
                      />

                      <div className="flex items-start gap-4 pl-2">
                        {company.logo || branding?.logoUrl ? (
                          <img 
                            src={branding?.logoUrl || company.logo || ""} 
                            alt={company.name} 
                            className="w-14 h-14 rounded-2xl object-contain bg-slate-950/60 p-2 border border-slate-800 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex flex-col text-left space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-black text-lg text-white group-hover:text-teal-300 transition-colors">
                              {company.name}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                              {company.slug}.afribizsuite.com
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                              {membership.roleId.replace("_", " ")}
                            </span>
                            {membership.position && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                {membership.position}
                              </span>
                            )}
                            {membership.department && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                {membership.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stat summary & action button */}
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-slate-800 pt-4 md:pt-0 md:border-0 pl-2 md:pl-0">
                        {summary && isOwnerOrAdmin && (
                          <div className="hidden sm:flex gap-6 text-left border-r border-slate-800 pr-6">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revenu / mois</span>
                              <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(summary.monthlyRevenue)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Équipe</span>
                              <span className="text-xs font-extrabold text-slate-200">{summary.employeesCount} membre(s)</span>
                            </div>
                          </div>
                        )}

                        <a
                          href={getCompanyUrl(company.slug, "/dashboard")}
                          className="inline-flex h-10 px-5 items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-teal-500 hover:text-slate-950 border border-slate-700 text-slate-200 text-xs font-black transition-all shadow-md group/btn"
                        >
                          Entrer
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Invitations & Documents Vault */}
          <div className="flex flex-col gap-8">
            
            {/* Invitations Section */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-extrabold flex items-center gap-2 text-slate-200">
                  <Bell className="w-5 h-5 text-emerald-400" />
                  Invitations d&apos;équipe
                </h2>
                {pendingInvitations.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              
              {pendingInvitations.length === 0 ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-xs text-slate-400 backdrop-blur-sm">
                  <CheckCircle2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  Aucune invitation en attente.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingInvitations.map((invite) => (
                    <div 
                      key={invite.id} 
                      className="rounded-3xl border border-emerald-500/30 bg-emerald-950/10 p-5 flex flex-col gap-3 shadow-lg text-left backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-extrabold text-sm text-white">
                            {invite.company.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Rôle : <span className="font-bold text-emerald-300">{invite.roleId.replace("_", " ")}</span>
                            {invite.position && ` • ${invite.position}`}
                          </p>
                        </div>
                      </div>

                      {invite.message && (
                        <p className="text-[11px] text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 italic">
                          &ldquo;{invite.message}&rdquo;
                        </p>
                      )}

                      <form action={handleInvitationAction} className="flex gap-2 mt-1">
                        <input type="hidden" name="invitationId" value={invite.id} />
                        <input type="hidden" name="token" value={invite.token} />
                        <button
                          type="submit"
                          name="action"
                          value="REJECT"
                          className="flex-1 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                        >
                          Décliner
                        </button>
                        <button
                          type="submit"
                          name="action"
                          value="ACCEPT"
                          className="flex-1 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors shadow-md shadow-emerald-500/20"
                        >
                          Accepter
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-extrabold flex items-center gap-2 text-slate-200">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  Coffre-fort Documents
                </h2>
                <Link href="/documents" className="text-xs font-bold text-teal-400 hover:underline">
                  Voir tout ({recentDocuments.length})
                </Link>
              </div>

              {recentDocuments.length === 0 ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center flex flex-col items-center gap-2 text-xs text-slate-400 backdrop-blur-sm">
                  <FileText className="w-8 h-8 text-slate-600 mb-1" />
                  <span>Aucun document pour le moment.</span>
                  <Link 
                    href="/documents" 
                    className="text-xs text-teal-400 font-bold hover:underline mt-1"
                  >
                    Déposer mon premier document
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {recentDocuments.map((doc) => (
                    <div 
                      key={doc.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-teal-500/30 p-3.5 flex items-center justify-between gap-3 text-left transition-all shadow-sm backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-bold text-slate-200 truncate pr-2">
                            {doc.name}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">
                            {doc.type} • {doc.category === "UPLOADED" ? "Importé" : "Délivré par entreprise"}
                          </span>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-teal-400 hover:text-teal-300 flex-shrink-0 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

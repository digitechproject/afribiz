import Link from "next/link";
import { redirect } from "next/navigation";
import { getCompanyUrl, getMainUrl } from "@/lib/url";
import {
  Users,
  FileText,
  CheckSquare,
  DollarSign,
  Plus,
  HelpCircle,
  Bell,
  Search,
  Building,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CheckCircle2,
  Calendar,
  Layers,
  FolderKanban,
  FileSpreadsheet,
  Settings,
  ChefHat,
  ShoppingBag,
  ListTodo,
  Lock,
  ShieldAlert,
  Info,
  Check
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveCompanyVerification } from "@/modules/onboarding/actions";

export const dynamic = "force-dynamic";

interface DashboardProps {
  params: Promise<{ company_slug: string }>;
}

export default async function TenantDashboardPage({ params }: DashboardProps) {
  const resolvedParams = await params;
  const companySlug = resolvedParams.company_slug;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Load current company
  const company = await db.company.findUnique({
    where: { slug: companySlug },
    include: {
      summary: true,
    },
  });

  if (!company) {
    redirect("/select-workspace");
  }

  // If onboarding is not complete, redirect to the correct step
  if (!company.onboardingCompleted) {
    const nextStep = company.onboardingCurrentStep.toLowerCase();
    redirect(`/app/${company.slug}/onboarding?step=${nextStep}`);
  }

  // Load owner user profile to check IFU
  const owner = await db.user.findUnique({
    where: { id: company.ownerUserId }
  });

  // Load all user's companies for the workspace switcher
  const memberships = await db.membership.findMany({
    where: { userId: session.userId },
    include: { company: true },
  });

  const otherWorkspaces = memberships.filter((m: any) => m.company.slug !== companySlug);

  // Local server action to process verification
  async function handleVerifyCompany(formData: FormData) {
    "use server";
    const res = await saveCompanyVerification(companySlug, formData);
    if (res.success) {
      redirect(`/dashboard`);
    }
  }

  // Define sidebar navigation items based on the company sector
  const getSidebarItems = (sector: string) => {
    const baseItems = [
      { label: "Tableau de bord", icon: LayoutDashboard, href: `/dashboard` }
    ];

    let sectorItems: { label: string; icon: any; href: string }[] = [];

    switch (sector) {
      case "FREELANCE":
        sectorItems = [
          { label: "Clients", icon: Users, href: "#" },
          { label: "Factures", icon: FileText, href: "#" },
          { label: "Tâches", icon: CheckSquare, href: "#" },
          { label: "Documents", icon: FileSpreadsheet, href: "#" },
          { label: "Projets", icon: FolderKanban, href: "#" }
        ];
        break;
      case "SHOP":
        sectorItems = [
          { label: "Ventes", icon: ShoppingBag, href: "#" },
          { label: "Produits / Stock", icon: Layers, href: "#" },
          { label: "Clients", icon: Users, href: "#" },
          { label: "Factures", icon: FileText, href: "#" },
          { label: "Caisse", icon: DollarSign, href: "#" },
          { label: "Fournisseurs", icon: Building, href: "#" }
        ];
        break;
      case "RESTAURANT":
        sectorItems = [
          { label: "Menus", icon: ChefHat, href: "#" },
          { label: "Commandes", icon: ShoppingBag, href: "#" },
          { label: "Caisse", icon: DollarSign, href: "#" },
          { label: "Personnel", icon: Users, href: "#" },
          { label: "Stocks", icon: Layers, href: "#" }
        ];
        break;
      case "AGENCY":
      default:
        sectorItems = [
          { label: "Clients", icon: Users, href: "#" },
          { label: "Projets", icon: FolderKanban, href: "#" },
          { label: "Tâches", icon: CheckSquare, href: "#" },
          { label: "Factures", icon: FileText, href: "#" },
          { label: "Documents", icon: FileSpreadsheet, href: "#" },
          { label: "Calendrier", icon: Calendar, href: "#" },
          { label: "Équipe", icon: Users, href: "#" }
        ];
        break;
    }

    return [...baseItems, ...sectorItems, { label: "Paramètres", icon: Settings, href: `/settings` }];
  };

  const menuItems = getSidebarItems(company.sector);
  const isPendingVerification = company.administrativeStatus === "PENDING_VERIFICATION";

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col z-20 shrink-0">
        {/* Brand logo header */}
        <div className="h-16 border-b border-border flex items-center px-6 gap-2 bg-muted/20">
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-bold text-sm truncate text-foreground">
            {company.name}
          </span>
        </div>

        {/* Sidebar Nav items */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.label === "Tableau de bord";
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
              {session.firstName.charAt(0)}
              {session.lastName.charAt(0)}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="font-bold text-xs truncate">
                {session.firstName} {session.lastName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">{session.email}</span>
            </div>
          </div>
          <span className="text-[9px] text-muted-foreground block text-center border-t border-border/40 pt-2 font-medium">
            Propulsé par <span className="font-bold text-foreground">AfriBiz Suite</span>
          </span>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 z-10">
          {/* Workspace Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 text-xs font-bold transition-all">
              <Building className="w-3.5 h-3.5 text-primary" />
              <span>{company.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border border-border bg-card shadow-lg p-2 hidden group-hover:flex flex-col gap-1 z-50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2.5 py-1.5">
                Changer d'espace
              </span>
              {otherWorkspaces.map((m: any) => (
                <Link
                  key={m.company.id}
                  href={getCompanyUrl(m.company.slug, "/dashboard")}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold hover:bg-muted/60 transition-colors"
                >
                  <Building className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{m.company.name}</span>
                </Link>
              ))}
              <hr className="border-border my-1" />
              <a
                href={getMainUrl("/select-workspace")}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold hover:bg-muted/60 text-primary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Gérer mes espaces
              </a>
              <a
                href="/api/auth/logout"
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Se déconnecter
              </a>
            </div>
          </div>

          {/* Action Header Icons */}
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="h-9 w-60 pl-9 pr-4 rounded-lg border border-border bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Main Content area */}
        <main className="flex-1 p-8 overflow-y-auto bg-background/50 flex flex-col gap-8">
          {/* Welcome Banner */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism">
            <div className="flex flex-col gap-1 text-left">
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Bienvenue sur AfriBiz Suite, {session.firstName} 👋
              </h2>
              <p className="text-xs text-muted-foreground">
                Votre espace <strong>{company.name}</strong> ({company.activityType.replace("_", " ")}) est opérationnel.
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wide">
              {company.subscriptionPlan}
            </span>
          </div>

          {/* V2: Formalization checklist widget if pending */}
          {isPendingVerification && company.activityType !== "FREELANCE" && (
            <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-sm flex flex-col gap-4 text-left">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <h3 className="font-extrabold text-sm text-amber-800 dark:text-amber-300">
                    Espace Limité — Formalisation requise
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Déclarez vos identifiants d'entreprise pour débloquer la facturation officielle et vos rapports financiers.
                  </p>
                </div>
              </div>

              {/* Input Form for RCCM / Company IFU */}
              <form action={handleVerifyCompany} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-card p-4 rounded-xl border border-border">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Numéro RCCM
                  </label>
                  <input
                    type="text"
                    name="rccm"
                    placeholder="Ex. RB/COT/26 B 1234"
                    defaultValue={company.rccm || ""}
                    className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    IFU d'entreprise
                  </label>
                  <input
                    type="text"
                    name="companyIfu"
                    placeholder="Ex. 32020XXXXXXXX"
                    defaultValue={company.companyIfu || ""}
                    className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                
                {/* Représentant légal (seulement pour sociétés) */}
                {company.activityType === "SOCIETY" ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      IFU du Représentant légal
                    </label>
                    <input
                      type="text"
                      name="representativeIfu"
                      placeholder="Ex. 12020XXXXXXXX"
                      defaultValue={company.representativeIfu || owner?.ifu || ""}
                      className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Nom du Promoteur
                    </label>
                    <input
                      type="text"
                      name="representativeName"
                      placeholder="Ex. Koffi Soglo"
                      defaultValue={company.representativeName || `${owner?.firstName} ${owner?.lastName}`}
                      className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="sm:col-span-3 h-9 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors mt-2"
                >
                  Enregistrer les identifiants de formalisation
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checklist Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-primary" /> Checklist opérationnelle
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    title: "Ajouter votre premier client",
                    desc: "Centralisez vos contacts professionnels pour garder l'historique de vos échanges.",
                    action: "Ajouter un client",
                    disabled: false
                  },
                  {
                    title: "Créer votre première facture",
                    desc: "Générez un document professionnel pour vos prestations ou ventes.",
                    action: "Créer une facture",
                    disabled: isPendingVerification && company.activityType !== "FREELANCE"
                  },
                  {
                    title: "Inviter un collaborateur",
                    desc: "Ajoutez les membres de votre équipe pour collaborer en temps réel.",
                    action: "Inviter",
                    disabled: false
                  }
                ].map((task, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      task.disabled ? "opacity-60" : "hover:border-primary/30"
                    }`}
                  >
                    <div className="flex gap-4 items-start text-left">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center border border-border bg-background text-muted-foreground mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm">{task.title}</span>
                        <span className="text-xs text-muted-foreground leading-relaxed">{task.desc}</span>
                        {task.disabled && (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                            <Lock className="w-3 h-3" /> Requis : Vérification administrative
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      disabled={task.disabled}
                      className={`h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/10 hover:bg-primary/95 transition-colors shrink-0 disabled:opacity-50 disabled:pointer-events-none`}
                    >
                      {task.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions and Stats Column */}
            <div className="flex flex-col gap-6">
              {/* Stat Cards */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
                  Indicateurs clés
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center justify-between">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-xs text-muted-foreground font-semibold">Clients</span>
                      <span className="text-2xl font-extrabold">{company.summary?.clientsCount || 0}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  {/* V2: Locked statistic card if not verified */}
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className={`flex flex-col gap-1 text-left ${isPendingVerification && company.activityType !== "FREELANCE" ? "filter blur-[1.5px] opacity-20" : ""}`}>
                      <span className="text-xs text-muted-foreground font-semibold">Chiffre d'Affaires</span>
                      <span className="text-2xl font-extrabold">{company.summary?.monthlyRevenue || 0} FCFA</span>
                    </div>
                    <div className={`w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center ${isPendingVerification && company.activityType !== "FREELANCE" ? "filter blur-[1.5px] opacity-20" : ""}`}>
                      <DollarSign className="w-5 h-5" />
                    </div>

                    {isPendingVerification && company.activityType !== "FREELANCE" && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1.5px] flex items-center justify-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <Lock className="w-3.5 h-3.5" />
                        Requis : Profil fiscal
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* V2: Localized Help/Formalization Guides widget */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4 text-left glassmorphism">
                <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-primary">
                  <Info className="w-4 h-4" /> Guide de formalisation (Bénin)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pas encore formalisé ? AfriBiz Suite vous guide pour obtenir vos identifiants légaux :
                </p>
                <ul className="flex flex-col gap-2.5 text-[11px] text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <a href="https://ifu.impots.bj" target="_blank" className="hover:underline font-semibold text-foreground">
                      Obtenir son IFU personnel en ligne
                    </a>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <a href="https://monentreprise.bj" target="_blank" className="hover:underline font-semibold text-foreground">
                      Créer son RCCM en 24h (APIEx)
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

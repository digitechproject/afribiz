"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Settings,
  Layers,
  CheckCircle2,
  Loader2,
  Trash2,
  Mail,
  Palette,
  Check,
  UserPlus,
  Copy,
  Globe,
  FolderKanban,
  FileSpreadsheet,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Briefcase,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  Lock,
  ChevronRight,
  Sliders,
  X
} from "lucide-react";
import { updateCompanySettings, updateMemberRole, revokeMembership, cancelInvitation } from "@/modules/tenants/settingsActions";
import { inviteCollaborator } from "@/modules/tenants/inviteActions";
import { addCustomDomain, verifyCustomDomain, removeCustomDomain } from "@/modules/tenants/domainActions";
import { createDepartment, deleteDepartment, createPosition, deletePosition, offboardMember } from "@/modules/hr/hrActions";
import { getContrastColor } from "@/lib/branding";
import { getCompanyUrl, getMainUrl } from "@/lib/url";

interface SettingsFormProps {
  company: any;
  session: any;
  members: any[];
  invitations: any[];
  roles: any[];
  otherWorkspaces: any[];
  departments: any[];
  positions: any[];
  customDomains: any[];
  branding: any;
}

export default function SettingsForm({
  company,
  session,
  members: initialMembers,
  invitations: initialInvitations,
  roles,
  otherWorkspaces,
  departments: initialDepartments,
  positions: initialPositions,
  customDomains: initialCustomDomains,
  branding: initialBranding,
}: SettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"identity" | "branding" | "hr" | "domains" | "modules">("identity");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // States: Identité & Légal
  const [name, setName] = useState(company.name);
  const [legalName, setLegalName] = useState(company.legalName || "");
  const [phone, setPhone] = useState(company.phone || "");
  const [email, setEmail] = useState(company.email || "");
  const [city, setCity] = useState(company.city || "");
  const [country, setCountry] = useState(company.country || "BENIN");
  const [address, setAddress] = useState(company.address || "");
  const [activityType, setActivityType] = useState(company.activityType || "PRESTATION_INTELLECTUELLE");
  const [legalForm, setLegalForm] = useState(company.legalForm || "SARL");
  const [formalizationLevel, setFormalizationLevel] = useState(company.formalizationLevel || "FORMALISE");
  const [rccm, setRccm] = useState(company.rccm || "");
  const [companyIfu, setCompanyIfu] = useState(company.companyIfu || "");
  const [representativeName, setRepresentativeName] = useState(company.representativeName || "");
  const [representativeIfu, setRepresentativeIfu] = useState(company.representativeIfu || "");
  const [capitalSocial, setCapitalSocial] = useState(company.capitalSocial || 0);
  const [associatesCount, setAssociatesCount] = useState(company.associatesCount || 1);

  // States: Branding & Thème
  const [primaryColor, setPrimaryColor] = useState(initialBranding?.primaryColor || company.primaryColor || "#0f766e");
  const [secondaryColor, setSecondaryColor] = useState(initialBranding?.secondaryColor || "#0284c7");
  const [accentColor, setAccentColor] = useState(initialBranding?.accentColor || "#f59e0b");
  const [loginHeadline, setLoginHeadline] = useState(initialBranding?.loginHeadline || `Bienvenue chez ${company.name}`);
  const [loginTagline, setLoginTagline] = useState(initialBranding?.loginTagline || "Espace professionnel sécurisé");
  const [loginTemplate, setLoginTemplate] = useState("modern");
  const [logo, setLogo] = useState(company.logo || "");

  // States: RH, Départements, Postes, Membres
  const [hrSubTab, setHrSubTab] = useState<"members" | "departments" | "positions">("members");
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [departments, setDepartments] = useState(initialDepartments);
  const [positions, setPositions] = useState(initialPositions);

  // State: Domaines
  const [customDomains, setCustomDomains] = useState(initialCustomDomains);
  const [newDomainInput, setNewDomainInput] = useState("");

  // Modals & New entries
  const [newDeptName, setNewDeptName] = useState("");
  const [newPosName, setNewPosName] = useState("");
  const [newPosDeptId, setNewPosDeptId] = useState("");
  const [newPosRole, setNewPosRole] = useState("COLLABORATOR");

  // Invite Modal (3-step wizard)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStep, setInviteStep] = useState(1);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [invitePosition, setInvitePosition] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [inviteCollaborationStatus, setInviteCollaborationStatus] = useState("EMPLOYEE");
  const [inviteRole, setInviteRole] = useState("COLLABORATOR");
  const [inviteContractType, setInviteContractType] = useState("CDI");
  const [inviteStartDate, setInviteStartDate] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  // Sauvegarde des paramètres généraux & identité
  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await updateCompanySettings(company.slug, {
        name,
        legalName,
        phone,
        email,
        city,
        country,
        address,
        activityType,
        legalForm,
        formalizationLevel,
        rccm,
        companyIfu,
        representativeName,
        representativeIfu,
        capitalSocial: Number(capitalSocial),
        associatesCount: Number(associatesCount),
        primaryColor,
        logo,
      });
      if (res.success) {
        setFeedback({ type: "success", message: "Identité et informations légales mises à jour avec succès !" });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Erreur lors de la sauvegarde." });
      }
    });
  };

  // Sauvegarde du Branding
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await updateCompanySettings(company.slug, {
        name,
        primaryColor,
        logo,
      });
      if (res.success) {
        setFeedback({ type: "success", message: "Charte graphique et thème appliqués en direct !" });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Erreur de mise à jour du branding." });
      }
    });
  };

  // Gestion des départements
  const handleCreateDepartment = () => {
    if (!newDeptName.trim()) return;
    startTransition(async () => {
      const res = await createDepartment(company.slug, newDeptName);
      if (res.success && res.data) {
        const dept = res.data as { id: string; name: string };
        setDepartments([...departments, dept]);
        setNewDeptName("");
        setFeedback({ type: "success", message: `Département "${dept.name}" créé.` });
      } else {
        setFeedback({ type: "error", message: res.error || "Erreur" });
      }
    });
  };

  const handleDeleteDepartment = (id: string) => {
    startTransition(async () => {
      const res = await deleteDepartment(company.slug, id);
      if (res.success) {
        setDepartments(departments.filter((d: any) => d.id !== id));
        setFeedback({ type: "success", message: "Département supprimé." });
      }
    });
  };

  // Gestion des postes
  const handleCreatePosition = () => {
    if (!newPosName.trim()) return;
    startTransition(async () => {
      const res = await createPosition(company.slug, {
        name: newPosName,
        departmentId: newPosDeptId || null,
        recommendedRoleId: newPosRole,
      });
      if (res.success && res.data) {
        const pos = res.data as { id: string; name: string };
        setPositions([...positions, pos]);
        setNewPosName("");
        setFeedback({ type: "success", message: `Fiche de poste "${pos.name}" créée.` });
      } else {
        setFeedback({ type: "error", message: res.error || "Erreur" });
      }
    });
  };

  const handleDeletePosition = (id: string) => {
    startTransition(async () => {
      const res = await deletePosition(company.slug, id);
      if (res.success) {
        setPositions(positions.filter((p: any) => p.id !== id));
        setFeedback({ type: "success", message: "Poste supprimé." });
      }
    });
  };

  // Gestion des domaines
  const handleAddDomain = () => {
    if (!newDomainInput.trim()) return;
    startTransition(async () => {
      const res = await addCustomDomain(company.slug, newDomainInput);
      if (res.success && res.domain) {
        setCustomDomains([...customDomains, res.domain]);
        setNewDomainInput("");
        setFeedback({ type: "success", message: "Domaine ajouté. Veuillez configurer le CNAME." });
      } else {
        setFeedback({ type: "error", message: res.error || "Erreur lors de l'ajout du domaine." });
      }
    });
  };

  const handleVerifyDomain = (domainId: string) => {
    startTransition(async () => {
      const res = await verifyCustomDomain(company.slug, domainId);
      if (res.success && res.domain) {
        setCustomDomains(customDomains.map((d: any) => d.id === domainId ? res.domain : d));
        setFeedback({ type: "success", message: "Domaine vérifié et certificat SSL actif !" });
      } else {
        setFeedback({ type: "error", message: res.error || "Échec de vérification DNS." });
      }
    });
  };

  const handleRemoveDomain = (domainId: string) => {
    startTransition(async () => {
      const res = await removeCustomDomain(company.slug, domainId);
      if (res.success) {
        setCustomDomains(customDomains.filter((d: any) => d.id !== domainId));
        setFeedback({ type: "success", message: "Domaine supprimé." });
      }
    });
  };

  // Envoi d'invitation
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await inviteCollaborator(company.slug, inviteEmail, inviteRole, {
        firstName: inviteFirstName,
        lastName: inviteLastName,
        phone: invitePhone,
        position: invitePosition,
        department: inviteDepartment,
        collaborationStatus: inviteCollaborationStatus,
        contractType: inviteContractType,
        startDate: inviteStartDate,
        message: inviteMessage,
      });

      if (res.success) {
        setShowInviteModal(false);
        setFeedback({ type: "success", message: `Invitation officielle envoyée avec succès à ${inviteEmail} !` });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Erreur d'invitation." });
      }
    });
  };

  // Offboarding collaborateur
  const handleOffboard = (userId: string, memberName: string) => {
    if (!confirm(`Êtes-vous certain de vouloir offboarder ${memberName} ? Ses accès seront révoqués et son historique archivé.`)) return;
    startTransition(async () => {
      const res = await offboardMember(company.slug, userId, "Fin de contrat");
      if (res.success) {
        setMembers(members.filter((m: any) => m.userId !== userId));
        setFeedback({ type: "success", message: `Collaborateur ${memberName} offboardé avec succès.` });
      }
    });
  };

  const primaryContrast = getContrastColor(primaryColor);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans relative selection:bg-teal-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[160px] opacity-15"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      {/* Header bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl py-3.5 px-6 md:px-12 flex justify-between items-center z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/app/${company.slug}/dashboard`}
            className="flex items-center gap-3 hover:opacity-85 transition-opacity"
          >
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-9 h-9 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800" />
            ) : (
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-sm text-white tracking-tight">
                {company.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {company.slug}.afribizsuite.com
              </span>
            </div>
          </Link>
          <span className="text-slate-600 font-bold hidden sm:inline">/</span>
          <span className="text-xs font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 hidden sm:inline-flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-teal-400" /> Studio Paramètres & RH
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href={`/app/${company.slug}/dashboard`}
            className="inline-flex h-9 px-4 items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-sm"
          >
            Retour au Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 z-10 flex flex-col gap-6">
        
        {/* Banner Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
          <div className="text-left space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-teal-400" />
              Centre d&apos;Administration &middot; {company.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Gérez la charte graphique en direct, l&apos;organisation RH (postes, départements, collaborateurs), les domaines personnalisés et les modules métier.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-300 pr-2">Workspace V6 Actif</span>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-fade-in ${
            feedback.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("identity")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === "identity"
                ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" /> Identité & Légal
          </button>

          <button
            onClick={() => setActiveTab("branding")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === "branding"
                ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800"
            }`}
          >
            <Palette className="w-4 h-4" /> Branding & Thème en Direct
          </button>

          <button
            onClick={() => setActiveTab("hr")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === "hr"
                ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800"
            }`}
          >
            <Users className="w-4 h-4" /> Organisation & RH ({members.length})
          </button>

          <button
            onClick={() => setActiveTab("domains")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === "domains"
                ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800"
            }`}
          >
            <Globe className="w-4 h-4" /> Domaines & DNS ({customDomains.length})
          </button>

          <button
            onClick={() => setActiveTab("modules")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === "modules"
                ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" /> Modules & Capacités
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1 : IDENTITÉ & LÉGAL                                */}
        {/* ======================================================== */}
        {activeTab === "identity" && (
          <form onSubmit={handleSaveIdentity} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur-xl flex flex-col gap-6">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-400" /> Informations Officielles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom Commercial</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raison Sociale Légale</label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Ex. SOFITARCOM SARL"
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">IFU Entreprise (13 chiffres)</label>
                  <input
                    type="text"
                    value={companyIfu}
                    onChange={(e) => setCompanyIfu(e.target.value)}
                    placeholder="32020XXXXXXXX"
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">RCCM</label>
                  <input
                    type="text"
                    value={rccm}
                    onChange={(e) => setRccm(e.target.value)}
                    placeholder="RB/COT/20-B-XXXXX"
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone Professionnel</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Entreprise</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Forme Juridique</label>
                  <select
                    value={legalForm}
                    onChange={(e) => setLegalForm(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="SARL">SARL (Société à Responsabilité Limitée)</option>
                    <option value="SAS">SAS (Société par Actions Simplifiée)</option>
                    <option value="ETS">Entreprise Individuelle (ETS)</option>
                    <option value="SA">SA (Société Anonyme)</option>
                    <option value="ONG">ONG / Association</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ville & Siège</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pays du Siège</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="BENIN">Bénin</option>
                    <option value="TOGO">Togo</option>
                    <option value="COTE_D_IVOIRE">Côte d'Ivoire</option>
                    <option value="SENEGAL">Sénégal</option>
                    <option value="BURKINA_FASO">Burkina Faso</option>
                    <option value="MALI">Mali</option>
                    <option value="NIGER">Niger</option>
                    <option value="GUINEE">Guinée</option>
                    <option value="CAMEROUN">Cameroun</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secteur / Activité</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="PRESTATION_INTELLECTUELLE">Prestation Intellectuelle / Conseil</option>
                    <option value="COMMERCE_GENERAL">Commerce Général / Négoce</option>
                    <option value="BTP_IMMOBILIER">BTP & Immobilier</option>
                    <option value="SANTE_PHARMACIE">Santé & Pharmacie</option>
                    <option value="AGRO_ALIMENTAIRE">Agro-alimentaire</option>
                    <option value="TECHNOLOGIE_DIGITAL">Technologie & Digital</option>
                    <option value="AUTRE">Autre Secteur</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Niveau de Formalisation</label>
                  <select
                    value={formalizationLevel}
                    onChange={(e) => setFormalizationLevel(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="FORMALISE">Formalisé (RCCM & IFU Entreprise)</option>
                    <option value="EN_COURS">En cours d'immatriculation</option>
                    <option value="PERSONAL_IFU_ONLY">Exercice avec IFU Personnel</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom du Représentant Légal</label>
                  <input
                    type="text"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    placeholder="Ex. Koffi Mensah"
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">IFU du Représentant Légal</label>
                  <input
                    type="text"
                    value={representativeIfu}
                    onChange={(e) => setRepresentativeIfu(e.target.value)}
                    placeholder="12020XXXXXXXX"
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capital Social (XOF)</label>
                  <input
                    type="number"
                    value={capitalSocial}
                    onChange={(e) => setCapitalSocial(Number(e.target.value))}
                    min={0}
                    step={10000}
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre d'Associés</label>
                  <input
                    type="number"
                    value={associatesCount}
                    onChange={(e) => setAssociatesCount(Number(e.target.value))}
                    min={1}
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adresse Physique Complète</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex. Immeuble Sofitar, Avenue Steinmetz, Cotonou"
                  className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 h-11 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-teal-500/20 self-start inline-flex items-center gap-2 active:scale-95 disabled:opacity-75"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Enregistrer les informations légales
              </button>
            </div>

            {/* Sidebar Summary Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4 backdrop-blur-xl h-fit">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> Statut Administratif
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Formalisation</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {formalizationLevel}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Régime</span>
                  <span className="font-bold text-slate-200">{activityType}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Propriétaire</span>
                  <span className="font-bold text-slate-200">{session.firstName} {session.lastName}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ces informations apparaîtront sur vos factures officielles, devis et contrats de travail générés par AfriBiz Suite.
              </p>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 2 : BRANDING & THÈME EN DIRECT (§21-§25 V6)         */}
        {/* ======================================================== */}
        {activeTab === "branding" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Left: Customization Controls (7 cols) */}
            <form onSubmit={handleSaveBranding} className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur-xl flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-teal-400" /> Studio Charte Graphique
                </h2>
                <span className="text-xs text-slate-400 font-medium">Temps réel</span>
              </div>

              {/* Color Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Couleur Primaire</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 px-3 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white font-mono w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Couleur Secondaire</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 px-3 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white font-mono w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Couleur Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 px-3 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white font-mono w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Logo URL */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Logo Officiel (URL ou Upload)</label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://.../logo.png"
                  className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Headlines & Taglines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Message d&apos;accueil Login</label>
                  <input
                    type="text"
                    value={loginHeadline}
                    onChange={(e) => setLoginHeadline(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Slogan / Sous-titre</label>
                  <input
                    type="text"
                    value={loginTagline}
                    onChange={(e) => setLoginTagline(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Login Template Chooser (§25 V6) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Template de Page de Connexion</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "modern", label: "Modern Glass" },
                    { id: "corporate", label: "Corporate Pro" },
                    { id: "minimal", label: "Minimalist" },
                    { id: "classic", label: "Classic Brand" },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setLoginTemplate(tpl.id)}
                      className={`p-3 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1.5 transition-all ${
                        loginTemplate === tpl.id
                          ? "border-teal-400 bg-teal-500/10 text-teal-300 shadow-md shadow-teal-500/10"
                          : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 h-11 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-teal-500/20 self-start inline-flex items-center gap-2 active:scale-95 disabled:opacity-75"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Appliquer la charte graphique en direct
              </button>
            </form>

            {/* Right: Live Interactive Preview Simulator (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-400" /> Prévisualisation Live du Login Tenant
                </h3>
                <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  {company.slug}.afribizsuite.com
                </span>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                {/* Background glow simulation */}
                <div 
                  className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-[60px] opacity-30 pointer-events-none"
                  style={{ backgroundColor: primaryColor }}
                />
                <div 
                  className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none"
                  style={{ backgroundColor: secondaryColor }}
                />

                {/* Simulated Login Box */}
                <div className="w-full max-w-xs flex flex-col items-center gap-4 relative z-10 py-4">
                  {logo ? (
                    <img src={logo} alt="Preview" className="h-10 object-contain drop-shadow" />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg"
                      style={{ backgroundColor: primaryColor, color: primaryContrast }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-white">{loginHeadline}</h4>
                    <p className="text-[10px] text-slate-400">{loginTagline}</p>
                  </div>

                  <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md flex flex-col gap-3">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[9px] font-bold uppercase text-slate-400">Email ou Téléphone</span>
                      <div className="h-8 rounded-lg bg-slate-950 border border-slate-800 px-2.5 flex items-center text-[10px] text-slate-500">
                        koffi@example.com
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[9px] font-bold uppercase text-slate-400">Mot de passe</span>
                      <div className="h-8 rounded-lg bg-slate-950 border border-slate-800 px-2.5 flex items-center text-[10px] text-slate-500">
                        ••••••••
                      </div>
                    </div>

                    <div 
                      className="h-8 rounded-lg font-bold text-xs flex items-center justify-center shadow transition-all mt-1"
                      style={{ backgroundColor: primaryColor, color: primaryContrast }}
                    >
                      Se connecter
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-500 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-400" /> Propulsé par AfriBiz Suite
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3 : ORGANISATION & RH (§34-§39, §85 V6)             */}
        {/* ======================================================== */}
        {activeTab === "hr" && (
          <div className="flex flex-col gap-6 text-left">
            {/* HR Subtabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setHrSubTab("members")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    hrSubTab === "members" ? "bg-slate-800 text-teal-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Collaborateurs ({members.length})
                </button>
                <button
                  onClick={() => setHrSubTab("departments")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    hrSubTab === "departments" ? "bg-slate-800 text-teal-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Départements ({departments.length})
                </button>
                <button
                  onClick={() => setHrSubTab("positions")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    hrSubTab === "positions" ? "bg-slate-800 text-teal-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Fiches de Poste ({positions.length})
                </button>
              </div>

              <button
                onClick={() => { setShowInviteModal(true); setInviteStep(1); }}
                className="inline-flex h-9 px-4 items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black shadow-md shadow-teal-500/20 active:scale-95"
              >
                <UserPlus className="w-4 h-4" /> Inviter un collaborateur
              </button>
            </div>

            {/* Subtab 1: Membres & Invitations */}
            {hrSubTab === "members" && (
              <div className="grid grid-cols-1 gap-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-400" /> Équipe Active ({members.length})
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3 px-4">Collaborateur</th>
                          <th className="py-3 px-4">Poste & Département</th>
                          <th className="py-3 px-4">Statut Collaboration</th>
                          <th className="py-3 px-4">Rôle Système</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {members.map((m: any) => (
                          <tr key={m.userId} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black flex items-center justify-center text-xs uppercase">
                                {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-white">{m.firstName} {m.lastName}</span>
                                <span className="text-[10px] text-slate-400">{m.email}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-200">{m.position || "Non spécifié"}</span>
                                <span className="text-[10px] text-slate-400">{m.department || "Aucun département"}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[10px]">
                                {m.collaborationStatus || "EMPLOYEE"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold text-[10px] uppercase">
                                {m.roleId.replace("_", " ")}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              {m.roleId !== "SUPER_ADMIN" && (
                                <button
                                  onClick={() => handleOffboard(m.userId, `${m.firstName} ${m.lastName}`)}
                                  className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  Offboarder
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Invitations en attente */}
                {invitations.length > 0 && (
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4">
                    <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-400" /> Invitations RH Envoyées ({invitations.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {invitations.map((inv: any) => (
                        <div key={inv.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex justify-between items-center gap-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-white">{inv.email}</span>
                            <span className="text-[10px] text-slate-400">Poste : {inv.position || "Non spécifié"} &middot; Rôle : {inv.roleId}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            En attente
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subtab 2: Départements */}
            {hrSubTab === "departments" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-400" /> Nouveau Département
                  </h3>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="Ex. Direction Financière, Marketing..."
                      className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <button
                      onClick={handleCreateDepartment}
                      disabled={isPending || !newDeptName.trim()}
                      className="h-10 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      Ajouter le département
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm text-white">Départements Existants ({departments.length})</h3>
                  {departments.length === 0 ? (
                    <p className="text-xs text-slate-500">Aucun département configuré.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {departments.map((d: any) => (
                        <div key={d.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex justify-between items-center">
                          <span className="font-bold text-xs text-white">{d.name}</span>
                          <button
                            onClick={() => handleDeleteDepartment(d.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subtab 3: Postes */}
            {hrSubTab === "positions" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-teal-400" /> Nouvelle Fiche de Poste
                  </h3>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={newPosName}
                      onChange={(e) => setNewPosName(e.target.value)}
                      placeholder="Ex. Comptable, Chef Commercial..."
                      className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <select
                      value={newPosDeptId}
                      onChange={(e) => setNewPosDeptId(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                    >
                      <option value="">-- Rattacher à un département --</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <select
                      value={newPosRole}
                      onChange={(e) => setNewPosRole(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                    >
                      {roles.map((r: any) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleCreatePosition}
                      disabled={isPending || !newPosName.trim()}
                      className="h-10 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      Créer le poste
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm text-white">Postes Référencés ({positions.length})</h3>
                  {positions.length === 0 ? (
                    <p className="text-xs text-slate-500">Aucun poste créé.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {positions.map((p: any) => (
                        <div key={p.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-white">{p.name}</span>
                            <span className="text-[10px] text-slate-400">Rôle recommandé : {p.recommendedRoleId}</span>
                          </div>
                          <button
                            onClick={() => handleDeletePosition(p.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4 : DOMAINES & DNS (§19-§20 V6)                     */}
        {/* ======================================================== */}
        {activeTab === "domains" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur-xl flex flex-col gap-6">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-400" /> Gestion des Domaines Personnalisés
              </h2>

              {/* Sous-domaine par défaut */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sous-domaine AfriBiz par défaut</span>
                  <span className="font-extrabold text-base text-teal-400 mt-1 font-mono">{company.slug}.afribizsuite.com</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Actif &middot; SSL Sécurisé
                </span>
              </div>

              {/* Ajouter un domaine personnalisé */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Associer un domaine ou sous-domaine d&apos;entreprise</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    placeholder="Ex. erp.sofitarcom.com"
                    className="flex-1 h-11 px-4 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddDomain}
                    disabled={isPending || !newDomainInput.trim()}
                    className="h-11 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    Ajouter le domaine
                  </button>
                </div>
              </div>

              {/* Liste des domaines personnalisés */}
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Domaines configurés</h3>
                {customDomains.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-center text-xs text-slate-500">
                    Aucun domaine personnalisé associé pour le moment.
                  </div>
                ) : (
                  customDomains.map((cd: any) => (
                    <div key={cd.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white font-mono">{cd.domain}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">CNAME cible : <code className="text-teal-400">cname.afribizsuite.com</code></span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                          cd.status === "ACTIVE" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          {cd.status === "ACTIVE" ? "Vérifié & Actif" : "DNS en attente"}
                        </span>

                        {cd.status !== "ACTIVE" && (
                          <button
                            onClick={() => handleVerifyDomain(cd.id)}
                            disabled={isPending}
                            className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-400 border border-slate-700 flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Vérifier DNS
                          </button>
                        )}

                        <button
                          onClick={() => handleRemoveDomain(cd.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Instructions DNS */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4 backdrop-blur-xl h-fit">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" /> Instructions DNS CNAME
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pour faire pointer votre nom de domaine personnalisé vers votre espace AfriBiz Suite, ajoutez un enregistrement chez votre registrar (GoDaddy, Namecheap, OVH, etc.) :
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-500">Type :</span> <span className="text-teal-400">CNAME</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Nom :</span> <span className="text-slate-200">erp ou app</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Cible :</span> <span className="text-emerald-400">cname.afribizsuite.com</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5 : MODULES & CAPACITÉS (§82-§83 V6)                */}
        {/* ======================================================== */}
        {activeTab === "modules" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { id: "CRM", name: "CRM & Clients", icon: Users, desc: "Fiches clients, prospects, devis et opportunités d'affaires.", active: true },
              { id: "BILLING", name: "Facturation & Devis", icon: FileSpreadsheet, desc: "Factures normalisées IFU, paiements, échéances et reçus.", active: true },
              { id: "HR", name: "Ressources Humaines", icon: Briefcase, desc: "Postes, départements, contrats, collaborateurs et paie.", active: true },
              { id: "PROJECTS", name: "Projets & Tâches", icon: FolderKanban, desc: "Suivi des jalons, livrables et affectation des collaborateurs.", active: true },
              { id: "DOCUMENTS", name: "Documents & Vault", icon: ShieldCheck, desc: "Coffre-fort électronique, partage sécurisé et signatures.", active: true },
              { id: "INVENTORY", name: "Stock & Commandes", icon: ShoppingBag, desc: "Gestion des stocks, articles, inventaires et réapprovisionnements.", active: false },
            ].map((mod) => (
              <div key={mod.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between gap-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-sm text-white">{mod.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    mod.active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500 border-slate-700"
                  }`}>
                    {mod.active ? "Activé pour le Workspace" : "Optionnel"}
                  </span>
                  <span className="text-xs font-bold text-teal-400 cursor-pointer hover:underline">Configurer</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL INVITATION COLLABORATEUR EN 3 ÉTAPES               */}
      {/* ======================================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl flex flex-col gap-6 text-left animate-fade-in relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-black text-xl text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" /> Inviter un collaborateur
              </h3>
              <p className="text-xs text-slate-400">Étape {inviteStep} sur 3 &middot; Parcours RH conforme V6</p>
            </div>

            <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
              {/* Étape 1 : Identité */}
              {inviteStep === 1 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Adresse Email *</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="koffi@example.com"
                      className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300">Prénom</label>
                      <input
                        type="text"
                        value={inviteFirstName}
                        onChange={(e) => setInviteFirstName(e.target.value)}
                        placeholder="Koffi"
                        className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300">Nom</label>
                      <input
                        type="text"
                        value={inviteLastName}
                        onChange={(e) => setInviteLastName(e.target.value)}
                        placeholder="Mensah"
                        className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Téléphone</label>
                    <input
                      type="text"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      placeholder="+229 97 00 00 00"
                      className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setInviteStep(2)}
                    disabled={!inviteEmail.trim()}
                    className="mt-2 h-10 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    Suivant : Poste & Organisation &rarr;
                  </button>
                </div>
              )}

              {/* Étape 2 : Poste & Département */}
              {inviteStep === 2 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Intitulé du Poste</label>
                    <input
                      type="text"
                      value={invitePosition}
                      onChange={(e) => setInvitePosition(e.target.value)}
                      placeholder="Ex. Comptable Principal"
                      className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Département</label>
                    <select
                      value={inviteDepartment}
                      onChange={(e) => setInviteDepartment(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                    >
                      <option value="">-- Sélectionner un département --</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300">Type de Contrat</label>
                      <select
                        value={inviteContractType}
                        onChange={(e) => setInviteContractType(e.target.value)}
                        className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                      >
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="STAGE">Stage</option>
                        <option value="PRESTATION">Prestation</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300">Date de début</label>
                      <input
                        type="date"
                        value={inviteStartDate}
                        onChange={(e) => setInviteStartDate(e.target.value)}
                        className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setInviteStep(1)}
                      className="flex-1 h-10 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteStep(3)}
                      className="flex-1 h-10 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all"
                    >
                      Suivant : Rôle & Droits &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 3 : Rôle & Confirmation */}
              {inviteStep === 3 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Rôle d&apos;accès au Workspace</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                    >
                      {roles.map((r: any) => (
                        <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Message d&apos;invitation personnalisé</label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder="Bienvenue dans l'équipe ! Nous avons le plaisir de vous accueillir..."
                      rows={3}
                      className="p-3 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white resize-none"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setInviteStep(2)}
                      className="flex-1 h-10 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20"
                    >
                      {isPending ? "Envoi..." : "Envoyer l'invitation officielle"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Briefcase, 
  Award, 
  GraduationCap, 
  Link2, 
  Clock, 
  Check, 
  Save, 
  AlertCircle
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Load current user details
  const user = (await db.user.findUnique({
    where: { id: session.userId },
  })) as any;

  if (!user) {
    redirect("/login");
  }

  // Action to save profile changes
  async function handleUpdateProfile(formData: FormData) {
    "use server";
    const session = await getSession();
    if (!session) redirect("/login");

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const address = formData.get("address") as string;
    const birthDateRaw = formData.get("birthDate") as string;
    const ifu = formData.get("ifu") as string;
    
    const jobTitle = formData.get("jobTitle") as string;
    const skillsRaw = formData.get("skills") as string;
    const experienceYearsRaw = formData.get("experienceYears") as string;
    const educationLevel = formData.get("educationLevel") as string;
    const certificationsRaw = formData.get("certifications") as string;
    const portfolioUrl = formData.get("portfolioUrl") as string;
    const availability = formData.get("availability") as string;
    const collaborationType = formData.get("collaborationType") as string;
    const currentStatus = formData.get("currentStatus") as string;

    const birthDate = birthDateRaw ? new Date(birthDateRaw) : null;
    const experienceYears = experienceYearsRaw ? parseInt(experienceYearsRaw, 10) : null;
    const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
    const certifications = certificationsRaw ? certificationsRaw.split(",").map(c => c.trim()).filter(Boolean) : [];

    await (db.user as any).update({
      where: { id: session.userId },
      data: {
        firstName,
        lastName,
        phone,
        city,
        country,
        address: address || null,
        birthDate,
        ifu: ifu || null,
        jobTitle: jobTitle || null,
        skills,
        experienceYears,
        educationLevel: educationLevel || null,
        certifications,
        portfolioUrl: portfolioUrl || null,
        availability: availability || null,
        collaborationType: collaborationType || null,
        currentStatus: currentStatus || null,
      } as any,
    });

    redirect("/dashboard");
  }

  // Format birthDate to YYYY-MM-DD for date input
  const formattedBirthDate = user.birthDate 
    ? new Date(user.birthDate).toISOString().split("T")[0] 
    : "";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Header bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md py-4 px-6 md:px-12 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="inline-flex h-8 px-2 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all text-xs font-bold shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </Link>
          <span className="font-extrabold text-sm md:text-base text-slate-700 text-left">
            Mon Profil Professionnel
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold uppercase overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
            )}
          </div>
          <span className="hidden md:inline text-xs font-bold text-slate-600">{user.firstName} {user.lastName}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 z-10">
        <form action={handleUpdateProfile} className="flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800">
                Mettre à jour mon profil
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Complétez vos informations personnelles et professionnelles pour enrichir votre portefeuille.
              </p>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto inline-flex h-10 px-5 items-center justify-center gap-2 rounded-lg bg-teal-600 text-white text-xs font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-500 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Side: Personal Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-5 text-left">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600 flex items-center gap-2 pb-2 border-b border-slate-200/80">
                <User className="w-4 h-4" />
                Informations Personnelles
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    defaultValue={user.firstName}
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    defaultValue={user.lastName}
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    defaultValue={user.phone}
                    className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ville</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="city"
                      required
                      defaultValue={user.city || ""}
                      className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pays</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="country"
                      required
                      defaultValue={user.country || ""}
                      className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adresse complète</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={user.address || ""}
                  placeholder="Ex: Cotonou, quartier Fidjrossè"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date de naissance</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      name="birthDate"
                      defaultValue={formattedBirthDate}
                      className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IFU Personnel</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="ifu"
                      defaultValue={user.ifu || ""}
                      placeholder="Identifiant Fiscal Unique"
                      className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Professional Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-5 text-left">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600 flex items-center gap-2 pb-2 border-b border-slate-200/80">
                <Briefcase className="w-4 h-4" />
                Informations Professionnelles
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Métier ou titre principal</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="jobTitle"
                    defaultValue={user.jobTitle || ""}
                    placeholder="Ex: Comptable agréé, Développeur web, Consultant RH"
                    className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Compétences (Séparées par des virgules)
                </label>
                <input
                  type="text"
                  name="skills"
                  defaultValue={user.skills.join(", ")}
                  placeholder="Ex: Facturation, Fiscalité, Audit, Excel"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Années d'expérience</label>
                  <input
                    type="number"
                    name="experienceYears"
                    defaultValue={user.experienceYears || ""}
                    placeholder="Ex: 5"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Niveau d'études</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="educationLevel"
                      defaultValue={user.educationLevel || ""}
                      placeholder="Ex: Master II Audit"
                      className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Certifications (Séparées par des virgules)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="certifications"
                    defaultValue={user.certifications.join(", ")}
                    placeholder="Ex: PMP, ACCA, CFA, Scrum Master"
                    className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lien de portfolio ou site web</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="url"
                    name="portfolioUrl"
                    defaultValue={user.portfolioUrl || ""}
                    placeholder="https://monportfolio.com"
                    className="w-full h-10 pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Disponibilité actuelle</label>
                  <select
                    name="availability"
                    defaultValue={user.availability || ""}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-teal-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionner</option>
                    <option value="IMMEDIATELY">Immédiate</option>
                    <option value="1_MONTH">Sous 1 mois</option>
                    <option value="3_MONTHS">Sous 3 mois</option>
                    <option value="NOT_AVAILABLE">Indisponible</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type de contrat recherché</label>
                  <select
                    name="collaborationType"
                    defaultValue={user.collaborationType || ""}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-teal-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionner</option>
                    <option value="EMPLOYEE">Employé (CDD / CDI)</option>
                    <option value="FREELANCE">Freelance / Prestataire</option>
                    <option value="CONSULTANT">Consultant externe</option>
                    <option value="INTERN">Stage professionnel</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Statut professionnel actuel</label>
                <select
                  name="currentStatus"
                  defaultValue={user.currentStatus || ""}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-teal-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Sélectionner</option>
                  <option value="EMPLOYED">En poste</option>
                  <option value="FREELANCER">À mon propre compte</option>
                  <option value="LOOKING">En recherche active</option>
                  <option value="STUDENT_INTERN">Étudiant / En stage</option>
                </select>
              </div>

            </div>

          </div>

        </form>
      </main>
    </div>
  );
}

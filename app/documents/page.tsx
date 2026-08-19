import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ArrowLeft,
  FileText,
  Upload,
  Trash2,
  Archive,
  Download,
  Share2,
  FolderOpen,
  Calendar,
  Building,
  Tag,
  Link as LinkIcon
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Chargement des informations de l'utilisateur connecté
  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  // Chargement de l'ensemble des documents de l'utilisateur
  const documents = await db.document.findMany({
    where: { userId: user.id },
    include: {
      issuerCompany: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Chargement des partages actifs
  const activeShares = await db.documentShare.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Action pour uploader un nouveau document personnel
  async function handleUploadDocument(formData: FormData) {
    "use server";
    const currentSession = await getSession();
    if (!currentSession) redirect("/login");

    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const tagsRaw = formData.get("tags") as string;
    
    if (!file || file.size === 0) {
      return;
    }

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueName = `${randomUUID()}_${file.name}`;
      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/${uniqueName}`;
      const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

      const newDoc = await db.document.create({
        data: {
          userId: currentSession.userId,
          name: name || file.name,
          type: type || "OTHER",
          category: "UPLOADED",
          description: description || null,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          tags,
          status: "ACTIVE",
        },
      });

      await logAuditEvent({
        userId: currentSession.userId,
        action: "DOCUMENT_UPLOAD",
        entity: "DOCUMENT",
        entityId: newDoc.id,
        metadata: { name: newDoc.name, type: newDoc.type, size: newDoc.fileSize },
      });
    } catch (err) {
      console.error("Erreur lors de l'upload du document:", err);
      return;
    }

    redirect("/documents");
  }

  // Action sécurisée pour supprimer un document (protection contre IDOR)
  async function handleDeleteDocument(formData: FormData) {
    "use server";
    const currentSession = await getSession();
    if (!currentSession) redirect("/login");

    const docId = formData.get("docId") as string;
    if (!docId) return;

    const doc = await db.document.findUnique({
      where: { id: docId },
    });

    if (!doc) return;

    // Vérification d'autorisation : le document doit appartenir à l'utilisateur connecté
    if (doc.userId !== currentSession.userId) {
      console.warn(`[Security Alert] Tentative de suppression non autorisée du document ${docId} par l'utilisateur ${currentSession.userId}`);
      return;
    }

    await db.document.delete({
      where: { id: docId },
    });

    await logAuditEvent({
      userId: currentSession.userId,
      action: "DOCUMENT_DELETE",
      entity: "DOCUMENT",
      entityId: docId,
      metadata: { name: doc.name },
    });

    redirect("/documents");
  }

  // Action sécurisée pour archiver / désarchiver un document
  async function handleArchiveDocument(formData: FormData) {
    "use server";
    const currentSession = await getSession();
    if (!currentSession) redirect("/login");

    const docId = formData.get("docId") as string;
    const currentStatus = formData.get("status") as string;
    if (!docId) return;

    const doc = await db.document.findUnique({
      where: { id: docId },
    });

    if (!doc || doc.userId !== currentSession.userId) {
      return;
    }

    const newStatus = currentStatus === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";

    await db.document.update({
      where: { id: docId },
      data: { status: newStatus },
    });

    await logAuditEvent({
      userId: currentSession.userId,
      action: newStatus === "ARCHIVED" ? "DOCUMENT_ARCHIVE" : "DOCUMENT_UNARCHIVE",
      entity: "DOCUMENT",
      entityId: docId,
    });

    redirect("/documents");
  }

  // Action sécurisée pour générer un lien de partage
  async function handleShareDocuments(formData: FormData) {
    "use server";
    const currentSession = await getSession();
    if (!currentSession) redirect("/login");

    const selectedDocIds = formData.getAll("documentIds") as string[];
    const expiryDays = formData.get("expiryDays") as string;

    if (selectedDocIds.length === 0) {
      return;
    }

    // Filtrer pour s'assurer que tous les documents partagés appartiennent bien à l'utilisateur
    const userDocs = await db.document.findMany({
      where: {
        id: { in: selectedDocIds },
        userId: currentSession.userId,
      },
    });

    const verifiedDocIds = userDocs.map((d) => d.id);
    if (verifiedDocIds.length === 0) return;

    const token = randomUUID();
    const expiresAt = expiryDays
      ? new Date(Date.now() + parseInt(expiryDays, 10) * 24 * 60 * 60 * 1000)
      : null;

    const share = await db.documentShare.create({
      data: {
        userId: currentSession.userId,
        token,
        documentIds: verifiedDocIds,
        expiresAt,
      },
    });

    await logAuditEvent({
      userId: currentSession.userId,
      action: "DOCUMENT_SHARE_CREATED",
      entity: "DOCUMENT_SHARE",
      entityId: share.id,
      metadata: { count: verifiedDocIds.length, expiresAt },
    });

    redirect("/documents");
  }

  const personalDocs = documents.filter((d) => d.category === "UPLOADED");
  const receivedDocs = documents.filter((d) => d.category === "RECEIVED");

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
          <span className="font-extrabold text-sm md:text-base text-slate-700">
            Portefeuille Documentaire
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Total : {documents.length} document(s)</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 z-10 flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800">
              Mes Documents professionnels
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Centralisez vos CV, diplômes et documents contractuels ou fiches de paie reçus de vos employeurs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Documents List (Personal and Received) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* 1. Personal Documents Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600 flex items-center gap-2 pb-2 border-b border-slate-200/80 text-left">
                <FolderOpen className="w-4 h-4" />
                Documents Personnels Uploadés ({personalDocs.length})
              </h3>

              {personalDocs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-100/50 p-6 text-center text-xs text-slate-500">
                  Aucun document personnel pour l'instant. Utilisez le formulaire à droite pour ajouter vos fichiers.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {personalDocs.map((doc) => (
                    <div 
                      key={doc.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-8 h-8 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            {doc.name}
                            {doc.status === "ARCHIVED" && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase">
                                Archivé
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block mt-0.5">
                            Type: {doc.type} • Taille: {Math.round(doc.fileSize ? doc.fileSize / 1024 : 0)} KB
                          </span>
                          {doc.description && (
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{doc.description}</p>
                          )}
                          {doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map((tag, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60 flex items-center gap-1">
                                  <Tag className="w-2 h-2 text-teal-600" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t border-slate-100 pt-3 md:pt-0 md:border-0">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:text-teal-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
                          title="Télécharger"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        <form action={handleArchiveDocument}>
                          <input type="hidden" name="docId" value={doc.id} />
                          <input type="hidden" name="status" value={doc.status} />
                          <button
                            type="submit"
                            className={`inline-flex h-8 w-8 items-center justify-center rounded border transition-all shadow-sm ${doc.status === "ARCHIVED" ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-slate-50 hover:border-slate-300"}`}
                            title={doc.status === "ARCHIVED" ? "Désarchiver" : "Archiver"}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </form>

                        <form action={handleDeleteDocument}>
                          <input type="hidden" name="docId" value={doc.id} />
                          <button
                            type="submit"
                            className="inline-flex h-8 w-8 items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Received Documents Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-2 pb-2 border-b border-slate-200/80 text-left">
                <Building className="w-4 h-4" />
                Documents reçus des entreprises ({receivedDocs.length})
              </h3>

              {receivedDocs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-100/50 p-6 text-center text-xs text-slate-500">
                  Aucun document reçu pour l'instant. Vos fiches de paie, contrats et attestations s'afficheront ici lorsqu'ils seront émis par vos entreprises.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {receivedDocs.map((doc) => (
                    <div 
                      key={doc.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-sm text-slate-800">
                            {doc.name}
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1 items-center">
                            <span className="text-[9px] text-slate-400 uppercase font-semibold">
                              Type: {doc.type}
                            </span>
                            {doc.issuerCompany && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide flex items-center gap-1">
                                <Building className="w-2.5 h-2.5" />
                                {doc.issuerCompany.name}
                              </span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{doc.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t border-slate-100 pt-3 md:pt-0 md:border-0">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 px-3.5 items-center justify-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-xs font-bold shadow-sm shadow-emerald-500/10"
                          title="Télécharger"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Télécharger
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Columns: Add Document Form & Share Links */}
          <div className="flex flex-col gap-8">
            
            {/* 1. Add Document Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 text-left">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600 flex items-center gap-2 pb-2 border-b border-slate-200/80">
                <Upload className="w-4 h-4" />
                Ajouter un document
              </h3>

              <form action={handleUploadDocument} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nom du document</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ex: Mon CV mis à jour"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type de document</label>
                  <select
                    name="type"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-teal-500 transition-all cursor-pointer"
                  >
                    <option value="CV">Curriculum Vitae (CV)</option>
                    <option value="DIPLOMA">Diplôme</option>
                    <option value="CERTIFICATE">Attestation / Certification</option>
                    <option value="ID_CARD">Pièce d'identité</option>
                    <option value="BIRTH_CERTIFICATE">Acte de naissance</option>
                    <option value="CONTRACT">Contrat</option>
                    <option value="PAYSLIP">Fiche de paie</option>
                    <option value="OTHER">Autre document</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fichier</label>
                  <input
                    type="file"
                    name="file"
                    required
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-teal-600 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Facultatif"
                    className="w-full p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tags (Séparés par des virgules)</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="Ex: recrutement, audit, 2026"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-teal-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all mt-2"
                >
                  <Upload className="w-4 h-4" />
                  Téléverser le document
                </button>
              </form>
            </div>

            {/* 2. Share Documents Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 text-left">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-2 pb-2 border-b border-slate-200/80">
                <Share2 className="w-4 h-4" />
                Partager mon dossier sécurisé
              </h3>

              {documents.length === 0 ? (
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Ajoutez d'abord des documents pour pouvoir générer des liens de partage sécurisés.
                </p>
              ) : (
                <form action={handleShareDocuments} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Documents à inclure</label>
                    {documents.map((doc) => (
                      <label key={doc.id} className="flex items-center gap-2.5 p-2 rounded bg-slate-50/50 border border-slate-200 text-xs cursor-pointer hover:border-slate-300">
                        <input
                          type="checkbox"
                          name="documentIds"
                          value={doc.id}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="truncate text-slate-700">{doc.name}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Durée de validité (jours)</label>
                    <select
                      name="expiryDays"
                      required
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-teal-500 transition-all cursor-pointer"
                    >
                      <option value="1">1 jour</option>
                      <option value="7">7 jours</option>
                      <option value="30">30 jours</option>
                      <option value="">Illimité</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all mt-2"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Générer le lien sécurisé
                  </button>
                </form>
              )}

              {/* Active Shares List */}
              {activeShares.length > 0 && (
                <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Liens actifs</h4>
                  <div className="flex flex-col gap-2 max-h-36 overflow-y-auto">
                    {activeShares.map((share) => (
                      <div key={share.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px] flex justify-between items-center">
                        <div className="flex flex-col truncate">
                          <span className="font-mono text-slate-700 truncate pr-2">
                            Token: {share.token.substring(0, 8)}...
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Exp: {share.expiresAt ? new Date(share.expiresAt).toLocaleDateString() : "Jamais"}
                          </span>
                        </div>
                        <a 
                          href={`/documents/share/${share.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-600 hover:underline flex-shrink-0 font-bold"
                        >
                          Visiter
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

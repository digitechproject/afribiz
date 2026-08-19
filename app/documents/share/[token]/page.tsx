import { db } from "@/lib/db";
import { FileText, Download, ShieldAlert, Calendar, User, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedDocumentsPage({ params }: SharePageProps) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  if (!token) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Lien invalide</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm">Le jeton de partage est absent ou incorrect.</p>
      </div>
    );
  }

  // 1. Find document share details
  const share = await (db as any).documentShare.findUnique({
    where: { token },
    include: {
      user: true
    }
  });

  if (!share) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Dossier introuvable</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm">Ce dossier partagé n'existe pas ou le lien a été révoqué.</p>
      </div>
    );
  }

  // 2. Check expiration
  if (share.expiresAt && new Date() > share.expiresAt) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Lien expiré</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm">Ce lien de consultation a expiré et n'est plus accessible.</p>
      </div>
    );
  }

  // Increment views count
  await (db as any).documentShare.update({
    where: { id: share.id },
    data: { viewsCount: { increment: 1 } }
  });

  // 3. Load associated documents
  const sharedDocuments = await (db as any).document.findMany({
    where: {
      id: { in: share.documentIds }
    },
    include: {
      issuerCompany: true
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-hidden items-center justify-center py-12 px-6">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-40 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-teal-500/5 blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6 z-10 animate-fade-in">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-11 h-11 rounded-lg bg-teal-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md animate-pulse">
            A
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            AfriBiz Suite
          </h1>
          <p className="text-xs text-slate-500">
            Espace de consultation sécurisé de documents professionnels.
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl p-8">
          
          {/* Header section with share owner */}
          <div className="flex flex-col items-center text-center gap-3 border-b border-slate-200 pb-6 mb-6">
            <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-650">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-800">
                Dossier partagé par {share.user.firstName} {share.user.lastName}
              </h3>
              <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Exp: {share.expiresAt ? new Date(share.expiresAt).toLocaleDateString() : "Illimité"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Vues : {share.viewsCount + 1}
                </span>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="flex flex-col gap-3">
            {sharedDocuments.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">Aucun document dans ce dossier.</p>
            ) : (
              sharedDocuments.map((doc: any) => (
                <div 
                  key={doc.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 hover:bg-slate-50/80 p-4 flex justify-between items-center gap-4 text-left transition-all shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-7 h-7 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sm text-slate-800">
                        {doc.name}
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1 items-center">
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">
                          Type: {doc.type}
                        </span>
                        {doc.issuerCompany && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                            {doc.issuerCompany.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 px-3 items-center justify-center gap-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold shadow-md shadow-teal-500/10 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Consulter
                  </a>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

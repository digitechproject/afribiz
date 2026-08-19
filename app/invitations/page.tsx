import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ArrowLeft,
  Building, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Load current user details
  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  // Load all invitations for this user email
  const invitations = await db.invitation.findMany({
    where: { email: user.email },
    include: {
      company: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Action to handle accept/decline
  async function handleAction(formData: FormData) {
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
      redirect("/invitations");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wide flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Acceptée
          </span>
        );
      case "REJECTED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wide flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Refusée
          </span>
        );
      case "EXPIRED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3" /> Expirée
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
    }
  };

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
            Gestion des Invitations
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Total : {invitations.length} invitation(s)</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 z-10 flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800">
              Invitations reçues
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Consultez et répondez aux invitations de collaboration des entreprises d'AfriBiz Suite.
            </p>
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <Mail className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="font-bold text-base text-slate-700">Aucune invitation reçue</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Les entreprises qui vous invitent à collaborer apparaîtront ici. Assurez-vous d'avoir communiqué la bonne adresse email : <span className="font-semibold text-slate-700">{user.email}</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {invitations.map((invite: any) => {
              const isPending = invite.status === "PENDING" && new Date() <= invite.expiresAt;
              const isExpired = invite.status === "PENDING" && new Date() > invite.expiresAt;
              const statusText = isExpired ? "EXPIRED" : invite.status;

              return (
                <div 
                  key={invite.id} 
                  className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center text-xl font-bold">
                      {invite.company.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-base text-slate-800">
                          {invite.company.name}
                        </h4>
                        {getStatusBadge(statusText)}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Vous invite en tant que <span className="font-semibold text-slate-700">{invite.roleId.replace("_", " ")}</span>
                        {invite.position && (
                          <> au poste de <span className="font-semibold text-slate-700">{invite.position}</span></>
                        )}
                        {invite.department && (
                          <> (Service {invite.department})</>
                        )}
                        .
                      </p>
                      
                      {invite.message && (
                        <div className="text-[11px] text-slate-650 bg-slate-50 p-3 rounded-lg border border-slate-200/80 italic mt-3">
                          "{invite.message}"
                        </div>
                      )}

                      <span className="text-[10px] text-slate-400 font-semibold mt-2.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Reçue le {new Date(invite.createdAt).toLocaleDateString()} • Expire le {new Date(invite.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Pending invitations */}
                  {isPending && (
                    <form action={handleAction} className="flex gap-2 w-full md:w-auto justify-end border-t border-slate-100 pt-3 md:pt-0 md:border-0">
                      <input type="hidden" name="invitationId" value={invite.id} />
                      <input type="hidden" name="token" value={invite.token} />
                      
                      <button
                        type="submit"
                        name="action"
                        value="REJECT"
                        className="h-9 px-4 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold text-slate-650 shadow-sm transition-all"
                      >
                        Refuser
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="ACCEPT"
                        className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-md shadow-teal-500/10 transition-all"
                      >
                        Accepter
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

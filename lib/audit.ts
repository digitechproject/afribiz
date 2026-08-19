import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface LogAuditParams {
  userId?: string | null;
  companyId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Enregistre un événement dans le journal d'audit de sécurité
 */
export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId || null,
        companyId: params.companyId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        metadata: (params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (err) {
    // Les erreurs d'audit ne doivent jamais bloquer les flux métiers principaux
    console.error("[AuditLog Error] Impossible d'enregistrer l'événement d'audit:", err);
  }
}

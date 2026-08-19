export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<SendEmailResult>;
}

/**
 * Provider Console pour le développement local et les tests
 */
export class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
    console.log("\n==================== [AFRIBIZ EMAIL SERVICE] ====================");
    console.log(`DE      : ${payload.from || "AfriBiz Suite <noreply@afribizsuite.com>"}`);
    console.log(`POUR    : ${payload.to}`);
    console.log(`SUJET   : ${payload.subject}`);
    console.log("-----------------------------------------------------------------");
    console.log(payload.text || payload.html.replace(/<[^>]+>/g, " ").trim());
    console.log("=================================================================\n");

    return {
      success: true,
      id: `console_${Date.now()}`,
    };
  }
}

/**
 * Provider Resend pour la production
 */
export class ResendEmailProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
    try {
      const from = payload.from || process.env.EMAIL_FROM || "AfriBiz Suite <noreply@afribizsuite.com>";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      const data = (await response.json()) as { message?: string; id?: string };
      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Erreur lors de l'envoi d'email via Resend",
        };
      }

      return {
        success: true,
        id: data.id,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur de connexion au service email";
      console.error("Erreur Resend provider:", err);
      return {
        success: false,
        error: message,
      };
    }
  }
}

let activeProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (activeProvider) return activeProvider;

  if (process.env.RESEND_API_KEY) {
    activeProvider = new ResendEmailProvider(process.env.RESEND_API_KEY);
  } else {
    activeProvider = new ConsoleEmailProvider();
  }

  return activeProvider;
}

export async function sendMail(payload: EmailPayload): Promise<SendEmailResult> {
  const provider = getEmailProvider();
  return await provider.sendEmail(payload);
}

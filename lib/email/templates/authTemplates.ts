import { EmailPayload } from "../provider";

/**
 * Template pour le code OTP de vérification de compte ou connexion
 */
export function createOtpEmail(params: {
  to: string;
  code: string;
  recipientName?: string;
}): EmailPayload {
  const name = params.recipientName || "Bonjour";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { display: inline-block; width: 44px; height: 44px; background: #0f766e; color: #ffffff; border-radius: 10px; font-weight: 800; font-size: 22px; line-height: 44px; text-align: center; }
          .title { font-size: 20px; font-weight: 800; margin-top: 16px; color: #0f172a; }
          .otp-card { background: #f0fdfa; border: 1.5px dashed #0f766e; border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f766e; font-family: monospace; }
          .text { font-size: 14px; line-height: 1.6; color: #475569; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">A</div>
            <div class="title">Vérification de sécurité</div>
          </div>
          <p class="text">${name},</p>
          <p class="text">Voici votre code de vérification à 6 chiffres pour accéder à votre compte AfriBiz Suite :</p>
          <div class="otp-card">
            <div class="otp-code">${params.code}</div>
          </div>
          <p class="text">Ce code est valable pendant <strong>15 minutes</strong>. Ne le partagez avec personne.</p>
          <div class="footer">
            AfriBiz Suite — Infrastructure SaaS de Gestion Professionnelle Multi-Tenant.<br>
            Si vous n'avez pas demandé ce code, ignorez cet email.
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    to: params.to,
    subject: `Votre code de vérification AfriBiz : ${params.code}`,
    html,
    text: `Bonjour,\n\nVotre code de vérification AfriBiz Suite est : ${params.code}\nCe code expire dans 15 minutes.\n\nL'équipe AfriBiz Suite`,
  };
}

/**
 * Template pour les invitations à rejoindre un espace entreprise
 */
export function createInvitationEmail(params: {
  to: string;
  companyName: string;
  roleName: string;
  acceptUrl: string;
  inviterName?: string;
}): EmailPayload {
  const inviter = params.inviterName ? `<strong>${params.inviterName}</strong> vous a invité(e)` : "Vous avez été invité(e)";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { display: inline-block; width: 48px; height: 48px; background: #0f766e; color: #ffffff; border-radius: 12px; font-weight: 800; font-size: 24px; line-height: 48px; text-align: center; }
          .title { font-size: 22px; font-weight: 800; margin-top: 16px; color: #0f172a; }
          .btn-wrap { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #0f766e; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; box-shadow: 0 2px 8px rgba(15, 118, 110, 0.25); }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 20px 0; }
          .text { font-size: 14px; line-height: 1.6; color: #475569; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">A</div>
            <div class="title">Invitation d'entreprise</div>
          </div>
          <p class="text">${inviter} à rejoindre l'espace professionnel de <strong>${params.companyName}</strong> sur AfriBiz Suite.</p>
          <div class="card">
            <div style="font-size: 13px; color: #64748b;">Rôle attribué :</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f766e; margin-top: 4px;">${params.roleName}</div>
          </div>
          <div class="btn-wrap">
            <a href="${params.acceptUrl}" class="btn">Accepter l'invitation</a>
          </div>
          <p class="text" style="font-size: 12px; color: #64748b;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><a href="${params.acceptUrl}" style="color: #0f766e; word-break: break-all;">${params.acceptUrl}</a></p>
          <div class="footer">
            AfriBiz Suite — Plateforme ERP et Portail Collaborateur Multi-Tenant.
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    to: params.to,
    subject: `Invitation à rejoindre ${params.companyName} sur AfriBiz Suite`,
    html,
    text: `Bonjour,\n\nVous êtes invité(e) à rejoindre l'entreprise ${params.companyName} avec le rôle ${params.roleName}.\n\nCliquez sur ce lien pour accepter : ${params.acceptUrl}\n\nL'équipe AfriBiz Suite`,
  };
}

/**
 * Template pour la réinitialisation de mot de passe
 */
export function createPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  recipientName?: string;
}): EmailPayload {
  const name = params.recipientName || "Bonjour";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { display: inline-block; width: 44px; height: 44px; background: #0f766e; color: #ffffff; border-radius: 10px; font-weight: 800; font-size: 22px; line-height: 44px; text-align: center; }
          .title { font-size: 20px; font-weight: 800; margin-top: 16px; color: #0f172a; }
          .btn-wrap { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #0f766e; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; box-shadow: 0 2px 8px rgba(15, 118, 110, 0.25); }
          .text { font-size: 14px; line-height: 1.6; color: #475569; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">A</div>
            <div class="title">Réinitialisation de mot de passe</div>
          </div>
          <p class="text">${name},</p>
          <p class="text">Une demande de réinitialisation de mot de passe a été émise pour votre compte AfriBiz Suite. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe sécurisé :</p>
          <div class="btn-wrap">
            <a href="${params.resetUrl}" class="btn">Réinitialiser mon mot de passe</a>
          </div>
          <p class="text" style="font-size: 12px; color: #64748b;">Ce lien est valable <strong>1 heure</strong>. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
          <div class="footer">
            AfriBiz Suite — Sécurité et Identité Professionnelle.
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    to: params.to,
    subject: "Réinitialisation de votre mot de passe AfriBiz Suite",
    html,
    text: `Bonjour,\n\nPour réinitialiser votre mot de passe AfriBiz Suite, rendez-vous sur le lien suivant :\n${params.resetUrl}\n\nCe lien expire dans 1 heure.\n\nL'équipe AfriBiz Suite`,
  };
}

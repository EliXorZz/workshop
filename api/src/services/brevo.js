const Brevo = require("@getbrevo/brevo");

function isConfigured() {
  return !!process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.length > 20;
}

// À partir de @getbrevo/brevo v2.3+, `ApiClient` a été retiré.
// On passe la clé directement sur l'instance via `setApiKey`.
function getEmailApi() {
  const api = new Brevo.TransactionalEmailsApi();
  api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  return api;
}

function getSmsApi() {
  const api = new Brevo.TransactionalSMSApi();
  api.setApiKey(Brevo.TransactionalSMSApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  return api;
}

// Envoie un email à une liste de destinataires (BCC par batch de 99)
async function sendEmail({ recipients, subject, body }) {
  if (!isConfigured()) {
    console.warn("[Brevo] Clé API non configurée — email simulé.");
    return { simulated: true, count: recipients.length };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "bonjour@bistrot-tatina.fr";
  const senderName  = process.env.BREVO_SENDER_NAME  || "Le Bistrot de Tatina";
  const api         = getEmailApi();
  const htmlBody    = toHtml(body, senderEmail);
  const BATCH       = 99;
  let sent          = 0;

  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH);
    const msg   = new Brevo.SendSmtpEmail();
    msg.sender       = { email: senderEmail, name: senderName };
    // Le vrai envoi va en BCC pour protéger les adresses
    msg.to           = [{ email: senderEmail, name: senderName }];
    msg.bcc          = batch.map((email) => ({ email }));
    msg.subject      = subject;
    msg.htmlContent  = htmlBody;
    msg.replyTo      = { email: senderEmail };

    try {
      await api.sendTransacEmail(msg);
      sent += batch.length;
    } catch (err) {
      console.error("[Brevo] Erreur envoi batch email:", err?.response?.body || err.message);
    }
  }

  return { sent };
}

// Envoie un SMS à une liste de numéros
async function sendSms({ phoneNumbers, content }) {
  if (!isConfigured()) {
    console.warn("[Brevo] Clé API non configurée — SMS simulé.");
    return { simulated: true, count: phoneNumbers.length };
  }

  const api    = getSmsApi();
  const sender = (process.env.BREVO_SENDER_NAME || "Tatina").replace(/\s/g, "").substring(0, 11);
  let sent     = 0;

  for (const phone of phoneNumbers) {
    if (!phone) continue;
    const sms       = new Brevo.SendTransacSms();
    sms.sender      = sender;
    sms.recipient   = phone.replace(/[\s.+\-()]/g, "");
    sms.content     = content.substring(0, 160);

    try {
      await api.sendTransacSms(sms);
      sent++;
    } catch (err) {
      console.error("[Brevo] Erreur SMS vers", phone, err?.response?.body || err.message);
    }
  }

  return { sent };
}

function toHtml(body, senderEmail) {
  const escaped = String(body)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"/></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
  <div style="border-left:4px solid #F5C518;padding-left:20px;margin-bottom:24px;">
    <strong style="font-size:18px;letter-spacing:1px;">LE BISTROT DE TATINA</strong>
  </div>
  <p style="line-height:1.7;">${escaped}</p>
  <hr style="border:0;border-top:1px solid #eee;margin:32px 0;"/>
  <p style="font-size:12px;color:#999;">
    Le Bistrot de Tatina · Meythet (74)<br/>
    <a href="mailto:${senderEmail}" style="color:#F5C518;">${senderEmail}</a>
  </p>
</body></html>`;
}

module.exports = { sendEmail, sendSms };

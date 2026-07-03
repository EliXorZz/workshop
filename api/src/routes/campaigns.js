const express = require("express");
const db    = require("../config/db");
const brevo = require("../services/brevo");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Récupère les destinataires selon la cible
async function resolveRecipients(target) {
  let where = "";
  if (target === "active")  where = "WHERE payment_status = 1";
  if (target === "torenew") where = "WHERE payment_status = 0";

  const { rows } = await db.query(
    `SELECT email, phone, consent, contact_email, contact_sms FROM members ${where}`
  );

  // Respect du consentement RGPD ET des préférences de contact individuelles
  const emails = rows.filter((m) => m.consent && m.contact_email).map((m) => m.email);
  const phones = rows.filter((m) => m.consent && m.contact_sms && m.phone).map((m) => m.phone);

  return { emails, phones, total: rows.length, consented: emails.length };
}

// GET /api/campaigns/recipient-counts — nombre de destinataires par cible
// (uniquement ceux qui ont donné leur consentement RGPD, comme à l'envoi)
router.get("/recipient-counts", requireAuth, async (req, res) => {
  const [all, active, torenew] = await Promise.all([
    db.query("SELECT COUNT(*) AS c FROM members WHERE consent = 1 AND contact_email = 1"),
    db.query("SELECT COUNT(*) AS c FROM members WHERE consent = 1 AND contact_email = 1 AND payment_status = 1"),
    db.query("SELECT COUNT(*) AS c FROM members WHERE consent = 1 AND contact_email = 1 AND payment_status = 0"),
  ]);
  res.json({
    all:     Number(all.rows[0].c)     || 0,
    active:  Number(active.rows[0].c)  || 0,
    torenew: Number(torenew.rows[0].c) || 0,
  });
});

// GET /api/campaigns — historique
router.get("/", requireAuth, async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 50"
  );
  res.json(rows);
});

// POST /api/campaigns — envoie ou sauvegarde brouillon
router.post("/", requireAuth, async (req, res) => {
  const { channel, subject, body, target = "all", draft = false } = req.body;

  if (!channel || !body) {
    return res.status(400).json({ error: "Canal et message obligatoires" });
  }
  if ((channel === "email" || channel === "both") && !subject) {
    return res.status(400).json({ error: "Sujet obligatoire pour un email" });
  }

  if (draft) {
    const { rows } = await db.query(
      `INSERT INTO campaigns (channel, subject, body, target, status)
       VALUES ($1,$2,$3,$4,'draft') RETURNING *`,
      [channel, subject || null, body, target]
    );
    return res.status(201).json(rows[0]);
  }

  const { emails, phones, total, consented } = await resolveRecipients(target);

  let status = "sent";
  let sent   = 0;

  try {
    if (channel === "email" || channel === "both") {
      const result = await brevo.sendEmail({ recipients: emails, subject, body });
      sent = result.sent || 0;
    }

    if (channel === "sms" || channel === "both") {
      await brevo.sendSms({ phoneNumbers: phones, content: body });
    }
  } catch (err) {
    console.error("Erreur campagne:", err.message);
    status = "failed";
  }

  const { rows } = await db.query(
    `INSERT INTO campaigns (channel, subject, body, target, status, recipient_count, sent_at)
     VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`,
    [channel, subject || null, body, target, status, consented]
  );

  res.status(201).json({ ...rows[0], consented, total });
});

// GET /api/campaigns/contact-requests
router.get("/contact-requests", requireAuth, async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM contact_requests ORDER BY created_at DESC"
  );
  res.json(rows);
});

// PATCH /api/campaigns/contact-requests/:id
router.patch("/contact-requests/:id", requireAuth, async (req, res) => {
  const { status } = req.body;
  const { rows } = await db.query(
    "UPDATE contact_requests SET status=$1 WHERE id=$2 RETURNING *",
    [status, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Demande introuvable" });
  res.json(rows[0]);
});

module.exports = router;

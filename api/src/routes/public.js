const express = require("express");
const db      = require("../config/db");

const router = express.Router();

// GET /api/public/stats — chiffres publics (membres, etc.)
router.get("/stats", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT COUNT(*) AS total FROM members");
    res.json({ members: Number(rows[0].total) || 0 });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/public/preadmission
// Formulaire de pré-adhésion (accessible sans auth)
router.post("/preadmission", async (req, res) => {
  const { first_name, last_name, email, phone, consent } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: "Prénom, nom et email sont obligatoires" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  try {
    // Vérifie si l'email existe déjà
    const existing = await db.query("SELECT id FROM members WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
    }

    const { rows } = await db.query(
      `INSERT INTO members (first_name, last_name, email, phone, consent, payment_status)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, first_name, last_name, email`,
      [first_name.trim(), last_name.trim(), email.trim().toLowerCase(), phone?.trim() || null, !!consent]
    );

    const member = rows[0];

    res.status(201).json({
      message: "Pré-adhésion enregistrée. À bientôt à la porte jaune !",
      id: member.id,
    });
  } catch (err) {
    console.error("POST /public/preadmission:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/public/concert-request
// Formulaire de contact groupe/concert
router.post("/concert-request", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Nom et email sont obligatoires" });
  }

  try {
    await db.query(
      `INSERT INTO contact_requests (type, name, email, phone, message)
       VALUES ('concert', $1, $2, $3, $4)`,
      [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, message?.trim() || null]
    );

    res.status(201).json({ message: "Demande envoyée. On revient vers toi sous 7 jours." });
  } catch (err) {
    console.error("POST /public/concert-request:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

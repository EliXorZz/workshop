const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/settings — tous les paramètres (public pour affichage site)
router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT key, value FROM settings ORDER BY key");
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

// PATCH /api/settings — mise à jour partielle (admin)
router.patch("/", requireAuth, async (req, res) => {
  const entries = Object.entries(req.body);
  if (!entries.length) return res.status(400).json({ error: "Aucune donnée fournie" });

  for (const [key, value] of entries) {
    await db.query(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`,
      [key, String(value)]
    );
  }

  const { rows } = await db.query("SELECT key, value FROM settings ORDER BY key");
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

module.exports = router;

const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/associations (public)
router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM associations ORDER BY sort_order, id");
  res.json(rows);
});

// POST /api/associations
router.post("/", requireAuth, async (req, res) => {
  const { name, description, amount_2026, website_url, logo_url, sort_order } = req.body;
  if (!name) return res.status(400).json({ error: "Nom obligatoire" });

  const { rows } = await db.query(
    `INSERT INTO associations (name, description, amount_2026, website_url, logo_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, description || null, Number(amount_2026) || 0, website_url || null, logo_url || null, Number(sort_order) || 0]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/associations/:id
router.put("/:id", requireAuth, async (req, res) => {
  const { name, description, amount_2026, website_url, logo_url, sort_order } = req.body;
  const { rows } = await db.query(
    `UPDATE associations SET name=$1, description=$2, amount_2026=$3, website_url=$4, logo_url=$5, sort_order=$6
     WHERE id=$7 RETURNING *`,
    [name, description || null, Number(amount_2026) || 0, website_url || null, logo_url || null, Number(sort_order) || 0, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Association introuvable" });
  res.json(rows[0]);
});

// DELETE /api/associations/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { rows } = await db.query("DELETE FROM associations WHERE id=$1 RETURNING id", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Association introuvable" });
  res.json({ deleted: true });
});

module.exports = router;

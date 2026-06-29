const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/menu — liste groupée par catégorie (public)
router.get("/", async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM menu_items ORDER BY category, sort_order, id"
  );

  // Regroupe par catégorie
  const grouped = {};
  for (const item of rows) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  res.json(grouped);
});

// POST /api/menu
router.post("/", requireAuth, async (req, res) => {
  const { category, label, price, sort_order } = req.body;
  if (!category || !label || !price) {
    return res.status(400).json({ error: "Catégorie, intitulé et prix sont obligatoires" });
  }

  const { rows } = await db.query(
    "INSERT INTO menu_items (category, label, price, sort_order) VALUES ($1,$2,$3,$4) RETURNING *",
    [category.trim(), label.trim(), price.trim(), Number(sort_order) || 0]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/menu/:id
router.put("/:id", requireAuth, async (req, res) => {
  const { category, label, price, sort_order } = req.body;
  const { rows } = await db.query(
    "UPDATE menu_items SET category=$1, label=$2, price=$3, sort_order=$4 WHERE id=$5 RETURNING *",
    [category, label, price, Number(sort_order) || 0, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Plat introuvable" });
  res.json(rows[0]);
});

// DELETE /api/menu/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { rows } = await db.query("DELETE FROM menu_items WHERE id=$1 RETURNING id", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Plat introuvable" });
  res.json({ deleted: true });
});

module.exports = router;

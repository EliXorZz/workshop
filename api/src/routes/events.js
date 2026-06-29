const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/events — liste (public ou admin)
router.get("/", async (req, res) => {
  const { status, type, upcoming } = req.query;
  let where  = [];
  let params = [];

  if (status)           { where.push(`status = ?`);          params.push(status); }
  if (type)             { where.push(`type = ?`);             params.push(type); }
  if (upcoming === "true") { where.push(`event_date >= date('now')`); }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const { rows } = await db.query(
    `SELECT * FROM events ${clause} ORDER BY event_date ASC`,
    params
  );
  res.json(rows);
});

// POST /api/events
router.post("/", requireAuth, async (req, res) => {
  const { title, type, event_date, time_start, time_end, description, artist, image_url, status } = req.body;
  if (!title || !type || !event_date) {
    return res.status(400).json({ error: "Titre, type et date sont obligatoires" });
  }

  const { rows } = await db.query(
    `INSERT INTO events (title, type, event_date, time_start, time_end, description, artist, image_url, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [title, type, event_date, time_start || null, time_end || null, description || null, artist || null, image_url || null, status || "draft"]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/events/:id
router.put("/:id", requireAuth, async (req, res) => {
  const { title, type, event_date, time_start, time_end, description, artist, image_url, status } = req.body;
  const { rows } = await db.query(
    `UPDATE events SET title=$1, type=$2, event_date=$3, time_start=$4, time_end=$5,
     description=$6, artist=$7, image_url=$8, status=$9
     WHERE id=$10 RETURNING *`,
    [title, type, event_date, time_start || null, time_end || null, description || null, artist || null, image_url || null, status || "draft", req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Événement introuvable" });
  res.json(rows[0]);
});

// DELETE /api/events/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { rows } = await db.query("DELETE FROM events WHERE id=$1 RETURNING id", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Événement introuvable" });
  res.json({ deleted: true });
});

module.exports = router;

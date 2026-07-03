const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../../data/uploads/bilans");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Seuls les fichiers PDF sont acceptés"));
  },
});

// GET /api/bilans — liste publique
router.get("/", async (_req, res) => {
  const { rows } = await db.query("SELECT * FROM bilans ORDER BY year DESC");
  res.json(rows);
});

// GET /api/bilans/latest — dernier bilan
router.get("/latest", async (_req, res) => {
  const { rows } = await db.query("SELECT * FROM bilans ORDER BY year DESC LIMIT 1");
  res.json(rows[0] || null);
});

// POST /api/bilans — upload (admin)
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Fichier PDF requis" });
  const { year, title } = req.body;
  if (!year || !title) return res.status(400).json({ error: "year et title requis" });

  const fileUrl = `/uploads/bilans/${req.file.filename}`;
  const { rows } = await db.query(
    "INSERT INTO bilans (year, title, file_url) VALUES ($1, $2, $3) RETURNING *",
    [Number(year), title.trim(), fileUrl],
  );
  res.status(201).json(rows[0]);
});

// DELETE /api/bilans/:id — suppression (admin)
router.delete("/:id", requireAuth, async (req, res) => {
  const { rows: found } = await db.query("SELECT * FROM bilans WHERE id = $1", [req.params.id]);
  if (!found[0]) return res.status(404).json({ error: "Bilan introuvable" });

  const filePath = path.join(__dirname, "../../../data", found[0].file_url);
  try { fs.unlinkSync(filePath); } catch {}

  await db.query("DELETE FROM bilans WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;

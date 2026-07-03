const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const db      = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../../data/uploads/gallery");
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
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error("Seules les images sont acceptées (jpg, png, webp, gif)"));
  },
});

// GET /api/gallery — liste publique, ordre chronologique
router.get("/", async (_req, res) => {
  const { rows } = await db.query("SELECT * FROM gallery ORDER BY id ASC");
  res.json(rows);
});

// POST /api/gallery — upload (admin)
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image requise" });
  const fileUrl = `/uploads/gallery/${req.file.filename}`;
  const { rows } = await db.query(
    "INSERT INTO gallery (file_url) VALUES ($1) RETURNING *",
    [fileUrl],
  );
  res.status(201).json(rows[0]);
});

// DELETE /api/gallery/:id (admin)
router.delete("/:id", requireAuth, async (req, res) => {
  const { rows } = await db.query("SELECT file_url FROM gallery WHERE id=$1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Image introuvable" });

  const filePath = path.join(__dirname, "../../../data", rows[0].file_url);
  try { fs.unlinkSync(filePath); } catch {}

  await db.query("DELETE FROM gallery WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;

const express = require("express");
const multer  = require("multer");
const { parse } = require("csv-parse/sync");
const XLSX    = require("xlsx");
const db      = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/members — liste paginée avec recherche
router.get("/", requireAuth, async (req, res) => {
  const { search = "", status, page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let where  = [];
  let params = [];

  if (search) {
    where.push(`(
      LOWER(first_name) LIKE ? OR
      LOWER(last_name)  LIKE ? OR
      LOWER(email)      LIKE ?
    )`);
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  if (status === "paid") {
    where.push(`payment_status = 1`);
  } else if (status === "unpaid") {
    where.push(`payment_status = 0`);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows, total] = await Promise.all([
    db.query(
      `SELECT id, first_name, last_name, email, phone, payment_status, payment_date, consent, contact_email, contact_sms, created_at
       FROM members ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    ),
    db.query(`SELECT COUNT(*) AS count FROM members ${clause}`, params),
  ]);

  res.json({
    data:  rows.rows,
    total: Number(total.rows[0].count),
    page:  Number(page),
    limit: Number(limit),
  });
});

// GET /api/members/export — téléchargement CSV ou XLSX
router.get("/export", requireAuth, async (req, res) => {
  const fmt = req.query.format === "xlsx" ? "xlsx" : "csv";

  const { rows } = await db.query(
    `SELECT id, last_name, first_name, email, phone,
            payment_status, payment_date, consent, created_at
     FROM members ORDER BY last_name, first_name`
  );

  const data = rows.map((m) => ({
    "N° adhérent":      m.id,
    "Nom":              m.last_name,
    "Prénom":           m.first_name,
    "Email":            m.email,
    "Téléphone":        m.phone || "",
    "Cotisation payée": m.payment_status ? "Oui" : "Non",
    "Date paiement":    m.payment_date ? new Date(m.payment_date).toLocaleDateString("fr-FR") : "",
    "Consentement":     m.consent ? "Oui" : "Non",
    "Inscrit le":       new Date(m.created_at).toLocaleDateString("fr-FR"),
  }));

  if (fmt === "xlsx") {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Adhérents");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", `attachment; filename="adherents-tatina.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.send(buf);
  }

  const header = Object.keys(data[0] || {}).join(";");
  const lines  = data.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"));
  const csv    = [header, ...lines].join("\n");
  res.setHeader("Content-Disposition", `attachment; filename="adherents-tatina.csv"`);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.send("﻿" + csv);
});

// POST /api/members/import — import CSV ou XLSX en masse
router.post("/import", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier fourni" });

  let records = [];

  try {
    if (req.file.originalname.endsWith(".xlsx") || req.file.originalname.endsWith(".xls")) {
      const wb = XLSX.read(req.file.buffer, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      records  = XLSX.utils.sheet_to_json(ws);
    } else {
      records = parse(req.file.buffer, { columns: true, skip_empty_lines: true, delimiter: [",", ";"] });
    }
  } catch (err) {
    return res.status(400).json({ error: "Impossible de lire le fichier : " + err.message });
  }

  const colMap = (row) => ({
    first_name: row["Prénom"] || row["prenom"] || row["firstname"] || row["first_name"] || "",
    last_name:  row["Nom"]    || row["nom"]    || row["lastname"]  || row["last_name"]  || "",
    email:      row["Email"]  || row["email"]  || "",
    phone:      row["Téléphone"] || row["telephone"] || row["phone"] || "",
  });

  let inserted = 0;
  let skipped  = 0;
  const errors = [];

  for (const row of records) {
    const { first_name, last_name, email, phone } = colMap(row);
    if (!email || !first_name || !last_name) { skipped++; continue; }

    try {
      await db.query(
        `INSERT INTO members (first_name, last_name, email, phone)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [first_name.trim(), last_name.trim(), email.trim().toLowerCase(), phone?.trim() || null]
      );
      inserted++;
    } catch (err) {
      errors.push({ email, error: err.message });
      skipped++;
    }
  }

  res.json({ inserted, skipped, errors: errors.slice(0, 10) });
});

// POST /api/members — créer un adhérent manuellement
router.post("/", requireAuth, async (req, res) => {
  const { first_name, last_name, email, phone, consent, payment_status, contact_email, contact_sms } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: "Prénom, nom et email sont obligatoires" });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO members (first_name, last_name, email, phone, consent, payment_status, payment_date, contact_email, contact_sms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        first_name.trim(), last_name.trim(),
        email.trim().toLowerCase(), phone?.trim() || null,
        !!consent, !!payment_status,
        payment_status ? new Date().toISOString() : null,
        contact_email !== false ? 1 : 0,
        !!contact_sms ? 1 : 0,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "Email déjà utilisé" });
    console.error("POST /members:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/members/:id
router.get("/:id", requireAuth, async (req, res) => {
  const { rows } = await db.query("SELECT * FROM members WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Adhérent introuvable" });
  res.json(rows[0]);
});

// PATCH /api/members/:id — mise à jour générale
router.patch("/:id", requireAuth, async (req, res) => {
  const { first_name, last_name, email, phone, consent, notes, contact_email, contact_sms } = req.body;
  const { rows } = await db.query(
    `UPDATE members
     SET first_name=$1, last_name=$2, email=$3, phone=$4, consent=$5, notes=$6, contact_email=$7, contact_sms=$8
     WHERE id=$9
     RETURNING *`,
    [first_name, last_name, email?.toLowerCase(), phone || null, !!consent, notes || null,
     contact_email !== false ? 1 : 0, !!contact_sms ? 1 : 0,
     req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Adhérent introuvable" });
  res.json(rows[0]);
});

// PATCH /api/members/:id/payment — bascule statut paiement
router.patch("/:id/payment", requireAuth, async (req, res) => {
  const { rows: current } = await db.query("SELECT payment_status FROM members WHERE id = $1", [req.params.id]);
  if (!current.length) return res.status(404).json({ error: "Adhérent introuvable" });

  const newStatus = !current[0].payment_status;
  const { rows } = await db.query(
    `UPDATE members
     SET payment_status=$1, payment_date=$2
     WHERE id=$3
     RETURNING id, payment_status, payment_date`,
    [newStatus, newStatus ? new Date().toISOString() : null, req.params.id]
  );
  res.json(rows[0]);
});

// DELETE /api/members/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { rows } = await db.query("DELETE FROM members WHERE id=$1 RETURNING id", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Adhérent introuvable" });
  res.json({ deleted: true });
});

module.exports = router;

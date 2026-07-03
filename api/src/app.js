const express     = require("express");
const helmet      = require("helmet");
const cors        = require("cors");
const rateLimit   = require("express-rate-limit");
const path        = require("path");

const FRONT_DIR = path.join(__dirname, "../../");

const authRoutes         = require("./routes/auth");
const publicRoutes       = require("./routes/public");
const dashboardRoutes    = require("./routes/dashboard");
const membersRoutes      = require("./routes/members");
const eventsRoutes       = require("./routes/events");
const menuRoutes         = require("./routes/menu");
const settingsRoutes     = require("./routes/settings");
const associationsRoutes = require("./routes/associations");
const campaignsRoutes    = require("./routes/campaigns");
const bilansRoutes       = require("./routes/bilans");
const galleryRoutes      = require("./routes/gallery");

const app = express();

// Derrière un reverse proxy (Traefik / Ingress) : indispensable pour
// express-rate-limit qui lit l'IP réelle via X-Forwarded-For.
app.set("trust proxy", 1);

// ── Sécurité ────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:4000",   // Nuxt dev (script `dev`)
    "http://127.0.0.1:5500",   // Live Server VS Code
    "null",                     // fichiers ouverts localement
  ],
  credentials: true,
}));

// Rate limiting sur l'auth et les formulaires publics
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Trop de tentatives. Réessaie dans 15 minutes." },
});

const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: "Trop de soumissions. Réessaie dans une heure." },
});

// ── Parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/auth",         authLimiter,   authRoutes);
app.use("/api/public",       publicLimiter, publicRoutes);
app.use("/api/dashboard",                   dashboardRoutes);
app.use("/api/members",                     membersRoutes);
app.use("/api/events",                      eventsRoutes);
app.use("/api/menu",                        menuRoutes);
app.use("/api/settings",                    settingsRoutes);
app.use("/api/associations",                associationsRoutes);
app.use("/api/campaigns",                   campaignsRoutes);
app.use("/api/bilans",                      bilansRoutes);
app.use("/api/gallery",                     galleryRoutes);

// ── Health check ────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// ── Fichiers statiques du front ──────────────────────────────────
const DATA_DIR = path.join(__dirname, "../../data");
app.use("/uploads", (_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(DATA_DIR, "uploads")));
app.use(express.static(FRONT_DIR));

app.get("/admin", (req, res) => res.sendFile(path.join(FRONT_DIR, "admin", "index.html")));
app.get("/admin/*", (req, res) => res.sendFile(path.join(FRONT_DIR, "admin", "dashboard.html")));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(FRONT_DIR, "index.html"));
});

// ── 404 API ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route introuvable" }));

// ── Erreur globale ───────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

module.exports = app;

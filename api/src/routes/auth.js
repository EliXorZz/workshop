const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Identifiant et mot de passe requis" });
  }

  const expectedUser = process.env.ADMIN_USERNAME || "tatina";
  const expectedPass = process.env.ADMIN_PASSWORD || "jaune2022";

  const userOk = username === expectedUser;
  // bcrypt compare si le mot de passe stocké est hashé, sinon comparaison directe (dev)
  const isHashed = expectedPass.startsWith("$2");
  const passOk = isHashed
    ? await bcrypt.compare(password, expectedPass)
    : password === expectedPass;

  if (!userOk || !passOk) {
    return res.status(401).json({ error: "Identifiants incorrects" });
  }

  const token = jwt.sign(
    { username, role: "admin" },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

  res.json({ token, username });
});

// GET /api/auth/verify — vérifie que le token est encore valide
router.get("/verify", requireAuth, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

module.exports = router;

const fs   = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const { db } = require("../config/db");

function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  try {
    db.exec(sql);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }

  // Ajouts de colonnes idempotents (ignorés si déjà présents)
  const alterations = [
    "ALTER TABLE members ADD COLUMN contact_email INTEGER DEFAULT 1",
    "ALTER TABLE members ADD COLUMN contact_sms   INTEGER DEFAULT 0",
  ];
  for (const stmt of alterations) {
    try { db.exec(stmt); } catch {}
  }

  console.log("✅ Migration SQLite OK");
}

migrate();

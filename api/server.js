require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🍺 Bistrot de Tatina API — http://localhost:${PORT}`);
  console.log(`   Environnement : ${process.env.NODE_ENV || "development"}`);
  console.log(`   DB : SQLite — data/bistrot.db`);
  console.log(`   Brevo : ${process.env.BREVO_API_KEY?.startsWith("xkeysib-") ? "✅ configuré" : "⚠️  clé manquante"}`);
});

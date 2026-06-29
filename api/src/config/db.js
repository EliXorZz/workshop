const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "bistrot.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function prepareParams(params) {
  return (params || []).map((p) => {
    if (p === true) return 1;
    if (p === false) return 0;
    if (p instanceof Date) return p.toISOString();
    return p;
  });
}

function convertSql(sql) {
  sql = sql.replace(/\$\d+/g, "?");
  sql = sql.replace(/\bNOW\(\)/gi, "CURRENT_TIMESTAMP");
  sql = sql.replace(/\bILIKE\b/gi, "LIKE");
  return sql;
}

function getTableName(sql) {
  const m = sql.match(/(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+(\w+)/i);
  return m ? m[1] : null;
}

function query(sql, params = []) {
  const returning = sql.match(/\s+RETURNING\s+.+?$/si);
  const hasReturn = !!returning;
  const cleanSql = convertSql(hasReturn ? sql.replace(/\s+RETURNING\s+.+?$/si, "") : sql).trim();
  const p = prepareParams(params);
  const upper = cleanSql.trimStart().toUpperCase();

  try {
    if (upper.startsWith("SELECT") || upper.startsWith("WITH") || upper.startsWith("PRAGMA")) {
      const rows = db.prepare(cleanSql).all(...p);
      return Promise.resolve({ rows });
    }

    if (upper.startsWith("INSERT") && hasReturn) {
      const table = getTableName(cleanSql);
      const result = db.prepare(cleanSql).run(...p);
      if (table && result.lastInsertRowid) {
        const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid);
        return Promise.resolve({ rows: row ? [row] : [] });
      }
      return Promise.resolve({ rows: [] });
    }

    if (upper.startsWith("UPDATE") && hasReturn) {
      const table = getTableName(cleanSql);
      const result = db.prepare(cleanSql).run(...p);
      if (result.changes > 0 && table) {
        const rowId = p[p.length - 1];
        const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(rowId);
        return Promise.resolve({ rows: row ? [row] : [] });
      }
      return Promise.resolve({ rows: [] });
    }

    if (upper.startsWith("DELETE") && hasReturn) {
      const result = db.prepare(cleanSql).run(...p);
      if (result.changes > 0) {
        const deletedId = p[p.length - 1];
        return Promise.resolve({ rows: [{ id: deletedId }] });
      }
      return Promise.resolve({ rows: [] });
    }

    const result = db.prepare(cleanSql).run(...p);
    return Promise.resolve({ rows: [], changes: result.changes });
  } catch (err) {
    return Promise.reject(err);
  }
}

module.exports = { query, db };

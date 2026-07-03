const express = require("express");
const db      = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/dashboard
router.get("/", requireAuth, async (req, res) => {
  try {
    const [membersStats, eventsCount, pendingRequests, membershipSetting] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*)                                                                  AS total,
          SUM(CASE WHEN payment_status = 1 THEN 1 ELSE 0 END)                     AS paid,
          SUM(CASE WHEN created_at >= strftime('%Y-%m-01','now') THEN 1 ELSE 0 END) AS new_this_month
        FROM members
      `),
      db.query(`
        SELECT
          SUM(CASE WHEN status = 'published' AND event_date >= date('now') THEN 1 ELSE 0 END) AS upcoming,
          SUM(CASE WHEN type = 'concert' AND status = 'published' AND event_date >= date('now') THEN 1 ELSE 0 END) AS concerts
        FROM events
      `),
      db.query(`SELECT COUNT(*) AS count FROM contact_requests WHERE status = 'pending'`),
      db.query(`SELECT value FROM settings WHERE key = 'membership_price'`),
    ]);

    const m = membersStats.rows[0];
    const e = eventsCount.rows[0];
    const r = pendingRequests.rows[0];
    const rawPrice = membershipSetting.rows[0]?.value;
    const membershipPrice = Number(rawPrice) > 0 ? Number(rawPrice) : 15;

    const upcomingEvents = await db.query(`
      SELECT id, title, type, event_date, status
      FROM events
      WHERE event_date >= date('now')
      ORDER BY event_date ASC
      LIMIT 8
    `);

    res.json({
      members: {
        total:     Number(m.total)         || 0,
        paid:      Number(m.paid)          || 0,
        new_month: Number(m.new_this_month) || 0,
      },
      events: {
        upcoming: Number(e.upcoming) || 0,
        concerts: Number(e.concerts) || 0,
      },
      pending_requests:  Number(r.count) || 0,
      membership_price:  membershipPrice,
      upcoming_events:   upcomingEvents.rows,
    });
  } catch (err) {
    console.error("GET /dashboard:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

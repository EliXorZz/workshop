-- ============================================================
--  Bistrot de Tatina — Schéma SQLite
-- ============================================================

CREATE TABLE IF NOT EXISTS members (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  payment_status  INTEGER DEFAULT 0,
  payment_date    TEXT,
  consent         INTEGER DEFAULT 0,
  brevo_contact_id TEXT,
  notes           TEXT,
  created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_members_email      ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_payment    ON members(payment_status);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at DESC);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('concert','djset','foodtruck','horlesmurs','autre')),
  event_date  TEXT NOT NULL,
  time_start  TEXT,
  time_end    TEXT,
  description TEXT,
  artist      TEXT,
  image_url   TEXT,
  status      TEXT DEFAULT 'draft' CHECK (status IN ('published','draft','cancelled')),
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_date   ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE TABLE IF NOT EXISTS menu_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  category   TEXT NOT NULL,
  label      TEXT NOT NULL,
  price      TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('hours_lundi',    'Fermé'),
  ('hours_mardi',    'Fermé'),
  ('hours_mercredi', 'Fermé'),
  ('hours_jeudi',    '18h → 00h'),
  ('hours_vendredi', '18h → 01h'),
  ('hours_samedi',   'Événements ponctuels'),
  ('hours_dimanche', 'Fermé'),
  ('contact_address','Rue des Soudeurs, 74000 Annecy'),
  ('contact_phone',  '04 50 00 00 00'),
  ('contact_email',  'bonjour@bistrot-tatina.fr'),
  ('toggle_transparency', 'true'),
  ('toggle_adhesion',     'true'),
  ('toggle_concerts',     'true'),
  ('toggle_agenda',       'true'),
  ('toggle_fermeture',    'false'),
  ('social_instagram',    ''),
  ('social_facebook',     '');

CREATE TABLE IF NOT EXISTS associations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT,
  amount_2026 REAL DEFAULT 0,
  website_url TEXT,
  logo_url    TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT DEFAULT 'concert',
  name       TEXT,
  email      TEXT,
  phone      TEXT,
  message    TEXT,
  status     TEXT DEFAULT 'pending' CHECK (status IN ('pending','replied','archived')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  channel           TEXT NOT NULL CHECK (channel IN ('email','sms','both')),
  subject           TEXT,
  body              TEXT NOT NULL,
  target            TEXT DEFAULT 'all',
  status            TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','failed')),
  brevo_campaign_id TEXT,
  recipient_count   INTEGER DEFAULT 0,
  sent_at           TEXT,
  created_at        TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bilans (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  year       INTEGER NOT NULL,
  title      TEXT NOT NULL,
  file_url   TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bilans_year ON bilans(year DESC);

-- Triggers updated_at
CREATE TRIGGER IF NOT EXISTS trg_members_updated_at
AFTER UPDATE ON members
FOR EACH ROW
BEGIN
  UPDATE members SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_events_updated_at
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
  UPDATE events SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

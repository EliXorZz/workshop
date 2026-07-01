---
name: project-bistrot-tatina
description: Contexte du projet Bistrot de Tatina — stack, architecture, décisions clés
metadata:
  type: project
---

Projet "Le Bistrot de Tatina" — site associatif bar à Annecy.

**Architecture :**
- `api/` — Express.js API (port 3001), SQLite via better-sqlite3, Brevo pour les emails
- `frontend/` — Nuxt 3 (migré depuis HTML/CSS/JS vanilla en juillet 2026), port 3000

**Why:** Migration de `index.html` + `assets/` vers Nuxt 3 pour avoir un vrai framework Vue avec composants, réactivité et SSR.

**How to apply:** L'ancien front vanilla (`index.html`, `assets/`) est toujours présent à la racine mais n'est plus le front principal. Le front actif est `frontend/`.

**Démarrer le projet :**
- API : `cd api && npm run dev` → port 3001
- Frontend Nuxt : `cd frontend && npm run dev` → port 3000

**Sections du site (composants Vue) :**
- `HeroSection` — portes container animées
- `ManifestSection` — texte manifeste statique
- `StorySection` — compteurs animés + membre count depuis API
- `AgendaSection` — agenda filtrable depuis `/api/events`
- `MenuSection` — ardoise depuis `/api/menu`
- `ConcertSection` — formulaire de demande de concert → `/api/public/concert-request`
- `InfosSection` — horaires/contact depuis `/api/settings`
- `AssosSection` — associations depuis `/api/associations`
- `PartnersSection` — marquee statique
- `AdhesionSection` — formulaire pré-adhésion → `/api/public/preadmission`

**CORS API :** `http://localhost:3000` déjà whitelisté dans `api/src/app.js`.

/* =============================================
   TATINA ADMIN — Dashboard JS
   ============================================= */

const API = "http://localhost:3001/api";

// ── Auth ──────────────────────────────────────────────────────────
const token = sessionStorage.getItem("tatina_token");
if (!token) location.href = "index.html";

// Affiche le nom d'utilisateur réel (depuis le JWT)
try {
  const payload = JSON.parse(atob(token.split(".")[1]));
  const u = payload.username || "admin";
  const lbl = document.getElementById("adminUserLabel"); if (lbl) lbl.textContent = u;
  const fld = document.getElementById("accountUserField"); if (fld) fld.value = u;
} catch {}

function authHeaders() {
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
  if (res.status === 401) { sessionStorage.removeItem("tatina_token"); location.href = "index.html"; }
  return res;
}

// ── Toast ──────────────────────────────────────────────────────────
const toastEl = document.getElementById("toast");
function showToast(msg, isErr = false) {
  toastEl.textContent = msg;
  toastEl.style.background = isErr ? "var(--rust, #c0392b)" : "";
  toastEl.classList.add("is-visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("is-visible"), 3000);
}

// ── Navigation tabs ────────────────────────────────────────────────
const navLinks = document.querySelectorAll(".admin-nav a");
const sections = document.querySelectorAll(".admin-section");

function goTo(target) {
  navLinks.forEach((x) => x.classList.toggle("is-active", x.dataset.target === target));
  sections.forEach((s) => s.classList.toggle("is-active", s.dataset.section === target));
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (target === "dashboard")  loadDashboard();
  if (target === "adherents")  loadMembers();
  if (target === "agenda")     loadEvents();
  if (target === "menu")       loadMenu();
  if (target === "horaires")   loadSettings();
  if (target === "assos")      loadAssos();
  if (target === "campagnes")  loadCampaigns();
}

navLinks.forEach((a) => a.addEventListener("click", () => goTo(a.dataset.target)));

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("tatina_token");
  location.href = "index.html";
});

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const res  = await apiFetch("/dashboard");
    const data = await res.json();
    if (!res.ok) return;

    const setKpi = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
    setKpi("[data-kpi='members']",  data.members.total);
    setKpi("[data-kpi='paid']",     data.members.paid);
    setKpi("[data-kpi='events']",   data.events.upcoming);
    setKpi("[data-kpi='requests']", data.pending_requests);

    // Injecte les événements à venir dans le tableau
    const tbody = document.querySelector("[data-dashboard-events]");
    if (tbody && data.upcoming_events) {
      tbody.innerHTML = data.upcoming_events.map((ev) => `
        <tr>
          <td>${formatDate(ev.event_date)}</td>
          <td>${ev.title}</td>
          <td><span class="badge badge--${statusColor(ev.status)}">${statusLabel(ev.status)}</span></td>
        </tr>
      `).join("");
    }
  } catch (err) {
    console.error("loadDashboard:", err);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  ADHÉRENTS
// ═══════════════════════════════════════════════════════════════════
let memberSearch = "";
let memberStatus = "";

async function loadMembers() {
  const params = new URLSearchParams({ search: memberSearch, status: memberStatus, limit: 100 });
  try {
    const res  = await apiFetch(`/members?${params}`);
    const data = await res.json();
    if (!res.ok) return;

    const tbody = document.querySelector("[data-members-list]");
    if (!tbody) return;

    // Compteur
    document.querySelector("[data-members-count]").textContent = `${data.total} adhérent${data.total > 1 ? "s" : ""}`;

    tbody.innerHTML = data.data.map((m) => `
      <tr data-member-id="${m.id}">
        <td>${m.id}</td>
        <td><strong>${m.last_name} ${m.first_name}</strong></td>
        <td>${m.email}</td>
        <td>${m.phone || "—"}</td>
        <td>
          <button class="toggle-payment ${m.payment_status ? "is-paid" : ""}"
                  data-id="${m.id}" data-paid="${m.payment_status}"
                  title="${m.payment_status ? "Cotisation payée — cliquer pour annuler" : "Marquer comme payé"}">
            ${m.payment_status ? "✓ Payé" : "Non payé"}
          </button>
        </td>
        <td>
          <span class="badge ${m.payment_status ? "badge--ok" : "badge--alert"}">
            ${m.payment_status ? "Actif" : "À renouveler"}
          </span>
        </td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" data-action="edit-member" data-id="${m.id}" title="Éditer">✎</button>
            <button class="icon-btn icon-btn--danger" data-action="delete-member" data-id="${m.id}" title="Supprimer">✕</button>
          </div>
        </td>
      </tr>
    `).join("");

    // Toggle paiement
    tbody.querySelectorAll(".toggle-payment").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const res = await apiFetch(`/members/${id}/payment`, { method: "PATCH" });
        const updated = await res.json();
        if (res.ok) {
          btn.textContent       = updated.payment_status ? "✓ Payé" : "Non payé";
          btn.dataset.paid      = updated.payment_status;
          btn.classList.toggle("is-paid", updated.payment_status);
          const row  = btn.closest("tr");
          const badge = row.querySelector(".badge");
          badge.className = `badge ${updated.payment_status ? "badge--ok" : "badge--alert"}`;
          badge.textContent = updated.payment_status ? "Actif" : "À renouveler";
          showToast(updated.payment_status ? "Cotisation validée." : "Paiement retiré.");
        }
      });
    });

    // Supprimer
    tbody.querySelectorAll("[data-action='delete-member']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!await showConfirm("Supprimer cet adhérent ? L'opération est irréversible.", true)) return;
        const res = await apiFetch(`/members/${btn.dataset.id}`, { method: "DELETE" });
        if (res.ok) { btn.closest("tr").remove(); showToast("Adhérent supprimé."); }
      });
    });

    // Éditer
    tbody.querySelectorAll("[data-action='edit-member']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const res = await apiFetch(`/members/${btn.dataset.id}`);
        if (!res.ok) return;
        openMemberModal(await res.json());
      });
    });

  } catch (err) {
    console.error("loadMembers:", err);
  }
}

// Recherche adhérents
document.querySelector("[data-members-search]")?.addEventListener("input", (e) => {
  memberSearch = e.target.value;
  loadMembers();
});
document.querySelector("[data-members-status]")?.addEventListener("change", (e) => {
  memberStatus = e.target.value;
  loadMembers();
});

// Export (utilise fetch + blob pour conserver le header Auth)
async function downloadExport(format) {
  const res = await apiFetch(`/members/export?format=${format}`);
  if (!res.ok) { showToast("Erreur export", true); return; }
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `adherents-tatina.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}
document.querySelector("[data-export-csv]")?.addEventListener("click", () => downloadExport("csv"));
document.querySelector("[data-export-xlsx]")?.addEventListener("click", () => downloadExport("xlsx"));

// Import CSV/XLSX
const importInput = document.querySelector("[data-import-file]");
importInput?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("file", file);
  const res  = await fetch(`${API}/members/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json();
  if (res.ok) {
    showToast(`Import : ${data.inserted} insérés, ${data.skipped} ignorés.`);
    loadMembers();
  } else {
    showToast(data.error || "Erreur import", true);
  }
  importInput.value = "";
});

// ═══════════════════════════════════════════════════════════════════
//  AGENDA
// ═══════════════════════════════════════════════════════════════════
async function loadEvents() {
  const res  = await apiFetch("/events");
  const rows = await res.json();
  if (!res.ok) return;

  const tbody = document.querySelector("[data-events-list]");
  if (!tbody) return;

  tbody.innerHTML = rows.map((ev) => `
    <tr>
      <td>${formatDate(ev.event_date)}</td>
      <td><strong>${ev.title}</strong>${ev.artist ? `<br/><small>${ev.artist}</small>` : ""}</td>
      <td><span class="badge ${typeColor(ev.type)}">${ev.type}</span></td>
      <td><span class="badge ${statusColor(ev.status) === "ok" ? "badge--ok" : "badge--draft"}">${statusLabel(ev.status)}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" data-action="edit-event" data-id="${ev.id}" title="Éditer">✎</button>
          <button class="icon-btn icon-btn--danger" data-action="delete-event" data-id="${ev.id}" title="Supprimer">✕</button>
        </div>
      </td>
    </tr>
  `).join("");

  const evById = new Map(rows.map(ev => [String(ev.id), ev]));

  tbody.querySelectorAll("[data-action='delete-event']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!await showConfirm("Supprimer cet événement ?", true)) return;
      const r = await apiFetch(`/events/${btn.dataset.id}`, { method: "DELETE" });
      if (r.ok) { btn.closest("tr").remove(); showToast("Événement supprimé."); }
    });
  });

  tbody.querySelectorAll("[data-action='edit-event']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ev = evById.get(String(btn.dataset.id));
      if (ev) openEventModal(ev);
    });
  });
}

// Nouvel événement / édit via modal simple
document.querySelector("[data-new-event]")?.addEventListener("click", () => openEventModal(null));

function openEventModal(ev) {
  const existing = document.getElementById("eventModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "eventModal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card">
      <h3>${ev ? "Modifier l'événement" : "Nouvel événement"}</h3>
      <form id="eventForm" class="form" style="background:transparent;border:0;box-shadow:none;padding:0;">
        <div class="field-row">
          <div class="field"><label>Titre</label><input name="title" required value="${ev?.title || ""}" /></div>
          <div class="field"><label>Artiste / nom</label><input name="artist" value="${ev?.artist || ""}" /></div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Type</label>
            <select name="type">
              ${["concert","djset","foodtruck","horlesmurs","autre"].map((t) =>
                `<option value="${t}" ${ev?.type === t ? "selected" : ""}>${t}</option>`
              ).join("")}
            </select>
          </div>
          <div class="field">
            <label>Statut</label>
            <select name="status">
              <option value="draft" ${ev?.status === "draft" ? "selected" : ""}>Brouillon</option>
              <option value="published" ${ev?.status === "published" ? "selected" : ""}>Publié</option>
              <option value="cancelled" ${ev?.status === "cancelled" ? "selected" : ""}>Annulé</option>
            </select>
          </div>
        </div>
        <div class="field-row">
          <div class="field"><label>Date</label><input type="date" name="event_date" required value="${ev?.event_date?.split("T")[0] || ""}" /></div>
          <div class="field"><label>Heure début</label><input type="time" name="time_start" value="${ev?.time_start || ""}" /></div>
        </div>
        <div class="field"><label>Description</label><textarea name="description" rows="3">${ev?.description || ""}</textarea></div>
        <div style="display:flex;gap:10px;margin-top:10px;">
          <button type="button" class="btn btn--ghost" id="cancelEventModal">Annuler</button>
          <button type="submit" class="btn btn--yellow">${ev ? "Enregistrer" : "Créer"}</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("cancelEventModal").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });

  document.getElementById("eventForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd   = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    const method = ev ? "PUT" : "POST";
    const path   = ev ? `/events/${ev.id}` : "/events";
    const res    = await apiFetch(path, { method, body: JSON.stringify(body) });
    if (res.ok) {
      modal.remove();
      showToast(ev ? "Événement mis à jour." : "Événement créé.");
      loadEvents();
    } else {
      const d = await res.json();
      showToast(d.error || "Erreur", true);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
//  MENU
// ═══════════════════════════════════════════════════════════════════
async function loadMenu() {
  const res  = await apiFetch("/menu");
  const data = await res.json();
  if (!res.ok) return;

  const container = document.querySelector("[data-menu-sections]");
  if (!container) return;

  container.innerHTML = Object.entries(data).map(([cat, items]) => `
    <div class="panel">
      <h3>${cat}</h3>
      <table>
        <thead><tr><th>Intitulé</th><th>Prix</th><th>Actions</th></tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${item.label}</td>
              <td>${item.price}</td>
              <td><div class="row-actions">
                <button class="icon-btn" data-action="delete-menu" data-id="${item.id}" title="Supprimer">✕</button>
              </div></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `).join("");

  container.querySelectorAll("[data-action='delete-menu']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!await showConfirm("Supprimer ce plat ?", true)) return;
      const r = await apiFetch(`/menu/${btn.dataset.id}`, { method: "DELETE" });
      if (r.ok) { btn.closest("tr").remove(); showToast("Plat supprimé."); }
    });
  });
}

document.querySelector("[data-new-menu-item]")?.addEventListener("click", () => openMenuModal());

// ═══════════════════════════════════════════════════════════════════
//  HORAIRES & PARAMÈTRES
// ═══════════════════════════════════════════════════════════════════
async function loadSettings() {
  const res  = await apiFetch("/settings");
  const data = await res.json();
  if (!res.ok) return;

  // Horaires
  ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"].forEach((j) => {
    const inp = document.querySelector(`[data-hours="${j}"]`);
    if (inp) inp.value = data[`hours_${j}`] || "";
  });

  // Coordonnées
  const fields = ["contact_address","contact_phone","contact_email"];
  fields.forEach((k) => {
    const inp = document.querySelector(`[data-setting="${k}"]`);
    if (inp) inp.value = data[k] || "";
  });

  // Toggles
  document.querySelectorAll("[data-toggle]").forEach((cb) => {
    cb.checked = data[`toggle_${cb.dataset.toggle}`] === "true";
  });
}

document.querySelector("[data-save-settings]")?.addEventListener("click", async () => {
  const body = {};
  ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"].forEach((j) => {
    const inp = document.querySelector(`[data-hours="${j}"]`);
    if (inp) body[`hours_${j}`] = inp.value;
  });
  ["contact_address","contact_phone","contact_email"].forEach((k) => {
    const inp = document.querySelector(`[data-setting="${k}"]`);
    if (inp) body[k] = inp.value;
  });
  document.querySelectorAll("[data-toggle]").forEach((cb) => {
    body[`toggle_${cb.dataset.toggle}`] = String(cb.checked);
  });

  const res = await apiFetch("/settings", { method: "PATCH", body: JSON.stringify(body) });
  if (res.ok) showToast("Paramètres enregistrés."); else showToast("Erreur enregistrement.", true);
});

// ═══════════════════════════════════════════════════════════════════
//  ASSOCIATIONS
// ═══════════════════════════════════════════════════════════════════
async function loadAssos() {
  const res  = await apiFetch("/associations");
  const rows = await res.json();
  if (!res.ok) return;

  const tbody = document.querySelector("[data-assos-list]");
  if (!tbody) return;

  tbody.innerHTML = rows.map((a) => `
    <tr>
      <td><strong>${a.name}</strong></td>
      <td>${Number(a.amount_2026).toLocaleString("fr-FR")} €</td>
      <td>${a.website_url ? `<a href="${a.website_url}" target="_blank">${a.website_url}</a>` : "—"}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn icon-btn--danger" data-action="delete-asso" data-id="${a.id}" title="Supprimer">✕</button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-action='delete-asso']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!await showConfirm("Supprimer cette asso ?", true)) return;
      const r = await apiFetch(`/associations/${btn.dataset.id}`, { method: "DELETE" });
      if (r.ok) { btn.closest("tr").remove(); showToast("Association supprimée."); }
    });
  });
}

document.querySelector("[data-new-asso]")?.addEventListener("click", () => openAssoModal());

// ═══════════════════════════════════════════════════════════════════
//  CAMPAGNES
// ═══════════════════════════════════════════════════════════════════
async function loadCampaigns() {
  const res  = await apiFetch("/campaigns");
  const rows = await res.json();
  if (!res.ok) return;

  const tbody = document.querySelector("[data-campaigns-list]");
  if (!tbody) return;

  tbody.innerHTML = rows.map((c) => `
    <tr>
      <td>${c.sent_at ? new Date(c.sent_at).toLocaleDateString("fr-FR") : "—"}</td>
      <td><span class="badge ${c.channel === "email" ? "badge--yellow" : ""}">${c.channel.toUpperCase()}</span></td>
      <td>${c.subject || c.body.substring(0, 40) + "…"}</td>
      <td>${c.recipient_count}</td>
      <td><span class="badge ${c.status === "sent" ? "badge--ok" : c.status === "failed" ? "badge--alert" : "badge--draft"}">${c.status}</span></td>
    </tr>
  `).join("");
}

// Envoi campagne
document.getElementById("campaignForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn  = e.target.querySelector("button[type='submit']");
  const orig = btn.innerHTML;
  btn.innerHTML = "Envoi en cours…";
  btn.disabled  = true;

  const res = await apiFetch("/campaigns", {
    method: "POST",
    body: JSON.stringify({
      channel: document.getElementById("cChannel")?.value,
      subject: document.getElementById("cSubject")?.value,
      body:    document.getElementById("cBody")?.value,
      target:  document.getElementById("cTarget")?.value || "all",
    }),
  });

  const data = await res.json();
  btn.innerHTML = orig;
  btn.disabled  = false;

  if (res.ok) {
    showToast(`Campagne envoyée à ${data.recipient_count} destinataires.`);
    loadCampaigns();
  } else {
    showToast(data.error || "Erreur envoi", true);
  }
});

// Preview live
const cSubject = document.getElementById("cSubject");
const cBody    = document.getElementById("cBody");
const pSubject = document.getElementById("pSubject");
const pBody    = document.getElementById("pBody");
cSubject?.addEventListener("input", () => { if (pSubject) pSubject.textContent = cSubject.value; });
cBody?.addEventListener("input",    () => { if (pBody)    pBody.textContent    = cBody.value; });

document.querySelector("[data-new-member]")?.addEventListener("click", () => openMemberModal(null));

// ─── Utilitaires ────────────────────────────────────────────────
function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function statusLabel(s) {
  return { published: "Publié", draft: "Brouillon", cancelled: "Annulé" }[s] || s;
}
function statusColor(s) {
  return { published: "ok", draft: "draft", cancelled: "alert" }[s] || "";
}
function typeColor(t) {
  return t === "concert" ? "" : t === "djset" ? "badge--yellow" : "";
}

// ═══════════════════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════════════════

function showConfirm(msg, danger = false) {
  return new Promise((resolve) => {
    const modal  = document.getElementById("confirmModal");
    const okBtn  = document.getElementById("confirmOk");
    const canBtn = document.getElementById("confirmCancel");
    document.getElementById("confirmMsg").textContent = msg;
    okBtn.className = danger ? "btn btn--danger" : "btn btn--yellow";
    modal.hidden = false;

    const done = (val) => {
      modal.hidden = true;
      okBtn.removeEventListener("click", onOk);
      canBtn.removeEventListener("click", onCan);
      modal.removeEventListener("click", onOver);
      resolve(val);
    };
    const onOk   = () => done(true);
    const onCan  = () => done(false);
    const onOver = (e) => { if (e.target === modal) done(false); };
    okBtn.addEventListener("click", onOk);
    canBtn.addEventListener("click", onCan);
    modal.addEventListener("click", onOver);
  });
}

function openMemberModal(member = null) {
  const modal = document.getElementById("memberModal");
  const form  = document.getElementById("memberForm");
  document.getElementById("memberModalTitle").textContent  = member ? "Modifier l'adhérent" : "Nouvel adhérent";
  document.getElementById("memberModalSubmit").textContent = member ? "Enregistrer" : "Créer";
  form.reset();
  if (member) {
    form.first_name.value       = member.first_name || "";
    form.last_name.value        = member.last_name  || "";
    form.email.value            = member.email      || "";
    form.phone.value            = member.phone      || "";
    form.consent.checked        = !!member.consent;
    form.payment_status.checked = !!member.payment_status;
  }
  modal.hidden = false;

  const close = () => { modal.hidden = true; };
  document.getElementById("memberModalCancel").onclick = close;
  modal.onclick = (e) => { if (e.target === modal) close(); };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const body = {
      first_name: form.first_name.value.trim(),
      last_name:  form.last_name.value.trim(),
      email:      form.email.value.trim(),
      phone:      form.phone.value.trim() || null,
      consent:    form.consent.checked,
    };
    let res;
    if (member) {
      res = await apiFetch(`/members/${member.id}`, { method: "PATCH", body: JSON.stringify(body) });
      if (res.ok && form.payment_status.checked !== !!member.payment_status) {
        await apiFetch(`/members/${member.id}/payment`, { method: "PATCH" });
      }
    } else {
      res = await apiFetch("/members", { method: "POST", body: JSON.stringify({ ...body, payment_status: form.payment_status.checked }) });
    }
    if (res.ok) {
      close();
      showToast(member ? "Adhérent mis à jour." : "Adhérent créé.");
      loadMembers();
    } else {
      const d = await res.json();
      showToast(d.error || "Erreur", true);
    }
  };
}

function openMenuModal() {
  const modal = document.getElementById("menuModal");
  const form  = document.getElementById("menuForm");
  form.reset();
  modal.hidden = false;
  document.getElementById("menuModalCancel").onclick = () => { modal.hidden = true; };
  modal.onclick = (e) => { if (e.target === modal) modal.hidden = true; };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd  = new FormData(form);
    const res = await apiFetch("/menu", {
      method: "POST",
      body: JSON.stringify({ category: fd.get("category"), label: fd.get("label"), price: fd.get("price") }),
    });
    if (res.ok) { modal.hidden = true; showToast("Plat ajouté."); loadMenu(); }
    else { const d = await res.json(); showToast(d.error || "Erreur", true); }
  };
}

function openAssoModal() {
  const modal = document.getElementById("assoModal");
  const form  = document.getElementById("assoForm");
  form.reset();
  modal.hidden = false;
  document.getElementById("assoModalCancel").onclick = () => { modal.hidden = true; };
  modal.onclick = (e) => { if (e.target === modal) modal.hidden = true; };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd  = new FormData(form);
    const res = await apiFetch("/associations", {
      method: "POST",
      body: JSON.stringify({
        name:        fd.get("name"),
        description: fd.get("description") || null,
        amount_2026: Number(fd.get("amount_2026")) || 0,
        website_url: fd.get("website_url") || null,
      }),
    });
    if (res.ok) { modal.hidden = true; showToast("Association ajoutée."); loadAssos(); }
    else { const d = await res.json(); showToast(d.error || "Erreur", true); }
  };
}

// ─── Démarrage ───────────────────────────────────────────────────
goTo("dashboard");

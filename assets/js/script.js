/* =============================================
   LE BISTROT DE TATINA — Interactions
   ============================================= */

const API_BASE = "http://localhost:3001/api";

document.documentElement.classList.add("js");

/* ---------- 1. Ouverture des portes du container au chargement ---------- */
window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    document.body.classList.add("is-loaded");
  });
});

/* ---------- 2. Scroll reveal (IntersectionObserver) ---------- */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-revealed");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
revealEls.forEach((el) => io.observe(el));

/* ---------- 3. Counters (animation des chiffres) ---------- */
const counters = document.querySelectorAll(".counter");
const counterIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
counters.forEach((c) => counterIO.observe(c));

function animateCount(el) {
  const to = Number(el.dataset.to || 0);
  const decimals = Number(el.dataset.decimals || 0);
  const duration = 1600;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const p = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - p, 3);
    const value = to * ease;
    el.textContent = decimals === 0
      ? Math.floor(value).toLocaleString("fr-FR")
      : value.toFixed(decimals).replace(".", ",");
    if (p < 1) requestAnimationFrame(step);
    else {
      el.textContent = decimals === 0
        ? to.toLocaleString("fr-FR").replace(/\s/g, "")
        : to.toFixed(decimals).replace(".", ",");
    }
  }
  requestAnimationFrame(step);
}

/* ---------- 4. Filtres de l'agenda ---------- */
const chips = document.querySelectorAll(".agenda__filters .chip");
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    const f = chip.dataset.filter;
    document.querySelectorAll("#agendaList .event").forEach((ev) => {
      const match = f === "all" || ev.dataset.type === f;
      ev.classList.toggle("is-hidden", !match);
    });
  });
});

/* ---------- 5. Carte d'adhérent live (nom + n° aléatoire) ---------- */
const cardName = document.getElementById("cardName");
const cardNum = document.getElementById("cardNum");
const aFirst = document.getElementById("aFirst");
const aLast = document.getElementById("aLast");

function genCardNumber() {
  const a = String(Math.floor(Math.random() * 900) + 100);
  const b = String(Math.floor(Math.random() * 900) + 100);
  return `${a}·${b}`;
}
if (cardNum) cardNum.textContent = genCardNumber();

function updateCard() {
  const first = (aFirst?.value || "").trim();
  const last = (aLast?.value || "").trim().toUpperCase();
  if (!first && !last) {
    cardName.textContent = "Votre nom";
  } else {
    cardName.textContent = `${first} ${last}`.trim();
  }
}
[aFirst, aLast].forEach((i) => {
  if (i) i.addEventListener("input", updateCard);
});

/* ---------- 6. Toast ---------- */
const toast = document.getElementById("toast");
function showToast(msg, isErr = false) {
  toast.textContent = msg;
  toast.classList.add("is-visible");
  toast.style.background = isErr ? "var(--rust, #c0392b)" : "";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("is-visible"), 3500);
}

/* ---------- 7. Formulaire pré-adhésion → API ---------- */
const adhesionForm = document.getElementById("adhesionForm");
if (adhesionForm) {
  adhesionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!adhesionForm.checkValidity()) { adhesionForm.reportValidity(); return; }

    const btn = adhesionForm.querySelector("button[type='submit']");
    const feedback = adhesionForm.querySelector("[data-form-feedback]");
    const original = btn.innerHTML;
    btn.innerHTML = "Envoi…";
    btn.disabled = true;

    const data = {
      first_name: document.getElementById("aFirst")?.value?.trim(),
      last_name:  document.getElementById("aLast")?.value?.trim(),
      email:      document.getElementById("aEmail")?.value?.trim(),
      phone:      document.getElementById("aPhone")?.value?.trim(),
      consent:    document.getElementById("aConsent")?.checked ?? false,
    };

    try {
      const res = await fetch(`${API_BASE}/public/preadmission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok) {
        btn.innerHTML = "✓ Bien reçu";
        if (feedback) { feedback.textContent = json.message; feedback.classList.add("is-ok"); }
        showToast("Pré-adhésion enregistrée — rendez-vous à la porte jaune !");
        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
          adhesionForm.reset();
          if (cardName) cardName.textContent = "Votre nom";
          if (cardNum)  cardNum.textContent = genCardNumber();
        }, 2400);
      } else {
        btn.innerHTML = original;
        btn.disabled = false;
        const msg = json.error || "Une erreur est survenue.";
        if (feedback) { feedback.textContent = msg; feedback.classList.add("is-err"); }
        showToast(msg, true);
      }
    } catch {
      btn.innerHTML = original;
      btn.disabled = false;
      showToast("Impossible de contacter le serveur.", true);
    }
  });
}

/* ---------- 8. Formulaire concert → API ---------- */
const concertForm = document.getElementById("concertForm");
if (concertForm) {
  concertForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!concertForm.checkValidity()) { concertForm.reportValidity(); return; }

    const btn = concertForm.querySelector("button[type='submit']");
    const feedback = concertForm.querySelector("[data-form-feedback]");
    const original = btn.innerHTML;
    btn.innerHTML = "Envoi…";
    btn.disabled = true;

    const formData = new FormData(concertForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_BASE}/public/concert-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok) {
        btn.innerHTML = "✓ Envoyé";
        if (feedback) { feedback.textContent = json.message; feedback.classList.add("is-ok"); }
        showToast("Demande envoyée. On revient vers toi sous 7 jours.");
        setTimeout(() => { btn.innerHTML = original; btn.disabled = false; concertForm.reset(); }, 2400);
      } else {
        btn.innerHTML = original;
        btn.disabled = false;
        showToast(json.error || "Une erreur est survenue.", true);
      }
    } catch {
      btn.innerHTML = original;
      btn.disabled = false;
      showToast("Impossible de contacter le serveur.", true);
    }
  });
}

/* ---------- 9. Menu burger mobile ---------- */
const burger = document.querySelector(".nav__burger");
const navLinks = document.querySelector(".nav__links");
if (burger && navLinks) {
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
    if (open) {
      Object.assign(navLinks.style, {
        display: "flex",
        position: "fixed",
        top: "70px",
        left: "0",
        right: "0",
        flexDirection: "column",
        gap: "0",
        background: "var(--black)",
        padding: "20px",
        zIndex: "49",
        borderBottom: "3px solid var(--yellow)",
      });
      navLinks.querySelectorAll("a").forEach((a) => {
        a.style.padding = "14px 0";
        a.style.borderBottom = "1px dashed var(--steel-3)";
      });
    } else {
      navLinks.removeAttribute("style");
      navLinks.querySelectorAll("a").forEach((a) => a.removeAttribute("style"));
    }
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      if (window.innerWidth <= 1024) burger.click();
    })
  );
}

/* ---------- 10. Parallax léger sur les portes ---------- */
const doorL = document.querySelector(".door--left");
const doorR = document.querySelector(".door--right");
let raf;
window.addEventListener("scroll", () => {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    if (doorL && doorR) {
      const y = window.scrollY;
      const factor = Math.min(1, y / 600);
      doorL.style.setProperty("--parallax", factor);
      doorR.style.setProperty("--parallax", factor);
      doorL.style.transform = `translateX(${-2 - factor * 40}%)`;
      doorR.style.transform = `translateX(${2 + factor * 40}%)`;
    }
    raf = null;
  });
});

/* ---------- 11. Easter egg : clic sur logo ---------- */
const logo = document.querySelector(".nav__logo .logo-mark");
let clicks = 0;
if (logo) {
  logo.addEventListener("click", () => {
    clicks++;
    if (clicks >= 4) {
      clicks = 0;
      document.body.classList.toggle("party-mode");
      showToast("🎉 Mode soirée enclenché — chut !");
    }
  });
}

/* ---------- 12. Données dynamiques depuis l'API ---------- */
(async function loadPublicData() {
  const BASE = "http://localhost:3001/api";

  // --- Agenda ---
  const FILTER = { concert: "concert", djset: "dj", foodtruck: "food", horlesmurs: "hors", autre: "autre" };
  const TAG    = { concert: "tag--concert", djset: "tag--dj", foodtruck: "tag--food", horlesmurs: "tag--hors" };
  const LABEL  = { concert: "Concert", djset: "DJ Set", foodtruck: "Food Truck", horlesmurs: "Hors les murs", autre: "Événement" };
  const MO     = ["JAN","FÉV","MAR","AVR","MAI","JUIN","JUIL","AOÛ","SEP","OCT","NOV","DÉC"];

  function renderAgenda(published) {
    const list = document.getElementById("agendaList");
    if (!list) return;

    if (published.length === 0) {
      list.innerHTML = `<p class="agenda__note" style="text-align:center;padding:60px 0;">Aucun événement à venir pour l'instant — revenez bientôt !</p>`;
      // Masque tous les chips de filtre sauf "Tout"
      document.querySelectorAll(".agenda__filters .chip[data-filter]").forEach(c => {
        c.style.display = c.dataset.filter === "all" ? "" : "none";
      });
      return;
    }

    list.innerHTML = published.map(ev => {
      const d    = new Date(ev.event_date + "T12:00:00"); // midi local pour éviter décalage UTC
      const day  = String(d.getDate()).padStart(2, "0");
      const mo   = MO[d.getMonth()];
      const type = FILTER[ev.type] || "autre";
      const tag  = TAG[ev.type]    || "";
      const lbl  = LABEL[ev.type]  || ev.type;
      const time = ev.time_start ? `${ev.time_start}${ev.time_end ? " → " + ev.time_end : ""}` : "";
      return `
        <article class="event reveal is-revealed" data-type="${type}">
          <div class="event__date">
            <span class="event__day">${day}</span>
            <span class="event__mo">${mo}</span>
          </div>
          <div class="event__main">
            <span class="event__tag ${tag}">${lbl}${ev.artist ? " · " + ev.artist : ""}</span>
            <h3>${ev.title}</h3>
            ${ev.description ? `<p>${ev.description}</p>` : ""}
            ${time ? `<div class="event__meta"><span>${time}</span></div>` : ""}
          </div>
          <a href="#" class="event__cta" aria-label="Plus d'infos">→</a>
        </article>`;
    }).join("");

    // Affiche uniquement les chips dont des événements existent
    const presentTypes = new Set(published.map(ev => FILTER[ev.type] || "autre"));
    document.querySelectorAll(".agenda__filters .chip[data-filter]").forEach(chip => {
      if (chip.dataset.filter === "all") return;
      chip.style.display = presentTypes.has(chip.dataset.filter) ? "" : "none";
    });
  }

  try {
    const res  = await fetch(`${BASE}/events`);
    const rows = await res.json();
    if (!res.ok || !Array.isArray(rows)) throw new Error("bad response");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const published = rows.filter(ev => ev.status === "published" && new Date(ev.event_date + "T12:00:00") >= today);
    renderAgenda(published);
  } catch {
    renderAgenda([]); // Aucun événement si l'API ne répond pas
  }

  // --- Menu ---
  try {
    const res  = await fetch(`${BASE}/menu`);
    const data = await res.json();
    if (res.ok) {
      const cats = Object.entries(data);
      if (cats.length > 0) {
        const cols = document.querySelector(".menu__cols");
        if (cols) {
          cols.innerHTML = cats.map(([cat, items]) => `
            <div class="menu__col">
              <h3 class="chalk chalk--cat">${cat}</h3>
              <ul class="menu__list chalk">
                ${items.map(i => `<li><span>${i.label}</span><b>${i.price}</b></li>`).join("")}
              </ul>
            </div>`).join("");
        }
      }
    }
  } catch {}

  // --- Associations ---
  try {
    const res  = await fetch(`${BASE}/associations`);
    const rows = await res.json();
    if (res.ok && rows.length > 0) {
      const grid = document.querySelector(".assos__grid");
      if (grid) {
        grid.innerHTML = rows.map(a => {
          const initials = a.name.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
          const amount   = Number(a.amount_2026 || 0).toLocaleString("fr-FR");
          return `
            <article class="asso reveal is-revealed">
              <div class="asso__head">
                <div class="asso__logo">${initials}</div>
                <h3>${a.name}</h3>
              </div>
              ${a.description ? `<p>${a.description}</p>` : ""}
              <div class="asso__meta">
                <span><b>${amount} €</b> reversés en 2026</span>
                ${a.website_url ? `<a href="${a.website_url}" target="_blank" rel="noopener" class="btn btn--mini btn--yellow">Faire un don</a>` : ""}
              </div>
            </article>`;
        }).join("");
      }
    }
  } catch {}

  // --- Compteur adhérents ---
  try {
    const res   = await fetch(`${BASE}/public/stats`);
    const stats = await res.json();
    if (!res.ok) throw null;
    const count = stats.members || 0;

    // Compteur animé (data-to + valeur affichée si déjà animé)
    const cEl = document.getElementById("statMembers");
    if (cEl) { cEl.dataset.to = count; cEl.textContent = count.toLocaleString("fr-FR"); }

    // Texte "120 adhérents" dans l'histoire
    const tEl = document.getElementById("statMembersText");
    if (tEl) tEl.textContent = `${count} adhérent${count > 1 ? "s" : ""}`;

    // Marquee(s)
    document.querySelectorAll(".marquee span").forEach(el => {
      if (el.textContent.includes("ADHÉRENTS")) el.textContent = `${count} ADHÉRENTS`;
    });
  } catch {}

  // --- Paramètres (horaires + contact) ---
  try {
    const res = await fetch(`${BASE}/settings`);
    const cfg = await res.json();
    if (!res.ok) throw null;

    // Horaires
    const schedule = document.querySelector(".schedule");
    if (schedule) {
      const jours = [
        { key: "lundi",    label: "Lundi" },
        { key: "mardi",    label: "Mardi" },
        { key: "mercredi", label: "Mercredi" },
        { key: "jeudi",    label: "Jeudi" },
        { key: "vendredi", label: "Vendredi" },
        { key: "samedi",   label: "Samedi" },
        { key: "dimanche", label: "Dimanche" },
      ];
      const hasData = jours.some(j => cfg[`hours_${j.key}`]);
      if (hasData) {
        schedule.innerHTML = jours.map(({ key, label }) => {
          const val    = cfg[`hours_${key}`] || "Fermé";
          const isOpen = val !== "Fermé" && val.trim() !== "";
          return `<li${isOpen ? ' class="is-open"' : ""}><span>${label}</span><span>${val}</span></li>`;
        }).join("");
      }
    }
    // Téléphone
    if (cfg.contact_phone) {
      const el = document.querySelector(".phone-big");
      if (el) { el.textContent = cfg.contact_phone; el.href = `tel:${cfg.contact_phone.replace(/\s/g, "")}`; }
    }
    // Email
    if (cfg.contact_email) {
      const el = document.querySelector('a[href^="mailto:"]');
      if (el) { el.textContent = `${cfg.contact_email} →`; el.href = `mailto:${cfg.contact_email}`; }
    }
    // Adresse
    if (cfg.contact_address) {
      const el = document.querySelector(".address");
      if (el) el.innerHTML = cfg.contact_address.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br/>");
    }
  } catch {}
})();

const style = document.createElement("style");
style.textContent = `
  .party-mode { animation: shake 0.4s infinite alternate; }
  .party-mode .marquee__track { animation-duration: 8s !important; }
  .party-mode .h-display .hl { animation: tilt 0.3s infinite alternate; }
  @keyframes shake { from { filter: hue-rotate(0deg); } to { filter: hue-rotate(20deg); } }
  @keyframes tilt { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
`;
document.head.appendChild(style);

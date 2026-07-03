<script setup lang="ts">
interface Event {
  id: number;
  title: string;
  type: string;
  event_date: string;
  time_start?: string | null;
  time_end?: string | null;
  description?: string | null;
  artist?: string | null;
  status: string;
}
interface MenuItem { id: number; category: string; label: string; price: string; }
interface Association {
  id: number;
  name: string;
  description?: string | null;
  amount_2026?: number | string | null;
  website_url?: string | null;
}
interface Stats { members: number; }
interface Settings {
  hours_lundi?: string;
  hours_mardi?: string;
  hours_mercredi?: string;
  hours_jeudi?: string;
  hours_vendredi?: string;
  hours_samedi?: string;
  hours_dimanche?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
}
interface Bilan { id: number; year: number; title: string; file_url: string; }
interface GalleryImage { id: number; file_url: string; }

useHead({
  title: "Bar associatif, containers & chaudronnerie · Annecy",
  meta: [
    { name: "description", content: "Bar associatif d'Annecy installé dans d'anciens containers. Concerts, DJ sets, food trucks. Les bénéfices vont à la lutte contre le cancer." },
  ],
});

const apiBase = useApiBase();

// SSR fetch en parallèle
const [
  { data: eventsRaw },
  { data: menu },
  { data: associations },
  { data: stats },
  { data: settings },
  { data: latestBilan },
  { data: galleryImages },
] = await Promise.all([
  useFetch<Event[]>("/events", { baseURL: apiBase, key: "home-events", default: () => [] }),
  useFetch<Record<string, MenuItem[]>>("/menu", { baseURL: apiBase, key: "home-menu", default: () => ({}) }),
  useFetch<Association[]>("/associations", { baseURL: apiBase, key: "home-associations", default: () => [] }),
  useFetch<Stats>("/public/stats", { baseURL: apiBase, key: "home-stats", default: () => ({ members: 0 }) }),
  useFetch<Settings>("/settings", { baseURL: apiBase, key: "home-settings", default: () => ({}) }),
  useFetch<Bilan | null>("/bilans/latest", { baseURL: apiBase, key: "home-bilan-latest", default: () => null }),
  useFetch<GalleryImage[]>("/gallery", { baseURL: apiBase, key: "home-gallery", default: () => [] }),
]);

const upcomingEvents = computed(() => {
  const rows = eventsRaw.value || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return rows.filter(
    (ev) =>
      ev.status === "published" &&
      new Date(ev.event_date + "T12:00:00") >= today,
  );
});

const memberCount = computed(() => stats.value?.members || 0);
const menuData = computed(() => menu.value || {});
const assosList = computed(() => associations.value || []);
const settingsData = computed<Settings & Record<string, string | undefined>>(
  () => settings.value || {},
);

// Toggles Visibilité (gérés depuis l'admin → onglet Réglages)
// Défauts : tout visible, sauf fermeture qui est off par défaut.
const toggles = computed(() => ({
  transparency: settingsData.value.toggle_transparency !== "false",
  adhesion: settingsData.value.toggle_adhesion !== "false",
  concerts: settingsData.value.toggle_concerts !== "false",
  agenda: settingsData.value.toggle_agenda !== "false",
  gallery: settingsData.value.toggle_gallery !== "false",
  fermeture: settingsData.value.toggle_fermeture === "true",
}));

// Montant de l'adhésion (défaut 15€)
const membershipPrice = computed(() => {
  const raw = settingsData.value.membership_price;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 15;
});

// Scroll reveal (client)
onMounted(() => {
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
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );
  revealEls.forEach((el) => io.observe(el));

  const counters = document.querySelectorAll(".counter");
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target as HTMLElement);
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 },
  );
  counters.forEach((c) => counterIO.observe(c));

  // Style dynamique du party mode
  const style = document.createElement("style");
  style.textContent = `
    .party-mode { animation: shake 0.4s infinite alternate; }
    .party-mode .marquee__track { animation-duration: 8s !important; }
    .party-mode .h-display .hl { animation: tilt 0.3s infinite alternate; }
    @keyframes shake { from { filter: hue-rotate(0deg); } to { filter: hue-rotate(20deg); } }
    @keyframes tilt { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
  `;
  document.head.appendChild(style);
});

function animateCount(el: HTMLElement) {
  const to = Number(el.dataset.to || 0);
  const decimals = Number(el.dataset.decimals || 0);
  const duration = 1600;
  const start = performance.now();
  function step(now: number) {
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
</script>

<template>
  <div>
    <SiteClosureBanner v-if="toggles.fermeture" />
    <SiteHeroSection :member-count="memberCount" :show-agenda="toggles.agenda" />
    <SiteManifestSection />
    <SiteStorySection
      :member-count="memberCount"
      :membership-price="membershipPrice"
      :show-transparence="toggles.transparency"
      :latest-bilan="latestBilan"
      :api-base="apiBase"
    />
    <SiteAgendaSection v-if="toggles.agenda" :events="upcomingEvents" />
    <SiteGallerySection v-if="toggles.gallery && galleryImages?.length" :images="galleryImages" :api-base="apiBase" />
    <SiteMenuSection :menu="menuData" />
    <SiteConcertSection v-if="toggles.concerts" />
    <SiteInfosSection :settings="settingsData" />
    <SiteAssosSection :associations="assosList" />
    <SiteAdhesionSection v-if="toggles.adhesion" :membership-price="membershipPrice" />
  </div>
</template>

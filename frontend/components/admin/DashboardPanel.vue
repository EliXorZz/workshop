<script setup lang="ts">
interface DashboardData {
  members: { total: number; paid: number; new_month: number };
  events: { upcoming: number; concerts: number };
  pending_requests: number;
  upcoming_events: { id: number; title: string; event_date: string; status: string }[];
}

const { apiFetch } = useApi();
const data = ref<DashboardData | null>(null);

async function load() {
  try {
    data.value = await apiFetch<DashboardData>("/dashboard");
  } catch {}
}

onMounted(load);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function statusLabel(s: string) {
  return ({ published: "Publié", draft: "Brouillon", cancelled: "Annulé" } as any)[s] || s;
}
function statusBadge(s: string) {
  return s === "published" ? "badge--ok" : s === "draft" ? "badge--draft" : s === "cancelled" ? "badge--alert" : "";
}
</script>

<template>
  <section class="admin-section is-active">
    <header class="admin-header">
      <div>
        <h2>Dashboard</h2>
        <p>Bienvenue. Voilà le pouls du Bistrot.</p>
      </div>
      <span class="badge badge--yellow">Été 2026 · semaine 27</span>
    </header>

    <div class="kpi-grid">
      <div class="kpi">
        <div class="kpi__label">Adhérents</div>
        <div class="kpi__value">{{ data?.members.total ?? "—" }}</div>
        <div class="kpi__delta">total inscrits</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Cotisations payées</div>
        <div class="kpi__value">{{ data?.members.paid ?? "—" }}</div>
        <div class="kpi__delta">× 15€</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Soirées à venir</div>
        <div class="kpi__value">{{ data?.events.upcoming ?? "—" }}</div>
        <div class="kpi__delta">événements publiés</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Demandes groupes</div>
        <div class="kpi__value">{{ data?.pending_requests ?? "—" }}</div>
        <div class="kpi__delta">à traiter</div>
      </div>
    </div>

    <div class="panel">
      <h3>Prochains événements</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Événement</th><th>Statut</th></tr>
        </thead>
        <tbody>
          <tr v-if="!data">
            <td colspan="3" style="opacity:.5">Chargement…</td>
          </tr>
          <tr v-else-if="!data.upcoming_events.length">
            <td colspan="3" style="opacity:.5">Aucun événement à venir.</td>
          </tr>
          <tr v-for="ev in data?.upcoming_events || []" :key="ev.id">
            <td>{{ formatDate(ev.event_date) }}</td>
            <td>{{ ev.title }}</td>
            <td><span class="badge" :class="statusBadge(ev.status)">{{ statusLabel(ev.status) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

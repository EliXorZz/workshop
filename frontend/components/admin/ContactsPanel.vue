<script setup lang="ts">
interface ContactRequest {
  id: number;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: "pending" | "replied" | "archived";
  created_at: string;
}

const { apiFetch } = useApi();
const { show } = useToast();

const rows = ref<ContactRequest[]>([]);
const filter = ref<"all" | "pending" | "replied" | "archived">("all");
const expanded = ref<number | null>(null);

async function load() {
  try {
    rows.value = await apiFetch<ContactRequest[]>("/campaigns/contact-requests");
  } catch {}
}
onMounted(load);

const filtered = computed(() => {
  if (filter.value === "all") return rows.value;
  return rows.value.filter((r) => r.status === filter.value);
});

const pendingCount = computed(() => rows.value.filter((r) => r.status === "pending").length);

async function setStatus(id: number, status: ContactRequest["status"]) {
  try {
    const updated = await apiFetch<ContactRequest>(`/campaigns/contact-requests/${id}`, {
      method: "PATCH",
      body: { status },
    });
    const idx = rows.value.findIndex((r) => r.id === id);
    if (idx !== -1) rows.value[idx] = updated;
    show("Statut mis à jour.");
  } catch {
    show("Erreur mise à jour.", true);
  }
}

function toggle(id: number) {
  expanded.value = expanded.value === id ? null : id;
}

function statusLabel(s: string) {
  return { pending: "En attente", replied: "Répondu", archived: "Archivé" }[s] || s;
}

function statusClass(s: string) {
  return { pending: "badge--alert", replied: "badge--ok", archived: "badge--draft" }[s] || "";
}

function fmt(dt: string) {
  return new Date(dt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
</script>

<template>
  <section class="admin-section is-active">
    <header class="admin-header">
      <div>
        <h2>Demandes de contact</h2>
        <p>
          Formulaires concerts / groupes soumis depuis le site.
          <span v-if="pendingCount" class="badge badge--alert" style="margin-left:8px;">
            {{ pendingCount }} en attente
          </span>
        </p>
      </div>
    </header>

    <div class="panel" style="padding-bottom:0;">
      <div class="tab-filters">
        <button
          v-for="f in (['all', 'pending', 'replied', 'archived'] as const)"
          :key="f"
          :class="['filter-btn', { 'is-active': filter === f }]"
          @click="filter = f"
        >
          {{ f === 'all' ? 'Toutes' : statusLabel(f) }}
          <span v-if="f === 'pending' && pendingCount" class="filter-count">{{ pendingCount }}</span>
        </button>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Nom</th>
            <th>Contact</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="!filtered.length">
            <tr><td colspan="5" style="opacity:.5">Aucune demande.</td></tr>
          </template>
          <template v-for="r in filtered" :key="r.id">
            <tr :class="{ 'is-expanded': expanded === r.id }">
              <td>{{ fmt(r.created_at) }}</td>
              <td><strong>{{ r.name }}</strong></td>
              <td>
                <a :href="`mailto:${r.email}`">{{ r.email }}</a>
                <span v-if="r.phone"> · {{ r.phone }}</span>
              </td>
              <td>
                <span class="badge" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
              </td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" title="Voir le message" @click="toggle(r.id)">
                    {{ expanded === r.id ? '▲' : '▼' }}
                  </button>
                  <button
                    v-if="r.status !== 'replied'"
                    class="icon-btn icon-btn--ok"
                    title="Marquer comme répondu"
                    @click="setStatus(r.id, 'replied')"
                  >✓</button>
                  <button
                    v-if="r.status !== 'archived'"
                    class="icon-btn"
                    title="Archiver"
                    @click="setStatus(r.id, 'archived')"
                  >⊘</button>
                  <button
                    v-if="r.status !== 'pending'"
                    class="icon-btn"
                    title="Remettre en attente"
                    @click="setStatus(r.id, 'pending')"
                  >↺</button>
                </div>
              </td>
            </tr>
            <tr v-if="expanded === r.id" class="message-row">
              <td colspan="5">
                <div class="message-bubble">
                  <p v-if="r.message">{{ r.message }}</p>
                  <p v-else style="opacity:.5;font-style:italic;">Aucun message.</p>
                  <div class="message-actions">
                    <a :href="`mailto:${r.email}?subject=Re: demande concert - Bistrot de Tatina`" class="btn btn--yellow btn--sm">
                      Répondre par email →
                    </a>
                    <a v-if="r.phone" :href="`tel:${r.phone}`" class="btn btn--ghost btn--sm">
                      Appeler
                    </a>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.tab-filters {
  display: flex;
  gap: .5rem;
  padding: 0 0 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: .35rem .85rem;
  border: 1px solid rgba(255,255,255,.15);
  background: transparent;
  color: inherit;
  border-radius: 4px;
  cursor: pointer;
  font-size: .8rem;
  letter-spacing: .04em;
  display: flex;
  align-items: center;
  gap: .4rem;
  transition: background .15s, border-color .15s;
}
.filter-btn.is-active { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.35); }
.filter-btn:hover:not(.is-active) { background: rgba(255,255,255,.05); }

.filter-count {
  background: var(--clr-yellow, #f5c842);
  color: #111;
  border-radius: 99px;
  font-size: .7rem;
  font-weight: 700;
  padding: 0 .4rem;
  line-height: 1.4;
}

.is-expanded td { background: rgba(255,255,255,.03); }

.message-row td { padding: 0; border-top: none; }

.message-bubble {
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px dashed rgba(255,255,255,.08);
  white-space: pre-wrap;
  line-height: 1.7;
  font-size: .9rem;
  opacity: .85;
}

.message-actions {
  display: flex;
  gap: .75rem;
  margin-top: 1rem;
}

.icon-btn--ok { color: var(--clr-yellow, #f5c842); }
</style>

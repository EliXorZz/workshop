<script setup lang="ts">
interface EventRow {
  id: number;
  title: string;
  artist?: string | null;
  type: string;
  status: string;
  event_date: string;
}

const { apiFetch } = useApi();
const { show } = useToast();

const events = ref<EventRow[]>([]);
const modalOpen = ref(false);
const editing = ref<EventRow | null>(null);
const confirmOpen = ref(false);
const pendingDelete = ref<number | null>(null);

async function load() {
  try {
    events.value = await apiFetch<EventRow[]>("/events");
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
  return s === "published" ? "badge--ok" : "badge--draft";
}
function typeBadge(t: string) {
  return t === "djset" ? "badge--yellow" : "";
}

function openNew() {
  editing.value = null;
  modalOpen.value = true;
}
function openEdit(ev: EventRow) {
  editing.value = { ...ev };
  modalOpen.value = true;
}
function askDelete(id: number) {
  pendingDelete.value = id;
  confirmOpen.value = true;
}
async function doDelete() {
  if (pendingDelete.value == null) return;
  try {
    await apiFetch(`/events/${pendingDelete.value}`, { method: "DELETE" });
    events.value = events.value.filter((e) => e.id !== pendingDelete.value);
    show("Événement supprimé.");
  } catch (err: any) {
    show(err?.data?.error || "Erreur", true);
  }
  confirmOpen.value = false;
  pendingDelete.value = null;
}
</script>

<template>
  <section class="admin-section is-active">
    <header class="admin-header">
      <div>
        <h2>Agenda</h2>
        <p>Crée, édite ou archive les événements publiés sur le site.</p>
      </div>
      <button class="btn btn--yellow" @click="openNew">+ Nouvel événement</button>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Titre</th><th>Type</th><th>Statut</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-if="!events.length">
            <td colspan="5" style="opacity:.5">Aucun événement.</td>
          </tr>
          <tr v-for="ev in events" :key="ev.id">
            <td>{{ formatDate(ev.event_date) }}</td>
            <td>
              <strong>{{ ev.title }}</strong>
              <template v-if="ev.artist"><br/><small>{{ ev.artist }}</small></template>
            </td>
            <td><span class="badge" :class="typeBadge(ev.type)">{{ ev.type }}</span></td>
            <td><span class="badge" :class="statusBadge(ev.status)">{{ statusLabel(ev.status) }}</span></td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" title="Éditer" @click="openEdit(ev)">✎</button>
                <button class="icon-btn icon-btn--danger" title="Supprimer" @click="askDelete(ev.id)">✕</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminEventModal
      :open="modalOpen"
      :event="editing"
      @close="modalOpen = false"
      @saved="load"
    />
    <AdminConfirmModal
      :open="confirmOpen"
      message="Supprimer cet événement ?"
      danger
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>

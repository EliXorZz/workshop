<script setup lang="ts">
interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  payment_status: boolean;
  consent: boolean;
  contact_email: boolean | number;
  contact_sms: boolean | number;
}

const { apiFetch, apiBase } = useApi();
const { token } = useAuth();
const { show } = useToast();

const members = ref<Member[]>([]);
const total = ref(0);
const search = ref("");
const status = ref("");
const modalOpen = ref(false);
const editing = ref<Member | null>(null);
const confirmOpen = ref(false);
const pendingDelete = ref<number | null>(null);

let searchTimer: ReturnType<typeof setTimeout> | null = null;

async function load() {
  const params = new URLSearchParams({
    search: search.value,
    status: status.value,
    limit: "100",
  });
  try {
    const data = await apiFetch<{ data: Member[]; total: number }>(`/members?${params}`);
    members.value = data.data;
    total.value = data.total;
  } catch {}
}
onMounted(load);

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(load, 250);
});
watch(status, load);

async function togglePayment(m: Member) {
  try {
    const updated = await apiFetch<{ payment_status: boolean }>(`/members/${m.id}/payment`, { method: "PATCH" });
    m.payment_status = updated.payment_status;
    show(updated.payment_status ? "Cotisation validée." : "Paiement retiré.");
  } catch {}
}

function openNew() {
  editing.value = null;
  modalOpen.value = true;
}
async function openEdit(id: number) {
  try {
    const data = await apiFetch<Member>(`/members/${id}`);
    editing.value = data;
    modalOpen.value = true;
  } catch {}
}
function askDelete(id: number) {
  pendingDelete.value = id;
  confirmOpen.value = true;
}
async function doDelete() {
  if (pendingDelete.value == null) return;
  try {
    await apiFetch(`/members/${pendingDelete.value}`, { method: "DELETE" });
    members.value = members.value.filter((m) => m.id !== pendingDelete.value);
    total.value = Math.max(0, total.value - 1);
    show("Adhérent supprimé.");
  } catch (err: any) {
    show(err?.data?.error || "Erreur", true);
  }
  confirmOpen.value = false;
  pendingDelete.value = null;
}

async function downloadExport(format: "csv" | "xlsx") {
  try {
    const res = await fetch(`${apiBase}/members/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    if (!res.ok) throw new Error("export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adherents-tatina.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    show("Erreur export", true);
  }
}

const fileInput = ref<HTMLInputElement | null>(null);
async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch(`${apiBase}/members/import`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.value}` },
      body: fd,
    });
    const data = await res.json();
    if (res.ok) {
      show(`Import : ${data.inserted} insérés, ${data.skipped} ignorés.`);
      await load();
    } else {
      show(data.error || "Erreur import", true);
    }
  } catch {
    show("Erreur import", true);
  }
  if (fileInput.value) fileInput.value.value = "";
}
</script>

<template>
  <section class="admin-section is-active">
    <header class="admin-header">
      <div>
        <h2>Adhérents</h2>
        <p>{{ total }} adhérent{{ total > 1 ? "s" : "" }} au total.</p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn--yellow" @click="openNew">+ Nouvel adhérent</button>
        <button class="btn btn--ghost" @click="downloadExport('csv')">Exporter CSV</button>
        <button class="btn btn--ghost" @click="downloadExport('xlsx')">Exporter Excel</button>
        <label class="btn btn--ghost" style="cursor:pointer;" title="Importer CSV ou XLSX">
          Importer…
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.xlsx,.xls"
            style="display:none;"
            @change="onFile"
          />
        </label>
      </div>
    </header>

    <div class="toolbar">
      <input v-model="search" type="search" placeholder="Rechercher un adhérent…" />
      <select v-model="status">
        <option value="">Tous les statuts</option>
        <option value="paid">Cotisation payée</option>
        <option value="unpaid">À renouveler</option>
      </select>
      <div class="spacer"></div>
      <span class="badge">{{ total }} adhérent{{ total > 1 ? "s" : "" }}</span>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>N°</th><th>Nom</th><th>Email</th><th>Téléphone</th><th>Contact</th><th>Paiement</th><th>Statut</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-if="!members.length"><td colspan="8" style="opacity:.5">Aucun adhérent.</td></tr>
          <tr v-for="m in members" :key="m.id">
            <td>{{ m.id }}</td>
            <td><strong>{{ m.last_name }} {{ m.first_name }}</strong></td>
            <td>{{ m.email }}</td>
            <td>{{ m.phone || "—" }}</td>
            <td>
              <div class="contact-chips">
                <span :class="['chip', m.contact_email ? 'chip--on' : 'chip--off']" title="Email">✉</span>
                <span :class="['chip', m.contact_sms ? 'chip--on' : 'chip--off']" title="SMS">✆</span>
              </div>
            </td>
            <td>
              <button
                class="toggle-payment"
                :class="{ 'is-paid': m.payment_status }"
                :title="m.payment_status ? 'Cotisation payée — cliquer pour annuler' : 'Marquer comme payé'"
                @click="togglePayment(m)"
              >
                {{ m.payment_status ? "✓ Payé" : "Non payé" }}
              </button>
            </td>
            <td>
              <span class="badge" :class="m.payment_status ? 'badge--ok' : 'badge--alert'">
                {{ m.payment_status ? "Actif" : "À renouveler" }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" title="Éditer" @click="openEdit(m.id)">✎</button>
                <button class="icon-btn icon-btn--danger" title="Supprimer" @click="askDelete(m.id)">✕</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminMemberModal
      :open="modalOpen"
      :member="editing"
      @close="modalOpen = false"
      @saved="load"
    />
    <AdminConfirmModal
      :open="confirmOpen"
      message="Supprimer cet adhérent ? L'opération est irréversible."
      danger
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>

<style scoped>
.contact-chips { display: flex; gap: 4px; }
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: .75rem;
  border: 1px solid;
}
.chip--on  { border-color: var(--clr-yellow, #f5c842); color: var(--clr-yellow, #f5c842); }
.chip--off { border-color: rgba(255,255,255,.15); color: rgba(255,255,255,.25); }
</style>

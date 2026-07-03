<script setup lang="ts">
interface Asso {
  id: number;
  name: string;
  description?: string | null;
  amount_2026: number | string;
  website_url?: string | null;
}

const { apiFetch } = useApi();
const { show } = useToast();

const rows = ref<Asso[]>([]);
const modalOpen = ref(false);
const editingAsso = ref<Asso | null>(null);
const confirmOpen = ref(false);
const pendingDelete = ref<number | null>(null);

async function load() {
  try {
    rows.value = await apiFetch<Asso[]>("/associations");
  } catch {}
}
onMounted(load);

function openAdd() {
  editingAsso.value = null;
  modalOpen.value = true;
}

function openEdit(a: Asso) {
  editingAsso.value = a;
  modalOpen.value = true;
}

function askDelete(id: number) {
  pendingDelete.value = id;
  confirmOpen.value = true;
}

async function doDelete() {
  if (pendingDelete.value == null) return;
  try {
    await apiFetch(`/associations/${pendingDelete.value}`, { method: "DELETE" });
    rows.value = rows.value.filter((r) => r.id !== pendingDelete.value);
    show("Association supprimée.");
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
        <h2>Assos soutenues</h2>
        <p>Mets à jour les montants reversés et la liste des partenaires.</p>
      </div>
      <button class="btn btn--yellow" @click="openAdd">+ Ajouter une asso</button>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Asso</th><th>Reversé 2026</th><th>Site</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length"><td colspan="4" style="opacity:.5">Aucune association.</td></tr>
          <tr v-for="a in rows" :key="a.id">
            <td><strong>{{ a.name }}</strong></td>
            <td>{{ Number(a.amount_2026).toLocaleString("fr-FR") }} €</td>
            <td>
              <a v-if="a.website_url" :href="a.website_url" target="_blank">{{ a.website_url }}</a>
              <span v-else>—</span>
            </td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" title="Modifier" @click="openEdit(a)">✎</button>
                <button class="icon-btn icon-btn--danger" title="Supprimer" @click="askDelete(a.id)">✕</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminAssoModal
      :open="modalOpen"
      :asso="editingAsso"
      @close="modalOpen = false"
      @saved="load"
    />
    <AdminConfirmModal
      :open="confirmOpen"
      message="Supprimer cette asso ?"
      danger
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>

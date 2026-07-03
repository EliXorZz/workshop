<script setup lang="ts">
interface MenuItem { id: number; category: string; label: string; price: string; }

const { apiFetch } = useApi();
const { show } = useToast();

const menu = ref<Record<string, MenuItem[]>>({});
const modalOpen = ref(false);
const editing = ref<MenuItem | null>(null);
const presetCategory = ref<string>("");
const confirmOpen = ref(false);
const pendingDelete = ref<number | null>(null);

const categories = computed(() => Object.entries(menu.value));

async function load() {
  try {
    menu.value = await apiFetch<Record<string, MenuItem[]>>("/menu");
  } catch {}
}
onMounted(load);

function openNew() {
  editing.value = null;
  presetCategory.value = "";
  modalOpen.value = true;
}
function openNewInCategory(cat: string) {
  editing.value = null;
  presetCategory.value = cat;
  modalOpen.value = true;
}
function openEdit(item: MenuItem) {
  editing.value = { ...item };
  presetCategory.value = "";
  modalOpen.value = true;
}

function askDelete(id: number) {
  pendingDelete.value = id;
  confirmOpen.value = true;
}
async function doDelete() {
  if (pendingDelete.value == null) return;
  try {
    await apiFetch(`/menu/${pendingDelete.value}`, { method: "DELETE" });
    show("Plat supprimé.");
    await load();
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
        <h2>Menu (ardoise)</h2>
        <p>Modifie la carte affichée sur le site. La modif est visible immédiatement.</p>
      </div>
      <button class="btn btn--yellow" @click="openNew">+ Ajouter un plat</button>
    </header>

    <div v-if="!categories.length" class="panel">
      <p style="opacity:.5">Aucun plat.</p>
    </div>

    <div v-for="[cat, items] in categories" :key="cat" class="panel">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px;">
        <h3 style="margin:0; padding:0; border:0;">{{ cat }}</h3>
        <button class="btn btn--ghost btn--mini" @click="openNewInCategory(cat)">
          + Ajouter dans {{ cat }}
        </button>
      </div>
      <table>
        <thead>
          <tr><th>Intitulé</th><th>Prix</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.label }}</td>
            <td>{{ item.price }}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" title="Éditer" @click="openEdit(item)">✎</button>
                <button class="icon-btn icon-btn--danger" title="Supprimer" @click="askDelete(item.id)">✕</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminMenuModal
      :open="modalOpen"
      :item="editing"
      :preset-category="presetCategory"
      @close="modalOpen = false"
      @saved="load"
    />
    <AdminConfirmModal
      :open="confirmOpen"
      message="Supprimer ce plat ?"
      danger
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>

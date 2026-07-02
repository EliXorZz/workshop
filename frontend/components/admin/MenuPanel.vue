<script setup lang="ts">
interface MenuItem { id: number; category: string; label: string; price: string; }

const { apiFetch } = useApi();
const { show } = useToast();

const menu = ref<Record<string, MenuItem[]>>({});
const modalOpen = ref(false);
const confirmOpen = ref(false);
const pendingDelete = ref<number | null>(null);

const categories = computed(() => Object.entries(menu.value));

async function load() {
  try {
    menu.value = await apiFetch<Record<string, MenuItem[]>>("/menu");
  } catch {}
}
onMounted(load);

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
      <button class="btn btn--yellow" @click="modalOpen = true">+ Ajouter un plat</button>
    </header>

    <div v-if="!categories.length" class="panel">
      <p style="opacity:.5">Aucun plat.</p>
    </div>

    <div v-for="[cat, items] in categories" :key="cat" class="panel">
      <h3>{{ cat }}</h3>
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
                <button class="icon-btn icon-btn--danger" title="Supprimer" @click="askDelete(item.id)">✕</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminMenuModal :open="modalOpen" @close="modalOpen = false" @saved="load" />
    <AdminConfirmModal
      :open="confirmOpen"
      message="Supprimer ce plat ?"
      danger
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>

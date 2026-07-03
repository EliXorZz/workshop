<script setup lang="ts">
interface Bilan {
  id: number;
  year: number;
  title: string;
  file_url: string;
  created_at: string;
}

const { apiFetch } = useApi();
const { show } = useToast();
const apiBase = useApiBase();

const rows = ref<Bilan[]>([]);
const confirmOpen = ref(false);
const pendingDelete = ref<number | null>(null);

const form = reactive({ year: new Date().getFullYear(), title: "", file: null as File | null });
const uploading = ref(false);

async function load() {
  try {
    rows.value = await apiFetch<Bilan[]>("/bilans");
  } catch {}
}
onMounted(load);

function onFile(e: Event) {
  const input = e.target as HTMLInputElement;
  form.file = input.files?.[0] ?? null;
}

async function upload() {
  if (!form.file || !form.title) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append("file", form.file);
    fd.append("year", String(form.year));
    fd.append("title", form.title);
    const token = sessionStorage.getItem("tatina_token");
    await $fetch<Bilan>(`${apiBase}/bilans`, {
      method: "POST",
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    form.title = "";
    form.file = null;
    (document.getElementById("bilan-file-input") as HTMLInputElement).value = "";
    show("Bilan ajouté.");
    await load();
  } catch (err: any) {
    show(err?.data?.error || "Erreur upload", true);
  }
  uploading.value = false;
}

function askDelete(id: number) {
  pendingDelete.value = id;
  confirmOpen.value = true;
}

async function doDelete() {
  if (pendingDelete.value == null) return;
  try {
    await apiFetch(`/bilans/${pendingDelete.value}`, { method: "DELETE" });
    rows.value = rows.value.filter((r) => r.id !== pendingDelete.value);
    show("Bilan supprimé.");
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
        <h2>Bilans annuels</h2>
        <p>Upload des PDF de bilan. Le plus récent apparaît automatiquement sur la page d'accueil.</p>
      </div>
    </header>

    <div class="panel">
      <h3>Ajouter un bilan</h3>
      <form class="form" style="background:transparent;border:0;box-shadow:none;padding:0;" @submit.prevent="upload">
        <div class="field">
          <label>Année</label>
          <input v-model.number="form.year" type="number" min="2020" max="2099" required />
        </div>
        <div class="field">
          <label>Titre (ex : Bilan 2025)</label>
          <input v-model="form.title" type="text" placeholder="Bilan financier 2025" required />
        </div>
        <div class="field">
          <label>Fichier PDF (max 20 Mo)</label>
          <input id="bilan-file-input" type="file" accept="application/pdf" required @change="onFile" />
        </div>
        <button type="submit" class="btn btn--yellow" :disabled="uploading || !form.file || !form.title">
          {{ uploading ? "Upload en cours…" : "Uploader le bilan" }}
        </button>
      </form>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Année</th><th>Titre</th><th>Fichier</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length"><td colspan="4" style="opacity:.5">Aucun bilan uploadé.</td></tr>
          <tr v-for="b in rows" :key="b.id">
            <td><strong>{{ b.year }}</strong></td>
            <td>{{ b.title }}</td>
            <td>
              <a :href="`${apiBase.replace(/\/api\/?$/, '')}${b.file_url}`" target="_blank" rel="noopener">
                Voir le PDF →
              </a>
            </td>
            <td>
              <div class="row-actions">
                <button class="icon-btn icon-btn--danger" title="Supprimer" @click="askDelete(b.id)">✕</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminConfirmModal
      :open="confirmOpen"
      message="Supprimer ce bilan et son fichier PDF ?"
      danger
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>

<script setup lang="ts">
interface GalleryImage {
  id: number;
  file_url: string;
}

const { show } = useToast();
const apiBase = useApiBase();
const fileBase = computed(() => apiBase.replace(/\/api\/?$/, ""));

const images = ref<GalleryImage[]>([]);
const uploading = ref(false);
const confirmOpen = ref(false);
const pendingDelete = ref<number | null>(null);

async function load() {
  try {
    const token = sessionStorage.getItem("tatina_token");
    images.value = await $fetch<GalleryImage[]>(`${apiBase}/gallery`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {}
}
onMounted(load);

async function onFiles(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  if (!files.length) return;

  uploading.value = true;
  const token = sessionStorage.getItem("tatina_token");

  for (const file of files) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const img = await $fetch<GalleryImage>(`${apiBase}/gallery`, {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      images.value.push(img);
    } catch (err: any) {
      show(`Erreur : ${file.name}`, true);
    }
  }

  input.value = "";
  uploading.value = false;
  show("Images ajoutées.");
}

function askDelete(id: number) {
  pendingDelete.value = id;
  confirmOpen.value = true;
}

async function doDelete() {
  if (pendingDelete.value == null) return;
  const token = sessionStorage.getItem("tatina_token");
  try {
    await $fetch(`${apiBase}/gallery/${pendingDelete.value}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    images.value = images.value.filter((i) => i.id !== pendingDelete.value);
    show("Image supprimée.");
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
        <h2>Galerie</h2>
        <p>Les images s'affichent en carousel sur le site.</p>
      </div>
    </header>

    <div class="panel">
      <label class="upload-zone" :class="{ 'is-uploading': uploading }">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          style="display:none"
          :disabled="uploading"
          @change="onFiles"
        />
        <span v-if="uploading" class="upload-zone__label">Upload en cours…</span>
        <span v-else class="upload-zone__label">
          <strong>+ Ajouter des images</strong>
          <small>jpg, png, webp · max 15 Mo · sélection multiple OK</small>
        </span>
      </label>
    </div>

    <div v-if="!images.length" style="padding:2rem 1.5rem;opacity:.5;font-style:italic;">
      Aucune image dans la galerie.
    </div>

    <div v-else class="gallery-grid">
      <div v-for="img in images" :key="img.id" class="gallery-card">
        <img :src="`${fileBase}${img.file_url}`" alt="Photo" loading="lazy" />
        <button class="gallery-card__del" title="Supprimer" @click="askDelete(img.id)">✕</button>
      </div>
    </div>

    <AdminConfirmModal
      :open="confirmOpen"
      message="Supprimer cette image ?"
      danger
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>

<style scoped>
.upload-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  border: 2px dashed rgba(255,255,255,.15);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.upload-zone:hover { border-color: rgba(255,255,255,.35); background: rgba(255,255,255,.03); }
.upload-zone.is-uploading { opacity: .6; cursor: wait; }

.upload-zone__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .3rem;
  color: rgba(255,255,255,.6);
  font-size: .9rem;
  pointer-events: none;
}
.upload-zone__label strong { color: #fff; font-size: 1rem; }
.upload-zone__label small { font-size: .75rem; }

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: .75rem;
  padding: 1.5rem;
}

.gallery-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  background: #111;
}
.gallery-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity .2s;
}
.gallery-card:hover img { opacity: .7; }

.gallery-card__del {
  position: absolute;
  top: .35rem; right: .35rem;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(220,50,50,.9);
  border: none;
  color: #fff;
  font-size: .7rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0;
  transition: opacity .15s;
}
.gallery-card:hover .gallery-card__del { opacity: 1; }
</style>

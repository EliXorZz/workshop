<script setup lang="ts">
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const { apiFetch } = useApi();
const { show } = useToast();

const form = reactive({ category: "", label: "", price: "" });

watch(
  () => props.open,
  (v) => {
    if (v) Object.assign(form, { category: "", label: "", price: "" });
  },
);

async function onSubmit() {
  try {
    await apiFetch("/menu", { method: "POST", body: form });
    show("Plat ajouté.");
    emit("saved");
    emit("close");
  } catch (err: any) {
    show(err?.data?.error || "Erreur", true);
  }
}
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card modal-card--sm">
      <h3>Ajouter un plat</h3>
      <form
        class="form"
        style="background:transparent;border:0;box-shadow:none;padding:0;"
        @submit.prevent="onSubmit"
      >
        <div class="field"><label>Catégorie *</label><input v-model="form.category" required placeholder="À grignoter, Du robinet…" /></div>
        <div class="field"><label>Intitulé *</label><input v-model="form.label" required /></div>
        <div class="field"><label>Prix *</label><input v-model="form.price" required placeholder="5€, 4→6€" /></div>
        <div class="modal-footer">
          <button type="button" class="btn btn--ghost" @click="emit('close')">Annuler</button>
          <button type="submit" class="btn btn--yellow">Ajouter</button>
        </div>
      </form>
    </div>
  </div>
</template>

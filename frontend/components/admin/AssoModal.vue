<script setup lang="ts">
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const { apiFetch } = useApi();
const { show } = useToast();

const form = reactive({
  name: "",
  description: "",
  amount_2026: 0,
  website_url: "",
});

watch(
  () => props.open,
  (v) => {
    if (v) Object.assign(form, { name: "", description: "", amount_2026: 0, website_url: "" });
  },
);

async function onSubmit() {
  try {
    await apiFetch("/associations", {
      method: "POST",
      body: {
        name: form.name,
        description: form.description || null,
        amount_2026: Number(form.amount_2026) || 0,
        website_url: form.website_url || null,
      },
    });
    show("Association ajoutée.");
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
      <h3>Ajouter une association</h3>
      <form
        class="form"
        style="background:transparent;border:0;box-shadow:none;padding:0;"
        @submit.prevent="onSubmit"
      >
        <div class="field"><label>Nom *</label><input v-model="form.name" required /></div>
        <div class="field"><label>Description</label><textarea v-model="form.description" rows="3" placeholder="Ce que fait l'association…"></textarea></div>
        <div class="field"><label>Montant reversé 2026 (€)</label><input v-model.number="form.amount_2026" type="number" min="0" /></div>
        <div class="field"><label>Site web</label><input v-model="form.website_url" type="url" placeholder="https://…" /></div>
        <div class="modal-footer">
          <button type="button" class="btn btn--ghost" @click="emit('close')">Annuler</button>
          <button type="submit" class="btn btn--yellow">Ajouter</button>
        </div>
      </form>
    </div>
  </div>
</template>

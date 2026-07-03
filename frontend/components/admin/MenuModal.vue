<script setup lang="ts">
interface MenuItem {
  id?: number;
  category?: string;
  label?: string;
  price?: string;
}

const props = defineProps<{
  open: boolean;
  item?: MenuItem | null;
  presetCategory?: string;
}>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const { apiFetch } = useApi();
const { show } = useToast();

const form = reactive<MenuItem>({ category: "", label: "", price: "" });

watch(
  () => props.open,
  (v) => {
    if (!v) return;
    if (props.item?.id) {
      Object.assign(form, {
        category: props.item.category || "",
        label: props.item.label || "",
        price: props.item.price || "",
      });
    } else {
      Object.assign(form, {
        category: props.presetCategory || "",
        label: "",
        price: "",
      });
    }
  },
);

const isEdit = computed(() => !!props.item?.id);

async function onSubmit() {
  try {
    if (isEdit.value) {
      await apiFetch(`/menu/${props.item!.id}`, { method: "PUT", body: form });
      show("Plat mis à jour.");
    } else {
      await apiFetch("/menu", { method: "POST", body: form });
      show("Plat ajouté.");
    }
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
      <h3>{{ isEdit ? "Modifier le plat" : "Ajouter un plat" }}</h3>
      <form
        class="form"
        style="background:transparent;border:0;box-shadow:none;padding:0;"
        @submit.prevent="onSubmit"
      >
        <div class="field">
          <label>Catégorie *</label>
          <input v-model="form.category" required placeholder="À grignoter, Du robinet…" />
        </div>
        <div class="field">
          <label>Intitulé *</label>
          <input v-model="form.label" required />
        </div>
        <div class="field">
          <label>Prix *</label>
          <input v-model="form.price" required placeholder="5€, 4→6€" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn--ghost" @click="emit('close')">Annuler</button>
          <button type="submit" class="btn btn--yellow">{{ isEdit ? "Enregistrer" : "Ajouter" }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

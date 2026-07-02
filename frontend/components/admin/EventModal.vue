<script setup lang="ts">
interface EventRow {
  id?: number;
  title?: string;
  artist?: string;
  type?: string;
  status?: string;
  event_date?: string;
  time_start?: string;
  description?: string;
}

const props = defineProps<{
  open: boolean;
  event: EventRow | null;
}>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const { apiFetch } = useApi();
const { show } = useToast();

const form = reactive<EventRow>({});

watch(
  () => props.event,
  (ev) => {
    if (ev) {
      Object.assign(form, ev);
      if (form.event_date) form.event_date = form.event_date.split("T")[0];
    } else {
      Object.assign(form, { title: "", artist: "", type: "concert", status: "draft", event_date: "", time_start: "", description: "" });
    }
  },
  { immediate: true },
);

async function onSubmit() {
  const path = props.event?.id ? `/events/${props.event.id}` : "/events";
  const method = props.event?.id ? "PUT" : "POST";
  try {
    await apiFetch(path, { method, body: form });
    show(props.event ? "Événement mis à jour." : "Événement créé.");
    emit("saved");
    emit("close");
  } catch (err: any) {
    show(err?.data?.error || "Erreur", true);
  }
}
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <h3>{{ event ? "Modifier l'événement" : "Nouvel événement" }}</h3>
      <form
        class="form"
        style="background:transparent;border:0;box-shadow:none;padding:0;"
        @submit.prevent="onSubmit"
      >
        <div class="field-row">
          <div class="field"><label>Titre</label><input v-model="form.title" required /></div>
          <div class="field"><label>Artiste / nom</label><input v-model="form.artist" /></div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Type</label>
            <select v-model="form.type">
              <option value="concert">concert</option>
              <option value="djset">djset</option>
              <option value="foodtruck">foodtruck</option>
              <option value="horlesmurs">horlesmurs</option>
              <option value="autre">autre</option>
            </select>
          </div>
          <div class="field">
            <label>Statut</label>
            <select v-model="form.status">
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
        <div class="field-row">
          <div class="field"><label>Date</label><input v-model="form.event_date" type="date" required /></div>
          <div class="field"><label>Heure début</label><input v-model="form.time_start" type="time" /></div>
        </div>
        <div class="field">
          <label>Description</label>
          <textarea v-model="form.description" rows="3"></textarea>
        </div>
        <div style="display:flex;gap:10px;margin-top:10px;">
          <button type="button" class="btn btn--ghost" @click="emit('close')">Annuler</button>
          <button type="submit" class="btn btn--yellow">{{ event ? "Enregistrer" : "Créer" }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

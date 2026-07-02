<script setup lang="ts">
interface Member {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  consent?: boolean;
  payment_status?: boolean;
}

const props = defineProps<{
  open: boolean;
  member: Member | null;
}>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const { apiFetch } = useApi();
const { show } = useToast();

const form = reactive<Member>({});

watch(
  () => props.member,
  (m) => {
    Object.assign(form, {
      first_name: m?.first_name || "",
      last_name: m?.last_name || "",
      email: m?.email || "",
      phone: m?.phone || "",
      consent: !!m?.consent,
      payment_status: !!m?.payment_status,
    });
  },
  { immediate: true },
);

async function onSubmit() {
  const body = {
    first_name: (form.first_name || "").trim(),
    last_name: (form.last_name || "").trim(),
    email: (form.email || "").trim(),
    phone: (form.phone || "").trim() || null,
    consent: !!form.consent,
  };
  try {
    if (props.member?.id) {
      await apiFetch(`/members/${props.member.id}`, { method: "PATCH", body });
      if (!!form.payment_status !== !!props.member.payment_status) {
        await apiFetch(`/members/${props.member.id}/payment`, { method: "PATCH" });
      }
      show("Adhérent mis à jour.");
    } else {
      await apiFetch("/members", {
        method: "POST",
        body: { ...body, payment_status: !!form.payment_status },
      });
      show("Adhérent créé.");
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
    <div class="modal-card">
      <h3>{{ member ? "Modifier l'adhérent" : "Nouvel adhérent" }}</h3>
      <form
        class="form"
        style="background:transparent;border:0;box-shadow:none;padding:0;"
        novalidate
        @submit.prevent="onSubmit"
      >
        <div class="field-row">
          <div class="field"><label>Prénom *</label><input v-model="form.first_name" required autocomplete="off" /></div>
          <div class="field"><label>Nom *</label><input v-model="form.last_name" required autocomplete="off" /></div>
        </div>
        <div class="field"><label>Email *</label><input v-model="form.email" type="email" required autocomplete="off" /></div>
        <div class="field"><label>Téléphone</label><input v-model="form.phone" type="tel" autocomplete="off" /></div>
        <div class="checkbox-row">
          <label class="checkbox-label"><input v-model="form.payment_status" type="checkbox" /><span>Cotisation payée</span></label>
          <label class="checkbox-label"><input v-model="form.consent" type="checkbox" /><span>Consentement RGPD</span></label>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn--ghost" @click="emit('close')">Annuler</button>
          <button type="submit" class="btn btn--yellow">{{ member ? "Enregistrer" : "Créer" }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

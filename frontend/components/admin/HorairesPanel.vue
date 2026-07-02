<script setup lang="ts">
const { apiFetch } = useApi();
const { show } = useToast();

const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const settings = reactive<Record<string, string>>({
  contact_address: "",
  contact_phone: "",
  contact_email: "",
  footer_copyright: "",
  footer_baseline: "",
  footer_bilan_url: "",
});
jours.forEach((j) => (settings[`hours_${j}`] = ""));

async function load() {
  try {
    const data = await apiFetch<Record<string, string>>("/settings");
    Object.keys(settings).forEach((k) => {
      settings[k] = data[k] ?? "";
    });
  } catch {}
}
onMounted(load);

async function save() {
  try {
    await apiFetch("/settings", { method: "PATCH", body: settings });
    show("Paramètres enregistrés.");
  } catch (err: any) {
    show(err?.data?.error || "Erreur enregistrement.", true);
  }
}
</script>

<template>
  <section class="admin-section is-active">
    <header class="admin-header">
      <div>
        <h2>Horaires & infos</h2>
        <p>Tout ce qui figure dans la section "Infos pratiques" du site.</p>
      </div>
    </header>

    <div class="panel">
      <h3>Horaires d'ouverture</h3>
      <div class="form" style="background: transparent; border: 0; box-shadow: none; padding: 0;">
        <div class="field-row">
          <div class="field"><label>Lundi</label><input v-model="settings.hours_lundi" type="text" /></div>
          <div class="field"><label>Mardi</label><input v-model="settings.hours_mardi" type="text" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Mercredi</label><input v-model="settings.hours_mercredi" type="text" /></div>
          <div class="field"><label>Jeudi</label><input v-model="settings.hours_jeudi" type="text" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Vendredi</label><input v-model="settings.hours_vendredi" type="text" /></div>
          <div class="field"><label>Samedi</label><input v-model="settings.hours_samedi" type="text" /></div>
        </div>
        <div class="field"><label>Dimanche</label><input v-model="settings.hours_dimanche" type="text" /></div>
      </div>
    </div>

    <div class="panel">
      <h3>Coordonnées</h3>
      <div class="form" style="background: transparent; border: 0; box-shadow: none; padding: 0;">
        <div class="field"><label>Adresse</label><input v-model="settings.contact_address" type="text" /></div>
        <div class="field-row">
          <div class="field"><label>Téléphone</label><input v-model="settings.contact_phone" type="tel" /></div>
          <div class="field"><label>Email</label><input v-model="settings.contact_email" type="email" /></div>
        </div>
      </div>
    </div>

    <div class="panel">
      <h3>Pied de page</h3>
      <div class="form" style="background: transparent; border: 0; box-shadow: none; padding: 0;">
        <div class="field">
          <label>Mentions / copyright</label>
          <input v-model="settings.footer_copyright" type="text" placeholder="© 2026 Asso Le Bistrot de Tatina · SIRET …" />
        </div>
        <div class="field-row">
          <div class="field">
            <label>Baseline (à droite)</label>
            <input v-model="settings.footer_baseline" type="text" placeholder="Conçu sur un coin de touret, Annecy" />
          </div>
          <div class="field">
            <label>Lien Bilan (PDF)</label>
            <input v-model="settings.footer_bilan_url" type="url" placeholder="https://…" />
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="btn btn--yellow" @click="save">Enregistrer tout</button>
  </section>
</template>

<script setup lang="ts">
const { apiFetch } = useApi();
const { username } = useAuth();
const { show } = useToast();

const toggles = reactive<Record<string, boolean>>({
  transparency: false,
  adhesion: false,
  concerts: false,
  agenda: false,
  gallery: false,
  fermeture: false,
});

const socials = reactive({ instagram: "", facebook: "" });

async function load() {
  try {
    const data = await apiFetch<Record<string, string>>("/settings");
    Object.keys(toggles).forEach((k) => {
      toggles[k] = data[`toggle_${k}`] === "true";
    });
    socials.instagram = data.social_instagram || "";
    socials.facebook = data.social_facebook || "";
  } catch {}
}
onMounted(load);

async function save() {
  const body: Record<string, string> = {};
  Object.keys(toggles).forEach((k) => {
    body[`toggle_${k}`] = String(toggles[k]);
  });
  body.social_instagram = socials.instagram;
  body.social_facebook = socials.facebook;
  try {
    await apiFetch("/settings", { method: "PATCH", body });
    show("Paramètres enregistrés.");
  } catch {
    show("Erreur enregistrement.", true);
  }
}
</script>

<template>
  <section class="admin-section is-active">
    <header class="admin-header">
      <div>
        <h2>Réglages</h2>
        <p>Quelques boutons pour bricoler la maison.</p>
      </div>
    </header>

    <div class="panel">
      <h3>Visibilité</h3>
      <div class="toggles">
        <label><span>Afficher les chiffres de transparence sur le site</span><input v-model="toggles.transparency" type="checkbox" /></label>
        <label><span>Afficher la section agenda</span><input v-model="toggles.agenda" type="checkbox" /></label>
        <label><span>Activer le formulaire de pré-adhésion</span><input v-model="toggles.adhesion" type="checkbox" /></label>
        <label><span>Activer la programmation publique de concert</span><input v-model="toggles.concerts" type="checkbox" /></label>
        <label><span>Afficher la galerie photo</span><input v-model="toggles.gallery" type="checkbox" /></label>
        <label><span>Mode "fermeture estivale exceptionnelle"</span><input v-model="toggles.fermeture" type="checkbox" /></label>
      </div>
      <button type="button" class="btn btn--yellow" style="margin-top:16px;" @click="save">Enregistrer</button>
    </div>

    <div class="panel">
      <h3>Réseaux sociaux</h3>
      <form class="form" style="background:transparent;border:0;box-shadow:none;padding:0;">
        <div class="field">
          <label>Instagram (URL complète)</label>
          <input v-model="socials.instagram" type="url" placeholder="https://instagram.com/bistrotdetatina" />
        </div>
        <div class="field">
          <label>Facebook (URL complète)</label>
          <input v-model="socials.facebook" type="url" placeholder="https://facebook.com/bistrotdetatina" />
        </div>
        <button type="button" class="btn btn--yellow" @click="save">Enregistrer</button>
      </form>
    </div>

    <div class="panel">
      <h3>Compte</h3>
      <form class="form" style="background: transparent; border: 0; box-shadow: none; padding: 0;">
        <div class="field"><label>Identifiant</label><input type="text" :value="username || ''" readonly /></div>
        <div class="field"><label>Nouveau mot de passe</label><input type="password" placeholder="••••••••" /></div>
        <button type="button" class="btn btn--yellow">Mettre à jour</button>
      </form>
    </div>
  </section>
</template>

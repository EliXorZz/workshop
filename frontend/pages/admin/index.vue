<script setup lang="ts">
definePageMeta({ layout: false });

useHead({
  title: "Espace gestion",
  bodyAttrs: { class: "admin-login" },
});

const { apiFetch } = useApi();
const { login } = useAuth();

const username = ref("admin");
const password = ref("");
const submitting = ref(false);
const note = ref({ text: "Identifiant et mot de passe fournis par l'équipe.", cls: "" });

onMounted(() => {
  if (sessionStorage.getItem("tatina_token")) {
    navigateTo("/admin/dashboard");
  }
});

async function onSubmit() {
  submitting.value = true;
  note.value = { text: "Connexion…", cls: "" };
  try {
    const json = await apiFetch<{ token: string; username: string }>("/auth/login", {
      method: "POST",
      body: { username: username.value.trim(), password: password.value },
    });
    login(json.token);
    note.value = { text: "Container déverrouillé…", cls: "is-ok" };
    setTimeout(() => navigateTo("/admin/dashboard"), 400);
  } catch (err: any) {
    const msg = err?.data?.error || "Serveur inaccessible. Vérifie que l'API tourne sur le port 3001.";
    note.value = { text: msg, cls: "is-err" };
    submitting.value = false;
  }
}
</script>

<template>
  <div>
    <div class="hazard-bar" aria-hidden="true"></div>

    <div class="login-shell">
      <NuxtLink to="/" class="login-back">← Retour au site</NuxtLink>

      <div class="login-card">
        <div class="login-card__head">
          <div class="logo-mark logo-mark--lg" aria-hidden="true">
            <span class="rivet"></span><span class="rivet"></span>
            <span class="rivet"></span><span class="rivet"></span>
            BT
          </div>
          <h1>Espace<br/>gestion</h1>
          <p>Réservé à l'équipe du Bistrot de Tatina. Login unique, partagé par l'asso.</p>
        </div>

        <form class="form" novalidate @submit.prevent="onSubmit">
          <div class="field">
            <label for="user">Identifiant</label>
            <input
              id="user"
              v-model="username"
              type="text"
              required
              autocomplete="username"
            />
          </div>
          <div class="field">
            <label for="pass">Mot de passe</label>
            <input
              id="pass"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn btn--yellow btn--lg"
            style="width: 100%; justify-content: center;"
            :disabled="submitting"
          >
            {{ submitting ? "Connexion…" : "Ouvrir le container" }}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
          </button>

          <p class="form__note" :class="note.cls">{{ note.text }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

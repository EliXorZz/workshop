<script setup lang="ts">
const config = useRuntimeConfig();
const { data: settings } = await useFetch<Record<string, string>>("/settings", {
  baseURL: config.public.apiBase,
  default: () => ({}),
  key: "settings-shared",
});

const phone = computed(() => settings.value?.contact_phone || "04 50 00 00 00");
const phoneHref = computed(() => `tel:${phone.value.replace(/\s/g, "")}`);
const email = computed(() => settings.value?.contact_email || "bonjour@bistrot-tatina.fr");
</script>

<template>
  <footer class="footer">
    <div class="wrap footer__wrap">
      <div class="footer__brand">
        <div class="logo-mark logo-mark--lg" aria-hidden="true">
          <span class="rivet"></span><span class="rivet"></span>
          <span class="rivet"></span><span class="rivet"></span>
          TT
        </div>
        <p>
          <strong>Le Bistrot de Tatina</strong> — bar associatif d'Annecy.<br/>
          On a soudé un bistrot dans un container. On y reste.
        </p>
      </div>

      <div class="footer__cols">
        <div>
          <h4>Visite</h4>
          <a href="#histoire">L'histoire</a>
          <a href="#agenda">Agenda</a>
          <a href="#menu">Menu</a>
          <a href="#assos">Nos assos</a>
        </div>
        <div>
          <h4>Asso</h4>
          <a href="#adhesion">Adhérer</a>
          <a href="#">Bilan 2025 (PDF)</a>
          <a href="#">Statuts</a>
          <NuxtLink to="/admin">Espace gestion</NuxtLink>
        </div>
        <div>
          <h4>Contact</h4>
          <a :href="phoneHref">{{ phone }}</a>
          <a :href="`mailto:${email}`">{{ email }}</a>
          <a href="#concert">Programmer un concert</a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <span>© 2026 Asso Le Bistrot de Tatina · SIRET ███ ███ ███ 00012</span>
      <span class="footer__chalk">Conçu sur un coin de touret — Annecy</span>
    </div>
  </footer>
</template>

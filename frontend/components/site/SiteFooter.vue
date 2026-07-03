<script setup lang="ts">
const apiBase = useApiBase();
const { data: settings } = await useFetch<Record<string, string>>("/settings", {
  baseURL: apiBase,
  default: () => ({}),
  key: "settings-shared",
});

const phone = computed(() => settings.value?.contact_phone || "07.89.06.06.44");
const phoneHref = computed(() => `tel:${phone.value.replace(/[.\s]/g, "")}`);
const email = computed(() => settings.value?.contact_email || "bonjour@bistrot-tatina.fr");
const bilanUrl = computed(() => settings.value?.footer_bilan_url || "#");
const copyright = computed(
  () => settings.value?.footer_copyright || "© 2026 Asso Le Bistrot de Tatina · SIRET ███ ███ ███ 00012",
);
const baseline = computed(
  () => settings.value?.footer_baseline || "Conçu sur un coin de touret, Annecy",
);
</script>

<template>
  <footer class="footer">
    <div class="wrap footer__wrap">
      <div class="footer__brand">
        <div class="logo-mark logo-mark--lg" aria-hidden="true">
          <span class="rivet"></span><span class="rivet"></span>
          <span class="rivet"></span><span class="rivet"></span>
          BT
        </div>
        <p>
          <strong>Le Bistrot de Tatina</strong>, bar associatif d'Annecy.<br/>
          On a soudé un bistrot dans un container. On y reste.
        </p>
      </div>

      <div class="footer__cols">
        <div>
          <h4>Visite</h4>
          <a href="#histoire">L'histoire</a>
          <a href="#agenda">Agenda</a>
          <a href="#menu">Menu</a>
          <a href="#assos">Nos dons</a>
        </div>
        <div>
          <h4>Asso</h4>
          <a href="#adhesion">Adhérer</a>
          <a :href="bilanUrl" target="_blank" rel="noopener">Bilan 2025 (PDF)</a>
          <a href="#histoire">L'histoire</a>
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
      <span>{{ copyright }}</span>
      <span class="footer__chalk">{{ baseline }}</span>
    </div>
  </footer>
</template>

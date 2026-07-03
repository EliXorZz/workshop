<script setup lang="ts">
interface Bilan {
  id: number;
  year: number;
  title: string;
  file_url: string;
  created_at: string;
}

useHead({
  title: "Bilans annuels · Le Bistrot de Tatina",
  meta: [
    { name: "description", content: "Bilans financiers annuels du Bistrot de Tatina, bar associatif d'Annecy. Transparence totale sur les comptes de l'association." },
  ],
});

const apiBase = useApiBase();
const { data: bilans } = await useFetch<Bilan[]>("/bilans", {
  baseURL: apiBase,
  key: "bilans-list",
  default: () => [],
});

const fileBase = computed(() => apiBase.replace("/api", ""));
</script>

<template>
  <section class="bilans-page">
    <div class="wrap">
      <div class="section-label">
        <span class="num">BT</span>
        <span class="tag">TRANSPARENCE</span>
      </div>

      <h1 class="h-display">Bilans <span class="hl">annuels.</span></h1>
      <p class="bilans-intro">
        Chaque euro de bénéfice est reversé aux associations locales.
        Retrouvez ici l'intégralité de nos bilans financiers.
      </p>

      <div v-if="!bilans || bilans.length === 0" class="bilans-empty">
        <p>Aucun bilan disponible pour le moment.</p>
      </div>

      <ul v-else class="bilans-list">
        <li v-for="b in bilans" :key="b.id" class="bilans-item">
          <div class="bilans-item__year">{{ b.year }}</div>
          <div class="bilans-item__info">
            <strong>{{ b.title }}</strong>
          </div>
          <a
            :href="`${fileBase}${b.file_url}`"
            target="_blank"
            rel="noopener"
            class="btn btn--yellow"
          >
            Télécharger (PDF)
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16l-4-4h3V4h2v8h3l-4 4zm-6 4v-2h12v2H6z" fill="currentColor"/></svg>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.bilans-page {
  min-height: 80vh;
  padding: 5rem 0 4rem;
  background: var(--clr-dark);
  color: var(--clr-chalk);
}

.bilans-back {
  display: inline-block;
  color: var(--clr-chalk);
  opacity: .6;
  font-size: .875rem;
  letter-spacing: .04em;
  text-decoration: none;
  margin-bottom: 2.5rem;
  transition: opacity .2s;
}
.bilans-back:hover { opacity: 1; }

.bilans-intro {
  max-width: 540px;
  margin: 1rem 0 3rem;
  opacity: .75;
  line-height: 1.7;
}

.bilans-empty {
  opacity: .5;
  font-style: italic;
}

.bilans-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bilans-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 4px;
  flex-wrap: wrap;
}

.bilans-item__year {
  font-size: 1.75rem;
  font-weight: 800;
  font-family: var(--font-display, monospace);
  color: var(--clr-yellow, #f5c842);
  min-width: 4rem;
}

.bilans-item__info {
  flex: 1;
  font-size: 1rem;
}

.bilans-item .btn svg {
  width: 18px;
  height: 18px;
  margin-left: .4rem;
}
</style>

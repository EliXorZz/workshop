<script setup lang="ts">
interface Bilan {
  id: number;
  year: number;
  title: string;
  file_url: string;
}

const props = withDefaults(
  defineProps<{
    memberCount: number;
    membershipPrice?: number;
    showTransparence?: boolean;
    latestBilan?: Bilan | null;
    apiBase?: string;
  }>(),
  { membershipPrice: 15, showTransparence: true, latestBilan: null, apiBase: "" },
);

const bilanHref = computed(() => {
  if (!props.latestBilan) return null;
  return `${props.apiBase.replace("/api", "")}${props.latestBilan.file_url}`;
});
</script>

<template>
  <section class="story" id="histoire">
    <div class="wrap">
      <div class="section-label section-label--light">
        <span class="num">02</span>
        <span class="tag">L'HISTOIRE</span>
      </div>

      <div class="story__grid">
        <div class="story__text reveal">
          <h2 class="h-display">D'une ancienne cour <br/><span class="hl">à un repère atypique.</span></h2>
          <p>
            En 2022, des amis ont eu une idée un peu folle : transformer la cour
            d'un atelier de chaudronnerie en bistrot associatif. Des conteneurs aménagés,
            des portes jaunes atypiques, du mobilier dépareillé, et un lieu unique
            <em>façonné à la main</em>.
          </p>
          <p>
            Le projet vit aujourd'hui grâce à une quinzaine de bénévoles.
            Le Bistrot de Tatina, ce sont des soirées vibrantes qui rassemblent entre 120 et 130 personnes debout,
            de la bonne humeur, et <strong>chaque euro de bénéfice directement reversé aux associations locales</strong>.
          </p>
          <a href="#assos" class="link-underline">Voir les associations soutenues →</a>
        </div>

        <div class="story__photo reveal">
          <img src="/img/IMG_3047.jpg" alt="L'entrée du Bistrot de Tatina, containers et portes jaunes" loading="lazy" />
        </div>
      </div>

      <div class="story__numbers">
        <div class="stat reveal">
          <span class="stat__value"><span class="counter" data-to="2022" data-decimals="0">2022</span></span>
          <span class="stat__label">année de naissance</span>
        </div>
        <div class="stat reveal">
          <span class="stat__value"><span class="counter" data-to="15">15</span></span>
          <span class="stat__label">bénévoles</span>
        </div>
        <div class="stat reveal">
          <span class="stat__value"><span class="counter" :data-to="membershipPrice">{{ membershipPrice }}</span><i>€</i></span>
          <span class="stat__label">montant de l'adhésion</span>
        </div>
        <div class="stat reveal">
          <span class="stat__value"><span class="counter" :data-to="memberCount">{{ memberCount }}</span></span>
          <span class="stat__label">adhérents</span>
        </div>
      </div>

      <div v-if="showTransparence" class="transparence reveal">
        <div class="transparence__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
        </div>
        <div>
          <strong>Transparence totale.</strong> Chaque année, les comptes de l'association sont rendus publics.
          <template v-if="latestBilan && bilanHref">
            <a :href="bilanHref" target="_blank" rel="noopener" class="link-underline">
              Télécharger le {{ latestBilan.title }} →
            </a>
            <NuxtLink to="/bilans" class="link-underline" style="margin-left:1.5rem;">
              Voir tous les bilans →
            </NuxtLink>
          </template>
          <NuxtLink v-else to="/bilans" class="link-underline">Voir tous les bilans →</NuxtLink>
        </div>
      </div>
    </div>
  </section>

  <div class="photo-strip">
    <img src="/img/IMG_3050.jpg" alt="Le Bistrot de Tatina, ambiance et lieu" loading="lazy" />
    <div class="photo-strip__label">
      <span>Le Bistrot de Tatina · Annecy</span>
    </div>
  </div>
</template>

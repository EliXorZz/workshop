<template>
  <section class="assos" id="assos">
    <div class="wrap">
      <div class="section-label">
        <span class="num">07</span>
        <span class="tag">ASSOS SOUTENUES</span>
      </div>

      <h2 class="h-display">Chaque pinte tirée <br/><span class="hl">tire la corde du bien.</span></h2>
      <p class="lead">
        100% des bénéfices du Bistrot sont reversés à des associations locales
        qui luttent contre le cancer et accompagnent les patients et leurs proches.
      </p>

      <div class="assos__grid">
        <template v-if="assos.length > 0">
          <article v-for="a in assos" :key="a.id" class="asso reveal is-revealed">
            <div class="asso__head">
              <div class="asso__logo">{{ initials(a.name) }}</div>
              <h3>{{ a.name }}</h3>
            </div>
            <p v-if="a.description">{{ a.description }}</p>
            <div class="asso__meta">
              <span><b>{{ formatAmount(a.amount_2026) }} €</b> reversés en 2026</span>
              <a v-if="a.website_url" :href="a.website_url" target="_blank" rel="noopener" class="btn btn--mini btn--yellow">
                Faire un don
              </a>
            </div>
          </article>
        </template>
        <template v-else>
          <article class="asso reveal">
            <div class="asso__head">
              <div class="asso__logo">CH</div>
              <h3>Hôpital d'Annecy · CHANGE</h3>
            </div>
            <p>Soutien à l'unité d'oncologie : matériel de confort, salles d'attente repensées, accompagnement des familles.</p>
            <div class="asso__bar"><span style="--p:62%"></span></div>
            <div class="asso__meta"><span><b>6 200 €</b> reversés en 2025</span></div>
          </article>
          <article class="asso reveal">
            <div class="asso__head">
              <div class="asso__logo">LC</div>
              <h3>Ligue contre le cancer · 74</h3>
            </div>
            <p>Prévention, recherche, accompagnement des malades à domicile. Partenaire historique du Bistrot depuis 2023.</p>
            <div class="asso__bar"><span style="--p:48%"></span></div>
            <div class="asso__meta"><span><b>4 800 €</b> reversés en 2025</span></div>
          </article>
          <article class="asso reveal">
            <div class="asso__head">
              <div class="asso__logo">AP</div>
              <h3>Aide aux Personnes, Annecy</h3>
            </div>
            <p>Sorties, repas, ateliers pour personnes isolées ou en convalescence. Une part de chaque soirée leur revient.</p>
            <div class="asso__bar"><span style="--p:31%"></span></div>
            <div class="asso__meta"><span><b>3 100 €</b> reversés en 2025</span></div>
          </article>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Asso {
  id: number
  name: string
  description?: string
  amount_2026?: number
  website_url?: string
}

const props = defineProps<{ assos: Asso[] }>()

const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const formatAmount = (amount?: number) =>
  Number(amount || 0).toLocaleString('fr-FR')
</script>

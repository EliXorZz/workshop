<script setup lang="ts">
interface Association {
  id: number;
  name: string;
  description?: string | null;
  amount_2026?: number | string | null;
  website_url?: string | null;
}

const props = defineProps<{ associations: Association[] }>();

interface DecoratedAsso extends Association {
  initials: string;
  amountText: string;
}

const decorated = computed<DecoratedAsso[]>(() =>
  props.associations.map((a) => ({
    ...a,
    initials: a.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase(),
    amountText: Number(a.amount_2026 || 0).toLocaleString("fr-FR"),
  })),
);
</script>

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
        <article v-for="a in decorated" :key="a.id" class="asso reveal is-revealed">
          <div class="asso__head">
            <div class="asso__logo">{{ a.initials }}</div>
            <h3>{{ a.name }}</h3>
          </div>
          <p v-if="a.description">{{ a.description }}</p>
          <div class="asso__meta">
            <span><b>{{ a.amountText }} €</b> reversés en 2026</span>
            <a
              v-if="a.website_url"
              :href="a.website_url"
              target="_blank"
              rel="noopener"
              class="btn btn--mini btn--yellow"
            >
              Faire un don
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

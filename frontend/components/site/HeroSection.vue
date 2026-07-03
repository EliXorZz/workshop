<script setup lang="ts">
withDefaults(defineProps<{ memberCount: number; showAgenda?: boolean }>(), { showAgenda: true });

const doorLeft = ref<HTMLElement | null>(null);
const doorRight = ref<HTMLElement | null>(null);
let raf: number | null = null;

function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    const y = window.scrollY;
    const factor = Math.min(1, y / 600);
    if (doorLeft.value) {
      doorLeft.value.style.setProperty("--parallax", String(factor));
      doorLeft.value.style.transform = `translateX(${-2 - factor * 40}%)`;
    }
    if (doorRight.value) {
      doorRight.value.style.setProperty("--parallax", String(factor));
      doorRight.value.style.transform = `translateX(${2 + factor * 40}%)`;
    }
    raf = null;
  });
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <section class="hero" id="top">
    <div class="hero__bg" aria-hidden="true">
      <div class="hero__grid"></div>
      <div class="hero__noise"></div>
    </div>

    <div class="container-doors" aria-hidden="true">
      <div class="door door--left" ref="doorLeft">
        <div class="door__panel">
          <span class="door__rivet"></span><span class="door__rivet"></span>
          <span class="door__rivet"></span><span class="door__rivet"></span>
          <div class="door__stencil">BISTROT DE TATINA</div>
          <div class="door__bars"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="door door--right" ref="doorRight">
        <div class="door__panel">
          <span class="door__rivet"></span><span class="door__rivet"></span>
          <span class="door__rivet"></span><span class="door__rivet"></span>
          <div class="door__stencil">FORGE EN 2022</div>
          <div class="door__bars"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
    </div>

    <div class="hero__content">
      <div class="hero__kicker">
        <span class="dot"></span> Bar associatif · Annecy (Meythet) · depuis 2022
      </div>
      <h1 class="hero__title">
        <span class="line">On a soudé</span>
        <span class="line"><em>un bistrot</em></span>
        <span class="line">dans un <mark>container</mark>.</span>
      </h1>
      <p class="hero__sub">
        Containers réaménagés, portes jaunes, mobilier unique et artisanal, ambiance chaudronnerie. <br/>
        Concerts, DJ sets, food trucks. Les bénéfices vont à la lutte contre le cancer.
      </p>

      <div class="hero__ctas">
        <a v-if="showAgenda" class="btn btn--yellow btn--lg" href="#agenda">
          Voir l'agenda
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
        </a>
        <a class="btn btn--ghost btn--lg" href="#histoire">L'histoire du lieu</a>
      </div>
    </div>

    <div class="marquee marquee--hero" aria-hidden="true">
      <div class="marquee__track">
        <span>JEUDI · VENDREDI</span><span aria-hidden="true">✦</span>
        <span>BIÈRES PRESSION</span><span aria-hidden="true">✦</span>
        <span>DJ · ROCK · FOOD TRUCKS</span><span aria-hidden="true">✦</span>
        <span>{{ memberCount }} ADHÉRENTS</span><span aria-hidden="true">✦</span>
        <span>BÉNÉFICES REVERSÉS</span><span aria-hidden="true">✦</span>
        <span>JEUDI · VENDREDI</span><span aria-hidden="true">✦</span>
        <span>BIÈRES PRESSION</span><span aria-hidden="true">✦</span>
        <span>DJ · ROCK · FOOD TRUCKS</span><span aria-hidden="true">✦</span>
        <span>{{ memberCount }} ADHÉRENTS</span><span aria-hidden="true">✦</span>
        <span>BÉNÉFICES REVERSÉS</span><span aria-hidden="true">✦</span>
      </div>
    </div>
  </section>
</template>

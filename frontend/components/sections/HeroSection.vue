<template>
  <section class="hero" id="top">
    <div class="hero__bg" aria-hidden="true">
      <div class="hero__grid"></div>
      <div class="hero__noise"></div>
    </div>

    <div class="container-doors" aria-hidden="true">
      <div class="door door--left">
        <div class="door__panel">
          <span class="door__rivet"></span><span class="door__rivet"></span>
          <span class="door__rivet"></span><span class="door__rivet"></span>
          <div class="door__stencil">TATINA 04</div>
          <div class="door__bars"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="door door--right">
        <div class="door__panel">
          <span class="door__rivet"></span><span class="door__rivet"></span>
          <span class="door__rivet"></span><span class="door__rivet"></span>
          <div class="door__stencil">BISTROT · ASSO · 2022</div>
          <div class="door__bars"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
    </div>

    <div class="hero__content">
      <div class="hero__kicker">
        <span class="dot"></span> Bar associatif · Annecy · depuis 2022
      </div>
      <h1 class="hero__title">
        <span class="line">On a soudé</span>
        <span class="line"><em>un bistrot</em></span>
        <span class="line">dans un <mark>container</mark>.</span>
      </h1>
      <p class="hero__sub">
        Containers réaménagés, portes jaunes, ambiance chaudronnerie. <br/>
        Concerts, DJ sets, food trucks. Les bénéfices vont à la lutte contre le cancer.
      </p>
      <div class="hero__ctas">
        <a class="btn btn--yellow btn--lg" href="#agenda">
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
        <span ref="marqueeMembers">… ADHÉRENTS</span><span aria-hidden="true">✦</span>
        <span>BÉNÉFICES REVERSÉS</span><span aria-hidden="true">✦</span>
        <span>JEUDI · VENDREDI</span><span aria-hidden="true">✦</span>
        <span>BIÈRES PRESSION</span><span aria-hidden="true">✦</span>
        <span>DJ · ROCK · FOOD TRUCKS</span><span aria-hidden="true">✦</span>
        <span aria-hidden="true">… ADHÉRENTS</span><span aria-hidden="true">✦</span>
        <span>BÉNÉFICES REVERSÉS</span><span aria-hidden="true">✦</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ memberCount?: number }>()

const doorLeft = ref<HTMLElement | null>(null)
const doorRight = ref<HTMLElement | null>(null)

let raf: number | null = null

onMounted(() => {
  const doorL = document.querySelector<HTMLElement>('.door--left')
  const doorR = document.querySelector<HTMLElement>('.door--right')

  const handleScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      if (doorL && doorR) {
        const y = window.scrollY
        const factor = Math.min(1, y / 600)
        doorL.style.transform = `translateX(${-2 - factor * 40}%)`
        doorR.style.transform = `translateX(${2 + factor * 40}%)`
      }
      raf = null
    })
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
})

watch(() => props.memberCount, (count) => {
  if (!count) return
  document.querySelectorAll<HTMLElement>('.marquee span').forEach((el) => {
    if (el.textContent?.includes('ADHÉRENTS')) el.textContent = `${count} ADHÉRENTS`
  })
})
</script>

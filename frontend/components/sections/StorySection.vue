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
            d'un atelier de chaudronnerie en bistrot associatif. Quatre containers,
            une entrée jaune signature, des chaises dépareillées, et un esprit <em>cantine d'usine</em> remixé.
          </p>
          <p>
            Le projet a été lancé par les parents fondateurs (la soixantaine, l'énergie de la vingtaine).
            Aujourd'hui, c'est <strong id="statMembersText">… adhérents</strong>, des soirées qui débordent jusqu'au parking,
            et chaque euro de bénéfice qui repart vers les associations locales.
          </p>
          <a href="#assos" class="link-underline">Voir les associations soutenues →</a>
        </div>

        <div class="story__numbers" :style="showTransparency === false ? 'display:none' : ''">
          <div class="stat reveal" data-count="2022">
            <span class="stat__value"><span class="counter" data-to="2022" data-decimals="0">0</span></span>
            <span class="stat__label">année de naissance</span>
          </div>
          <div class="stat reveal" data-count="0">
            <span class="stat__value"><span class="counter" data-to="0" id="statMembers">0</span></span>
            <span class="stat__label">adhérents</span>
          </div>
          <div class="stat reveal" data-count="4">
            <span class="stat__value"><span class="counter" data-to="4">0</span></span>
            <span class="stat__label">containers réaménagés</span>
          </div>
          <div class="stat reveal" data-count="100">
            <span class="stat__value"><span class="counter" data-to="100">0</span><i>%</i></span>
            <span class="stat__label">bénéfices reversés</span>
          </div>
        </div>
      </div>

      <div class="transparence reveal">
        <div class="transparence__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
        </div>
        <div>
          <strong>Transparence totale.</strong> Chaque année, les comptes de l'association sont rendus publics.
          <a href="#" class="link-underline">Télécharger le bilan 2025 →</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  memberCount: number
  showTransparency: boolean
}>()

let counterIO: IntersectionObserver | null = null

function animateCount(el: HTMLElement) {
  const to = Number(el.dataset.to || 0)
  const decimals = Number(el.dataset.decimals || 0)
  const duration = 1600
  const start = performance.now()
  const self = el as any
  self._animId = (self._animId || 0) + 1
  const myId = self._animId

  function step(now: number) {
    if (self._animId !== myId) return
    const p = Math.min(1, (now - start) / duration)
    const ease = 1 - Math.pow(1 - p, 3)
    const value = to * ease
    el.textContent = decimals === 0
      ? Math.floor(value).toLocaleString('fr-FR')
      : value.toFixed(decimals).replace('.', ',')
    if (p < 1) requestAnimationFrame(step)
    else {
      el.textContent = decimals === 0
        ? to.toLocaleString('fr-FR').replace(/\s/g, '')
        : to.toFixed(decimals).replace('.', ',')
    }
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target as HTMLElement)
        counterIO!.unobserve(entry.target)
      }
    })
  }, { threshold: 0.6 })

  document.querySelectorAll<HTMLElement>('.counter').forEach((c) => counterIO!.observe(c))
})

onUnmounted(() => counterIO?.disconnect())

watch(() => props.memberCount, (count) => {
  if (!count) return
  nextTick(() => {
    const el = document.getElementById('statMembers') as HTMLElement | null
    if (el) {
      el.dataset.to = String(count)
      counterIO?.unobserve(el)
      animateCount(el)
    }
    const textEl = document.getElementById('statMembersText')
    if (textEl) textEl.textContent = `${count} adhérent${count > 1 ? 's' : ''}`
  })
})
</script>

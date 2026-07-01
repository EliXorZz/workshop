<template>
  <div>
    <!-- Bannière fermeture estivale -->
    <div
      v-if="settings.toggle_fermeture === 'true'"
      style="background:#F5C518;color:#0f0f0f;text-align:center;padding:10px 16px;font-weight:700;font-size:14px;letter-spacing:.05em;position:sticky;top:0;z-index:200;"
    >
      🔒 Fermeture estivale exceptionnelle, on revient très vite !
    </div>

    <TheNav />

    <main>
      <HeroSection :member-count="memberCount" />
      <ManifestSection />
      <StorySection
        :member-count="memberCount"
        :show-transparency="settings.toggle_transparency !== 'false'"
      />
      <AgendaSection :events="publishedEvents" />
      <MenuSection :menu="menu" />
      <ConcertSection v-if="settings.toggle_concerts !== 'false'" />
      <InfosSection :settings="settings" />
      <AssosSection :assos="assos" />
<AdhesionSection v-if="settings.toggle_adhesion !== 'false'" />
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const BASE = config.public.apiBase

const { data: pageData } = await useAsyncData('home', async () => {
  const [eventsRes, menuRes, assosRes, statsRes, settingsRes] = await Promise.allSettled([
    $fetch<any[]>(`${BASE}/events`),
    $fetch<Record<string, any[]>>(`${BASE}/menu`),
    $fetch<any[]>(`${BASE}/associations`),
    $fetch<any>(`${BASE}/public/stats`),
    $fetch<any>(`${BASE}/settings`)
  ])

  return {
    events:   eventsRes.status   === 'fulfilled' ? eventsRes.value   : [],
    menu:     menuRes.status     === 'fulfilled' ? menuRes.value     : {},
    assos:    assosRes.status    === 'fulfilled' ? assosRes.value    : [],
    stats:    statsRes.status    === 'fulfilled' ? statsRes.value    : {},
    settings: settingsRes.status === 'fulfilled' ? settingsRes.value : {}
  }
}, { default: () => ({ events: [], menu: {}, assos: [], stats: {}, settings: {} }), getCachedData: () => null })

const today = new Date()
today.setHours(0, 0, 0, 0)

const publishedEvents = computed(() =>
  (pageData.value?.events || []).filter((ev: any) =>
    ev.status === 'published' && new Date(ev.event_date + 'T12:00:00') >= today
  )
)

const menu = computed(() => pageData.value?.menu || {})
const assos = computed(() => pageData.value?.assos || [])
const memberCount = computed(() => pageData.value?.stats?.members || 0)
const settings = computed(() => pageData.value?.settings || {})

// Reveal animations (client-side only)
let revealIO: IntersectionObserver | null = null

onMounted(async () => {
  await nextTick()
  const revealEls = document.querySelectorAll('.reveal')
  revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-revealed'); revealIO!.unobserve(e.target) }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  )
  revealEls.forEach((el) => revealIO!.observe(el))
})

onUnmounted(() => revealIO?.disconnect())
</script>

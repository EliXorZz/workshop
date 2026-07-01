<template>
  <section class="agenda" id="agenda">
    <div class="wrap">
      <div class="section-label">
        <span class="num">03</span>
        <span class="tag">AGENDA</span>
      </div>

      <header class="agenda__head">
        <h2 class="h-display">Ce qui se trame <br/><span class="hl">sous la tôle.</span></h2>
        <div class="agenda__filters" role="tablist">
          <button
            v-for="f in filters"
            :key="f.value"
            class="chip"
            :class="{ 'is-active': activeFilter === f.value }"
            :style="!availableFilters.has(f.value) && f.value !== 'all' ? 'display:none' : ''"
            role="tab"
            @click="activeFilter = f.value"
          >{{ f.label }}</button>
        </div>
      </header>

      <div class="agenda__list" id="agendaList">
        <template v-if="displayedEvents.length > 0">
          <article
            v-for="ev in displayedEvents"
            :key="ev.id"
            class="event reveal is-revealed"
            :data-type="typeMap[ev.type] || 'autre'"
          >
            <div class="event__date">
              <span class="event__day">{{ formatDay(ev.event_date) }}</span>
              <span class="event__mo">{{ formatMonth(ev.event_date) }}</span>
            </div>
            <div class="event__main">
              <span class="event__tag" :class="tagMap[ev.type] || ''">
                {{ labelMap[ev.type] || 'Événement' }}{{ ev.artist ? ' · ' + ev.artist : '' }}
              </span>
              <h3>{{ ev.title }}</h3>
              <p v-if="ev.description">{{ ev.description }}</p>
            </div>
          </article>
        </template>
        <p v-else class="agenda__note" style="text-align:center;padding:60px 0;">
          Aucun événement à venir pour l'instant, revenez bientôt !
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Event {
  id: number
  title: string
  type: string
  event_date: string
  time_start?: string
  time_end?: string
  description?: string
  artist?: string
  status: string
}

const props = defineProps<{ events: Event[] }>()

const MO = ['JAN','FÉV','MAR','AVR','MAI','JUIN','JUIL','AOÛ','SEP','OCT','NOV','DÉC']
const typeMap: Record<string, string> = { concert: 'concert', djset: 'dj', foodtruck: 'food', horlesmurs: 'hors', autre: 'autre' }
const tagMap: Record<string, string>  = { concert: 'tag--concert', djset: 'tag--dj', foodtruck: 'tag--food', horlesmurs: 'tag--hors' }
const labelMap: Record<string, string> = { concert: 'Concert', djset: 'DJ Set', foodtruck: 'Food Truck', horlesmurs: 'Hors les murs', autre: 'Événement' }

const filters = [
  { value: 'all', label: 'Tout' },
  { value: 'concert', label: 'Concerts' },
  { value: 'dj', label: 'DJ sets' },
  { value: 'food', label: 'Food trucks' },
  { value: 'hors', label: 'Hors les murs' }
]

const activeFilter = ref('all')

const availableFilters = computed(() => {
  const set = new Set<string>()
  props.events.forEach((ev) => set.add(typeMap[ev.type] || 'autre'))
  return set
})

const displayedEvents = computed(() => {
  if (activeFilter.value === 'all') return props.events
  return props.events.filter((ev) => (typeMap[ev.type] || 'autre') === activeFilter.value)
})

function formatDay(date: string) {
  return String(new Date(date + 'T12:00:00').getDate()).padStart(2, '0')
}
function formatMonth(date: string) {
  return MO[new Date(date + 'T12:00:00').getMonth()]
}
</script>

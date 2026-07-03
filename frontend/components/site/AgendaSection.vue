<script setup lang="ts">
interface Event {
  id: number;
  title: string;
  type: string;
  event_date: string;
  time_start?: string | null;
  time_end?: string | null;
  description?: string | null;
  artist?: string | null;
  status: string;
}

const props = defineProps<{ events: Event[] }>();

const FILTER: Record<string, string> = {
  concert: "concert",
  djset: "dj",
  foodtruck: "food",
  horlesmurs: "hors",
  autre: "autre",
};
const TAG: Record<string, string> = {
  concert: "tag--concert",
  djset: "tag--dj",
  foodtruck: "tag--food",
  horlesmurs: "tag--hors",
};
const LABEL: Record<string, string> = {
  concert: "Concert",
  djset: "DJ Set",
  foodtruck: "Food Truck",
  horlesmurs: "Hors les murs",
  autre: "Événement",
};
const MO = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛ", "SEP", "OCT", "NOV", "DÉC"];

const activeFilter = ref("all");

interface DecoratedEvent extends Event {
  displayType: string;
  tagClass: string;
  label: string;
  day: string;
  month: string;
  timeText: string;
}

const decorated = computed<DecoratedEvent[]>(() =>
  props.events.map((ev) => {
    const d = new Date(ev.event_date + "T12:00:00");
    return {
      ...ev,
      displayType: FILTER[ev.type] || "autre",
      tagClass: TAG[ev.type] || "",
      label: LABEL[ev.type] || ev.type,
      day: String(d.getDate()).padStart(2, "0"),
      month: MO[d.getMonth()],
      timeText: ev.time_start
        ? `${ev.time_start}${ev.time_end ? " → " + ev.time_end : ""}`
        : "",
    };
  }),
);

const presentTypes = computed(() => new Set(decorated.value.map((ev) => ev.displayType)));

const filtered = computed(() =>
  activeFilter.value === "all"
    ? decorated.value
    : decorated.value.filter((ev) => ev.displayType === activeFilter.value),
);

const filters = [
  { key: "all", label: "Tout" },
  { key: "concert", label: "Concerts" },
  { key: "dj", label: "DJ sets" },
  { key: "food", label: "Food trucks" },
  { key: "hors", label: "Hors les murs" },
];

function visibleFilter(key: string) {
  return key === "all" || presentTypes.value.has(key);
}
</script>

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
            :key="f.key"
            class="chip"
            :class="{ 'is-active': activeFilter === f.key }"
            :style="visibleFilter(f.key) ? undefined : { display: 'none' }"
            role="tab"
            @click="activeFilter = f.key"
          >
            {{ f.label }}
          </button>
        </div>
      </header>

      <div class="agenda__list" id="agendaList">
        <template v-if="filtered.length === 0">
          <p class="agenda__note" style="text-align:center;padding:60px 0;">
            Aucun événement à venir pour l'instant. Revenez bientôt !
          </p>
        </template>
        <template v-else>
          <article
            v-for="ev in filtered"
            :key="ev.id"
            class="event reveal is-revealed"
            :data-type="ev.displayType"
          >
            <div class="event__date">
              <span class="event__day">{{ ev.day }}</span>
              <span class="event__mo">{{ ev.month }}</span>
            </div>
            <div class="event__main">
              <span class="event__tag" :class="ev.tagClass">{{ ev.label }}</span>
              <h3>{{ ev.title }}</h3>
              <div v-if="ev.artist" class="event__artist">{{ ev.artist }}</div>
              <p v-if="ev.description">{{ ev.description }}</p>
              <div v-if="ev.timeText" class="event__meta">
                <span>{{ ev.timeText }}</span>
              </div>
            </div>
          </article>
        </template>
      </div>

      <p class="agenda__note">
        Les <em>réservations se font par téléphone</em>, comme dans un vrai bistrot.
        <a href="#infos" class="link-underline">Voir le numéro →</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.event__artist {
  font-family: var(--font-typewriter, monospace);
  font-size: 13px;
  color: var(--concrete, #E9E4DC);
  opacity: 0.75;
  margin: -4px 0 8px;
  overflow-wrap: anywhere;
}
</style>

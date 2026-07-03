<script setup lang="ts">
interface Settings {
  hours_lundi?: string;
  hours_mardi?: string;
  hours_mercredi?: string;
  hours_jeudi?: string;
  hours_vendredi?: string;
  hours_samedi?: string;
  hours_dimanche?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
  social_instagram?: string;
  social_facebook?: string;
}

const props = defineProps<{ settings: Settings }>();

const jours = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

const hasHoursData = computed(() =>
  jours.some((j) => (props.settings as any)[`hours_${j.key}`]),
);

const schedule = computed(() => {
  if (!hasHoursData.value) {
    // Valeurs par défaut d'origine
    return [
      { label: "Lun – Mer", value: "Fermé", isOpen: false },
      { label: "Jeudi", value: "18h → 00h", isOpen: true },
      { label: "Vendredi", value: "18h → 01h", isOpen: true },
      { label: "Samedi", value: "Événements ponctuels", isOpen: false },
      { label: "Dimanche", value: "Fermé", isOpen: false },
    ];
  }
  return jours.map(({ key, label }) => {
    const val = (props.settings as any)[`hours_${key}`] || "Fermé";
    const isOpen = val !== "Fermé" && val.trim() !== "";
    return { label, value: val, isOpen };
  });
});

const phone = computed(() => props.settings.contact_phone || "07.89.06.06.44");
const phoneHref = computed(() => `tel:${phone.value.replace(/[.\s]/g, "")}`);
const email = computed(() => props.settings.contact_email || "bonjour@bistrot-tatina.fr");
const address = computed(() =>
  props.settings.contact_address ||
  "2 allée des Morilles, Meythet\n74960 Annecy",
);

const addressLines = computed(() => address.value.split("\n"));

const mapsUrl = computed(() => {
  const query = encodeURIComponent(address.value.replace(/\n/g, ", "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
});

const instagram = computed(() => props.settings.social_instagram || "");
const facebook = computed(() => props.settings.social_facebook || "");
</script>

<template>
  <section class="infos" id="infos">
    <div class="wrap">
      <div class="section-label section-label--light">
        <span class="num">06</span>
        <span class="tag">INFOS PRATIQUES</span>
      </div>

      <div class="infos__grid">
        <div class="infos__card reveal">
          <div class="infos__icon">⏱</div>
          <h3>Horaires d'été</h3>
          <ul class="schedule">
            <li
              v-for="(row, i) in schedule"
              :key="i"
              :class="{ 'is-open': row.isOpen }"
            >
              <span>{{ row.label }}</span>
              <span>{{ row.value }}</span>
            </li>
          </ul>
          <p class="muted">En hiver, des soirées spéciales sont annoncées dans l'agenda.</p>
        </div>

        <div class="infos__card reveal">
          <div class="infos__icon">📍</div>
          <h3>Où nous trouver</h3>
          <p class="address">
            <template v-for="(line, i) in addressLines" :key="i">
              <template v-if="i === 0"><strong>{{ line }}</strong></template>
              <template v-else>{{ line }}</template>
              <br v-if="i < addressLines.length - 1" />
            </template>
            <br />
            <em>Cherche les portes jaunes.</em>
          </p>
          <a :href="mapsUrl" target="_blank" rel="noopener" class="link-underline">Itinéraire (Maps) →</a>
        </div>

        <div class="infos__card reveal">
          <div class="infos__icon">☎</div>
          <h3>Réservation</h3>
          <p>
            Pas de réservation en ligne, comme un vrai bistrot.<br/>
            Appelez-nous, c'est plus chaleureux.
          </p>
          <a :href="phoneHref" class="phone-big">{{ phone }}</a>
        </div>

        <div class="infos__card reveal">
          <div class="infos__icon">✉</div>
          <h3>Nous écrire</h3>
          <p>Pour la presse, les partenariats ou un coup de gueule constructif.</p>
          <a :href="`mailto:${email}`" class="link-underline">{{ email }} →</a>
          <div class="socials">
            <a v-if="instagram" :href="instagram" target="_blank" rel="noopener" aria-label="Instagram">IG</a>
            <a v-else aria-label="Instagram" style="opacity:.35;pointer-events:none;">IG</a>
            <a v-if="facebook" :href="facebook" target="_blank" rel="noopener" aria-label="Facebook">FB</a>
            <a v-else aria-label="Facebook" style="opacity:.35;pointer-events:none;">FB</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

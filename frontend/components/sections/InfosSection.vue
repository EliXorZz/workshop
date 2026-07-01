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
            <template v-if="hasHours">
              <li
                v-for="jour in jours"
                :key="jour.key"
                :class="{ 'is-open': isOpen(settings[`hours_${jour.key}`]) }"
              >
                <span>{{ jour.label }}</span>
                <span>{{ settings[`hours_${jour.key}`] || 'Fermé' }}</span>
              </li>
            </template>
            <template v-else>
              <li><span>Lun – Mer</span><span>Fermé</span></li>
              <li class="is-open"><span>Jeudi</span><span>18h → 00h</span></li>
              <li class="is-open"><span>Vendredi</span><span>18h → 01h</span></li>
              <li><span>Samedi</span><span>Événements ponctuels</span></li>
              <li><span>Dimanche</span><span>Fermé</span></li>
            </template>
          </ul>
          <p class="muted">En hiver, des soirées spéciales sont annoncées dans l'agenda.</p>
        </div>

        <div class="infos__card reveal">
          <div class="infos__icon">📍</div>
          <h3>Où nous trouver</h3>
          <p class="address" v-html="addressHtml"></p>
          <a :href="mapsUrl" target="_blank" rel="noopener" class="link-underline" id="mapsLink">
            Itinéraire (Maps) →
          </a>
        </div>

        <div class="infos__card reveal">
          <div class="infos__icon">☎</div>
          <h3>Réservation</h3>
          <p>
            Pas de réservation en ligne, comme un vrai bistrot.<br/>
            Appelez-nous, c'est plus chaleureux.
          </p>
          <a :href="`tel:${phoneClean}`" class="phone-big">{{ phone }}</a>
        </div>

        <div class="infos__card reveal">
          <div class="infos__icon">✉</div>
          <h3>Nous écrire</h3>
          <p>Pour la presse, les partenariats ou un coup de gueule constructif.</p>
          <a :href="`mailto:${email}`" class="link-underline">{{ email }} →</a>
          <div class="socials">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="TikTok">TT</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ settings: Record<string, string> }>()

const jours = [
  { key: 'lundi',    label: 'Lundi' },
  { key: 'mardi',    label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi',    label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi',   label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' }
]

const hasHours = computed(() => jours.some((j) => props.settings[`hours_${j.key}`]))

const isOpen = (val?: string) => val && val !== 'Fermé' && val.trim() !== ''

const phone = computed(() => props.settings.contact_phone || '04 50 00 00 00')
const phoneClean = computed(() => phone.value.replace(/\s/g, ''))
const email = computed(() => props.settings.contact_email || 'bonjour@bistrot-tatina.fr')

const addressRaw = computed(() => props.settings.contact_address || 'Rue des Soudeurs, 74000 Annecy')
const addressHtml = computed(() =>
  '<strong>Cour de l\'atelier Chaudronnerie</strong><br/>' +
  addressRaw.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br/>')
)
const mapsUrl = computed(() =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressRaw.value)}`
)
</script>

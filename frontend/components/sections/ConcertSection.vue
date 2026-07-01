<template>
  <section class="concert" id="concert">
    <div class="wrap concert__wrap">
      <div class="concert__intro">
        <div class="section-label">
          <span class="num">05</span>
          <span class="tag">PROGRAMMER UN CONCERT</span>
        </div>
        <h2 class="h-display">T'as un groupe ? <br/><span class="hl">On a une scène en tôle.</span></h2>
        <p>
          On programme du rock, du folk, de l'électro, du chanson, du tout ce qu'on n'a jamais entendu.
          Envoie-nous un mot, on revient vers toi sous 7 jours.
        </p>
        <ul class="concert__bullets">
          <li><span class="dot"></span> Backline minimal fourni (ampli basse + guitare + batterie)</li>
          <li><span class="dot"></span> Petite jauge, ambiance proche du public</li>
          <li><span class="dot"></span> Repas + boissons compris, défraiement possible</li>
        </ul>
      </div>

      <form class="form concert__form" novalidate @submit.prevent="handleSubmit">
        <h3 class="form__title">Fiche groupe</h3>

        <div class="field">
          <label for="bandName">Nom du groupe / projet</label>
          <input v-model="form.bandName" type="text" id="bandName" name="bandName" required placeholder="Les Soudeurs du Dimanche" />
        </div>

        <div class="field-row">
          <div class="field">
            <label for="bandStyle">Style</label>
            <select v-model="form.bandStyle" id="bandStyle" name="bandStyle" required>
              <option value="">Choisir</option>
              <option>Rock / Garage</option>
              <option>Folk / Songwriter</option>
              <option>Électro / DJ set</option>
              <option>Chanson</option>
              <option>Jazz / Soul</option>
              <option>Autre</option>
            </select>
          </div>
          <div class="field">
            <label for="bandSize">Combien sur scène ?</label>
            <input v-model="form.bandSize" type="number" id="bandSize" name="bandSize" min="1" max="20" placeholder="3" />
          </div>
        </div>

        <div class="field">
          <label for="bandLink">Lien d'écoute (YouTube, Bandcamp, Spotify…)</label>
          <input v-model="form.bandLink" type="url" id="bandLink" name="bandLink" required placeholder="https://..." />
        </div>

        <div class="field-row">
          <div class="field">
            <label for="bandEmail">Ton email</label>
            <input v-model="form.bandEmail" type="email" id="bandEmail" name="bandEmail" required placeholder="contact@groupe.fr" />
          </div>
          <div class="field">
            <label for="bandPhone">Téléphone</label>
            <input v-model="form.bandPhone" type="tel" id="bandPhone" name="bandPhone" placeholder="06 …" />
          </div>
        </div>

        <div class="field">
          <label for="bandMsg">Quelques mots</label>
          <textarea v-model="form.bandMsg" id="bandMsg" name="bandMsg" rows="4" placeholder="Disponibilités, fiche technique, anecdote, blague de chantier…"></textarea>
        </div>

        <button type="submit" class="btn btn--yellow btn--lg" :disabled="loading">
          {{ loading ? 'Envoi…' : 'Envoyer la demande' }}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
        </button>
        <p class="form__note" :class="feedback.type">{{ feedback.text }}</p>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { show: showToast } = useToast()

const loading = ref(false)
const feedback = ref({ text: '', type: '' })

const form = reactive({
  bandName: '',
  bandStyle: '',
  bandSize: '',
  bandLink: '',
  bandEmail: '',
  bandPhone: '',
  bandMsg: ''
})

async function handleSubmit() {
  loading.value = true
  feedback.value = { text: '', type: '' }

  try {
    const res = await $fetch<{ message?: string; error?: string }>(
      `${config.public.apiBase}/public/concert-request`,
      {
        method: 'POST',
        body: {
          name: form.bandName,
          email: form.bandEmail,
          phone: form.bandPhone,
          message: `Style: ${form.bandStyle} | Scène: ${form.bandSize} | Lien: ${form.bandLink}\n\n${form.bandMsg}`.trim()
        }
      }
    )
    feedback.value = { text: res.message || 'Demande envoyée !', type: 'is-ok' }
    showToast('Demande envoyée. On revient vers toi sous 7 jours.')
    setTimeout(() => {
      Object.assign(form, { bandName: '', bandStyle: '', bandSize: '', bandLink: '', bandEmail: '', bandPhone: '', bandMsg: '' })
      feedback.value = { text: '', type: '' }
    }, 2400)
  } catch (err: any) {
    const msg = err?.data?.error || 'Une erreur est survenue.'
    feedback.value = { text: msg, type: 'is-err' }
    showToast(msg, true)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="adhesion" id="adhesion">
    <div class="wrap adhesion__wrap">

      <div class="adhesion__visual" aria-hidden="true">
        <div class="card-id">
          <div class="card-id__corner">
            <span class="rivet"></span><span class="rivet"></span>
            <span class="rivet"></span><span class="rivet"></span>
          </div>
          <div class="card-id__top">
            <span>CARTE D'ADHÉRENT · 2026</span>
            <span>N° <i>{{ cardNum }}</i></span>
          </div>
          <div class="card-id__body">
            <div class="card-id__name">
              <span>{{ cardName }}</span>
              <small>membre actif</small>
            </div>
            <div class="card-id__seal">15€</div>
          </div>
          <div class="card-id__foot">
            <span>LE BISTROT DE TATINA, ANNECY</span>
            <span>VALABLE 1 AN</span>
          </div>
        </div>
      </div>

      <div class="adhesion__form">
        <div class="section-label">
          <span class="num">08</span>
          <span class="tag">DEVENIR MEMBRE</span>
        </div>
        <h2 class="h-display">Une carte, une<br/><span class="hl">tribu de soudeurs.</span></h2>
        <p>
          Pour <strong>15€ par an</strong>, vous rejoignez l'asso, vous accédez aux soirées privées,
          vous recevez les programmes et surtout vous soutenez nos causes.
        </p>

        <form class="form" novalidate @submit.prevent="handleSubmit">
          <div class="field-row">
            <div class="field">
              <label for="aFirst">Prénom</label>
              <input v-model="form.first_name" type="text" id="aFirst" name="firstName" required @input="updateCard" />
            </div>
            <div class="field">
              <label for="aLast">Nom</label>
              <input v-model="form.last_name" type="text" id="aLast" name="lastName" required @input="updateCard" />
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="aEmail">Email</label>
              <input v-model="form.email" type="email" id="aEmail" name="email" required />
            </div>
            <div class="field">
              <label for="aPhone">Téléphone (SMS)</label>
              <input v-model="form.phone" type="tel" id="aPhone" name="phone" placeholder="06 …" />
            </div>
          </div>

          <div class="field">
            <label for="aBirth">Date de naissance</label>
            <input v-model="form.birth" type="date" id="aBirth" name="birth" />
          </div>

          <fieldset class="check-list">
            <legend>Je veux recevoir</legend>
            <label class="check"><input type="checkbox" checked /> <span>Le programme par email</span></label>
            <label class="check"><input type="checkbox" /> <span>Les rappels par SMS</span></label>
            <label class="check"><input type="checkbox" /> <span>Les invitations aux apéros privés</span></label>
          </fieldset>

          <label class="check check--legal">
            <input v-model="form.consent" type="checkbox" required />
            <span>J'accepte le règlement de l'association et le traitement de mes données (RGPD).</span>
          </label>

          <button type="submit" class="btn btn--yellow btn--lg" :disabled="loading">
            {{ loading ? 'Envoi…' : 'Pré-adhérer · 15€' }}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
          </button>
          <p class="form__note" :class="feedback.type">{{ feedback.text || 'Le paiement se finalise sur place, à la porte jaune.' }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { show: showToast } = useToast()

const loading = ref(false)
const feedback = ref({ text: '', type: '' })

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  birth: '',
  consent: false
})

const cardName = ref('Votre nom')
const cardNum = ref(genCardNumber())

function genCardNumber() {
  const a = String(Math.floor(Math.random() * 900) + 100)
  const b = String(Math.floor(Math.random() * 900) + 100)
  return `${a}·${b}`
}

function updateCard() {
  const first = form.first_name.trim()
  const last = form.last_name.trim().toUpperCase()
  cardName.value = first || last ? `${first} ${last}`.trim() : 'Votre nom'
}

async function handleSubmit() {
  loading.value = true
  feedback.value = { text: '', type: '' }

  try {
    const res = await $fetch<{ message?: string; error?: string }>(
      `${config.public.apiBase}/public/preadmission`,
      { method: 'POST', body: form }
    )
    feedback.value = { text: res.message || 'Pré-adhésion enregistrée !', type: 'is-ok' }
    showToast('Pré-adhésion enregistrée, rendez-vous à la porte jaune !')
    setTimeout(() => {
      Object.assign(form, { first_name: '', last_name: '', email: '', phone: '', birth: '', consent: false })
      cardName.value = 'Votre nom'
      cardNum.value = genCardNumber()
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

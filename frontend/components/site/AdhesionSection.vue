<script setup lang="ts">
const { apiFetch } = useApi();
const { show } = useToast();

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birth: "",
  consent: false,
});

const submitting = ref(false);
const DEFAULT_NOTE = "Le paiement de 15€ se finalise sur place.";
const feedback = ref<{ text: string; ok: boolean } | null>({
  text: DEFAULT_NOTE,
  ok: false,
});
const cardNum = ref("— — —");
const formEl = ref<HTMLFormElement | null>(null);

function genCardNumber() {
  const a = String(Math.floor(Math.random() * 900) + 100);
  const b = String(Math.floor(Math.random() * 900) + 100);
  return `${a}·${b}`;
}

const cardName = computed(() => {
  const first = form.firstName.trim();
  const last = form.lastName.trim().toUpperCase();
  return !first && !last ? "Votre nom" : `${first} ${last}`.trim();
});

onMounted(() => {
  cardNum.value = genCardNumber();
});

async function onSubmit() {
  if (!formEl.value?.checkValidity()) {
    formEl.value?.reportValidity();
    return;
  }
  submitting.value = true;

  try {
    const json = await apiFetch<{ message: string }>("/public/preadmission", {
      method: "POST",
      body: {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        consent: form.consent,
      },
    });
    feedback.value = { text: json.message, ok: true };
    show("Pré-adhésion enregistrée — rendez-vous à la porte jaune !");
    setTimeout(() => {
      form.firstName = "";
      form.lastName = "";
      form.email = "";
      form.phone = "";
      form.birth = "";
      form.consent = false;
      cardNum.value = genCardNumber();
    }, 400);
  } catch (err: any) {
    const msg = err?.data?.error || "Une erreur est survenue.";
    feedback.value = { text: msg, ok: false };
    show(msg, true);
  } finally {
    submitting.value = false;
  }
}
</script>

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
            <span>LE BISTROT DE TATINA — ANNECY</span>
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
          vous recevez les programmes et — surtout — vous soutenez nos causes.
        </p>

        <form ref="formEl" class="form" novalidate @submit.prevent="onSubmit">
          <div class="field-row">
            <div class="field">
              <label for="aFirst">Prénom</label>
              <input id="aFirst" v-model="form.firstName" type="text" required />
            </div>
            <div class="field">
              <label for="aLast">Nom</label>
              <input id="aLast" v-model="form.lastName" type="text" required />
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="aEmail">Email</label>
              <input id="aEmail" v-model="form.email" type="email" required />
            </div>
            <div class="field">
              <label for="aPhone">Téléphone (SMS)</label>
              <input id="aPhone" v-model="form.phone" type="tel" placeholder="06 …" />
            </div>
          </div>

          <div class="field">
            <label for="aBirth">Date de naissance</label>
            <input id="aBirth" v-model="form.birth" type="date" />
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

          <button type="submit" class="btn btn--yellow btn--lg" :disabled="submitting">
            {{ submitting ? "Envoi…" : "Pré-adhérer" }}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
          </button>
          <p
            v-if="feedback"
            class="form__note"
            :class="{ 'is-ok': feedback.ok, 'is-err': !feedback.ok && feedback.text !== DEFAULT_NOTE }"
          >
            {{ feedback.text }}
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { apiFetch } = useApi();
const { show } = useToast();

const form = reactive({
  bandName: "",
  bandStyle: "",
  bandSize: "",
  bandLink: "",
  bandEmail: "",
  bandPhone: "",
  bandMsg: "",
});

const submitting = ref(false);
const feedback = ref<{ text: string; ok: boolean } | null>(null);
const formEl = ref<HTMLFormElement | null>(null);

async function onSubmit() {
  if (!formEl.value?.checkValidity()) {
    formEl.value?.reportValidity();
    return;
  }
  submitting.value = true;
  feedback.value = null;

  try {
    const json = await apiFetch<{ message: string }>("/public/concert-request", {
      method: "POST",
      body: {
        name: form.bandName,
        email: form.bandEmail,
        phone: form.bandPhone,
        message: [
          form.bandMsg,
          form.bandStyle ? `Style : ${form.bandStyle}` : "",
          form.bandSize ? `Effectif : ${form.bandSize}` : "",
          form.bandLink ? `Écoute : ${form.bandLink}` : "",
        ].filter(Boolean).join("\n"),
      },
    });
    feedback.value = { text: json.message, ok: true };
    show("Demande envoyée. On revient vers toi sous 7 jours.");
    Object.keys(form).forEach((k) => ((form as any)[k] = ""));
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
          <li><span class="dot"></span> Petite jauge : entre 120 et 130 personnes debout lors des grosses soirées.</li>
          <li><span class="dot"></span> Cadre unique : jouer au milieu des conteneurs et de l'esprit chaudronnerie.</li>
          <li><span class="dot"></span> Esprit solidaire : ici, on joue pour la bonne cause et le partage.</li>
        </ul>
      </div>

      <form
        ref="formEl"
        class="form concert__form"
        novalidate
        @submit.prevent="onSubmit"
      >
        <h3 class="form__title">Fiche groupe</h3>

        <div class="field">
          <label for="bandName">Nom du groupe / projet</label>
          <input id="bandName" v-model="form.bandName" type="text" required placeholder="Les Soudeurs du Dimanche" />
        </div>

        <div class="field-row">
          <div class="field">
            <label for="bandStyle">Style</label>
            <select id="bandStyle" v-model="form.bandStyle" required>
              <option value="">Choisir…</option>
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
            <input id="bandSize" v-model="form.bandSize" type="number" min="1" max="20" placeholder="3" />
          </div>
        </div>

        <div class="field">
          <label for="bandLink">Lien d'écoute (YouTube, Bandcamp, Spotify…)</label>
          <input id="bandLink" v-model="form.bandLink" type="url" required placeholder="https://..." />
        </div>

        <div class="field-row">
          <div class="field">
            <label for="bandEmail">Ton email</label>
            <input id="bandEmail" v-model="form.bandEmail" type="email" required placeholder="contact@groupe.fr" />
          </div>
          <div class="field">
            <label for="bandPhone">Téléphone</label>
            <input id="bandPhone" v-model="form.bandPhone" type="tel" placeholder="06 …" />
          </div>
        </div>

        <div class="field">
          <label for="bandMsg">Quelques mots</label>
          <textarea id="bandMsg" v-model="form.bandMsg" rows="4" placeholder="Disponibilités, fiche technique, petite anecdote de tournée…"></textarea>
        </div>

        <button type="submit" class="btn btn--yellow btn--lg" :disabled="submitting">
          {{ submitting ? "Envoi…" : "Envoyer la demande" }}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
        </button>
        <p
          v-if="feedback"
          class="form__note"
          :class="{ 'is-ok': feedback.ok, 'is-err': !feedback.ok }"
        >
          {{ feedback.text }}
        </p>
      </form>
    </div>
  </section>
</template>

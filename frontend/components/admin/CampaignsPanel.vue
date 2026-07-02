<script setup lang="ts">
interface Campaign {
  id: number;
  channel: string;
  subject?: string;
  body: string;
  target: string;
  status: string;
  recipient_count: number;
  sent_at?: string | null;
}

const { apiFetch } = useApi();
const { show } = useToast();

const campaigns = ref<Campaign[]>([]);
const form = reactive({
  channel: "email",
  target: "all",
  subject: "Concert vendredi 19 · Anouk Béton",
  body: `Salut la tribu Tatina !

Vendredi 19, on accueille Anouk Béton & The Soldering Hearts pour une soirée folk-électro.

Ouverture des portes jaunes à 19h, concert à 20h30.
On compte sur vous — et sur vos copains.

À très vite,
L'équipe Tatina`,
});
const sending = ref(false);

async function load() {
  try {
    campaigns.value = await apiFetch<Campaign[]>("/campaigns");
  } catch {}
}
onMounted(load);

async function onSend() {
  sending.value = true;
  try {
    const data = await apiFetch<{ recipient_count: number }>("/campaigns", {
      method: "POST",
      body: form,
    });
    show(`Campagne envoyée à ${data.recipient_count} destinataires.`);
    await load();
  } catch (err: any) {
    show(err?.data?.error || "Erreur envoi", true);
  } finally {
    sending.value = false;
  }
}

function badgeClass(s: string) {
  return s === "sent" ? "badge--ok" : s === "failed" ? "badge--alert" : "badge--draft";
}
</script>

<template>
  <section class="admin-section is-active">
    <header class="admin-header">
      <div>
        <h2>Campagnes Email & SMS</h2>
        <p>Préviens les adhérents d'un nouvel événement, d'un changement, d'un coup de cœur.</p>
      </div>
    </header>

    <div class="composer">
      <div>
        <div class="panel">
          <h3>Nouvelle campagne</h3>
          <form @submit.prevent="onSend">
            <div class="field-row">
              <div class="field">
                <label>Canal</label>
                <select v-model="form.channel">
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Email + SMS</option>
                </select>
              </div>
              <div class="field">
                <label>Cible</label>
                <select v-model="form.target">
                  <option value="all">Tous les adhérents</option>
                  <option value="active">Cotisation payée</option>
                  <option value="torenew">À renouveler</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Objet / Titre</label>
              <input v-model="form.subject" type="text" />
            </div>
            <div class="field">
              <label>Message</label>
              <textarea v-model="form.body" rows="8"></textarea>
            </div>
            <div style="display: flex; gap: 10px;">
              <button type="button" class="btn btn--ghost">Enregistrer brouillon</button>
              <button type="submit" class="btn btn--yellow" :disabled="sending">
                {{ sending ? "Envoi en cours…" : "Envoyer maintenant" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="preview">
        <div class="from">De : Tatina &lt;bonjour@bistrot-tatina.fr&gt;<br/>Pour : 120 destinataires</div>
        <h4>{{ form.subject }}</h4>
        <div class="body">{{ form.body }}</div>
      </div>
    </div>

    <div class="panel" style="margin-top: 30px;">
      <h3>Historique des envois</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Canal</th><th>Sujet</th><th>Destinataires</th><th>Statut</th></tr>
        </thead>
        <tbody>
          <tr v-if="!campaigns.length"><td colspan="5" style="opacity:.5">Aucune campagne.</td></tr>
          <tr v-for="c in campaigns" :key="c.id">
            <td>{{ c.sent_at ? new Date(c.sent_at).toLocaleDateString("fr-FR") : "—" }}</td>
            <td><span class="badge" :class="c.channel === 'email' ? 'badge--yellow' : ''">{{ c.channel.toUpperCase() }}</span></td>
            <td>{{ c.subject || (c.body || "").substring(0, 40) + "…" }}</td>
            <td>{{ c.recipient_count }}</td>
            <td><span class="badge" :class="badgeClass(c.status)">{{ c.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

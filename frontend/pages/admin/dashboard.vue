<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: "admin-auth",
});

useHead({ title: "Tableau de bord" });

const currentTab = useState<string>("admin_tab", () => "dashboard");
</script>

<template>
  <div>
    <AdminDashboardPanel v-if="currentTab === 'dashboard'" />
    <AdminAgendaPanel    v-else-if="currentTab === 'agenda'" />
    <AdminMenuPanel      v-else-if="currentTab === 'menu'" />
    <AdminHorairesPanel  v-else-if="currentTab === 'horaires'" />
    <AdminMembersPanel   v-else-if="currentTab === 'adherents'" />
    <AdminCampaignsPanel v-else-if="currentTab === 'campagnes'" />
    <AdminAssosPanel     v-else-if="currentTab === 'assos'" />
    <AdminSettingsPanel  v-else-if="currentTab === 'settings'" />
  </div>
</template>

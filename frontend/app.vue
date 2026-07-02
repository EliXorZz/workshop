<script setup lang="ts">
useHead({
  titleTemplate: (title) => title ? `${title} · Le Bistrot de Tatina` : "Le Bistrot de Tatina",
});
</script>

<template>
  <div>
    <NuxtPage />
    <AppToast />
  </div>
</template>

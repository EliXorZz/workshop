<script setup lang="ts">
useHead({
  titleTemplate: (title) => title ? `${title} · Le Bistrot de Tatina` : "Le Bistrot de Tatina",
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppToast />
  </div>
</template>

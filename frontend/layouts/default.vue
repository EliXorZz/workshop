<script setup lang="ts">
onMounted(() => {
  document.documentElement.classList.add("js");
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));
});
</script>

<template>
  <div>
    <div class="hazard-bar" aria-hidden="true"></div>
    <SiteNav />
    <slot />
    <SiteFooter />
  </div>
</template>

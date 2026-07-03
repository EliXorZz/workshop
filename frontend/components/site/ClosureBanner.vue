<script setup lang="ts">
const props = defineProps<{ message?: string }>();
const text = computed(
  () => props.message || "Fermeture estivale exceptionnelle. On revient avec de la tôle chaude et des bonnes ondes.",
);
</script>

<template>
  <div class="closure-banner" role="status">
    <span class="closure-banner__tag">FERMETURE</span>
    <span class="closure-banner__text">{{ text }}</span>
  </div>
</template>

<style scoped>
.closure-banner {
  position: sticky;
  top: 14px;
  z-index: 55;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px clamp(16px, 3vw, 32px);
  background: var(--rust, #B5531D);
  color: var(--white, #fff);
  font-size: 14px;
  border-bottom: 2px solid var(--black);
}
.closure-banner__tag {
  font-family: var(--font-stencil, Impact);
  font-size: 12px;
  letter-spacing: 0.18em;
  padding: 4px 10px;
  background: var(--black);
  color: var(--yellow, #F5C518);
  flex: 0 0 auto;
}
.closure-banner__text {
  line-height: 1.35;
}
</style>

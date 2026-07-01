<template>
  <div
    class="toast"
    :class="{ 'is-visible': visible }"
    :style="isError ? 'background: var(--rust, #c0392b)' : ''"
    role="status"
    aria-live="polite"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
const { message, visible, isError } = useToast()
</script>

<script setup lang="ts">
const { toast } = useToast();
</script>

<template>
  <div
    class="toast"
    role="status"
    aria-live="polite"
    :class="{ 'is-visible': toast.visible }"
    :style="toast.error ? { background: 'var(--rust, #c0392b)' } : undefined"
  >
    {{ toast.message }}
  </div>
</template>

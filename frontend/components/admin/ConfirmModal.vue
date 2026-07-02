<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  message: string;
  danger?: boolean;
  okLabel?: string;
}>();
const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-card modal-card--sm">
      <h3>Confirmation</h3>
      <p>{{ message }}</p>
      <div class="modal-footer">
        <button class="btn btn--ghost" @click="emit('cancel')">Annuler</button>
        <button
          :class="['btn', danger ? 'btn--danger' : 'btn--yellow']"
          @click="emit('confirm')"
        >
          {{ okLabel || "Supprimer" }}
        </button>
      </div>
    </div>
  </div>
</template>

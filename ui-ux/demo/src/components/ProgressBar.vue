<template>
  <div class="progress-bar h-6 w-48 bg-bg rounded-full flex items-center shadow-inner overflow-hidden">
    <div class="progress-fill h-full rounded-full transition-all duration-500" :style="fillStyle"></div>
    <span class="progress-label absolute w-full text-center text-text font-bold">{{ percent }}%</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  percent: { type: Number, required: true },
  color: { type: String, default: '#4F46E5' }
})
const fillStyle = computed(() => ({
  width: props.percent + '%',
  background: props.color
}))
</script>

<style scoped>
.progress-bar {
  position: relative;
  background: #EEF2FF;
}
.progress-fill {
  min-width: 16px;
}
</style>

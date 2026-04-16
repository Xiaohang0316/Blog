<template>
  <div class="clay-card flex flex-col items-center p-6 rounded-2xl shadow-clay bg-white transition-all duration-200 hover:scale-105 cursor-pointer">
    <div class="icon text-4xl mb-3">{{ icon }}</div>
    <h3 class="text-xl font-bold text-primary mb-2">{{ title }}</h3>
    <p class="text-text text-center">{{ desc }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  desc: String
})
</script>

<style scoped>
.clay-card {
  box-shadow:
    6px 6px 16px #818CF855,
    -6px -6px 16px #fff,
    0 2px 8px #4F46E533;
  border: 3px solid #818CF8;
}
</style>

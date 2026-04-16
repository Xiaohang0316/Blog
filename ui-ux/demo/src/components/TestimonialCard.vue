<template>
  <div class="testimonial-card flex items-center gap-4 p-6 rounded-2xl bg-white shadow-clay">
    <img :src="avatar" alt="avatar" class="w-16 h-16 rounded-full border-4 border-secondary shadow" />
    <div>
      <div class="font-bold text-primary">{{ name }}</div>
      <div class="text-text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  text: String,
  avatar: String
})
</script>

<style scoped>
.testimonial-card {
  box-shadow:
    6px 6px 16px #818CF855,
    -6px -6px 16px #fff,
    0 2px 8px #4F46E533;
}
</style>

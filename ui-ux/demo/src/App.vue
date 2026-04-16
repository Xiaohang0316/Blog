<template>
  <div class="app-bg min-h-screen flex flex-col items-center font-fredoka">
    <main class="max-container flex flex-col gap-12 py-10">
      <!-- Hero Section -->
      <section class="hero flex flex-col items-center text-center gap-4">
        <h1 class="text-5xl md:text-6xl font-bold text-primary drop-shadow-lg">PlayfulEdu</h1>
        <p class="text-xl md:text-2xl text-secondary">Unlock fun learning with vibrant courses and playful progress!</p>
        <button class="cta-btn px-8 py-4 rounded-full font-bold text-lg shadow-cta transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cta mt-4">Enroll Now</button>
      </section>

      <!-- Course Catalog -->
      <section class="catalog grid grid-cols-1 md:grid-cols-3 gap-8">
        <ClayCard v-for="course in courses" :key="course.title" :icon="course.icon" :title="course.title" :desc="course.desc" />
      </section>

      <!-- Progress Tracking -->
      <section class="progress-demo flex flex-col items-center gap-4">
        <h2 class="text-2xl font-bold text-primary">Your Progress</h2>
        <div class="w-full max-w-xl bg-white rounded-3xl shadow-clay p-8 flex flex-col gap-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span class="font-bold text-text">Math Adventure</span>
            <ProgressBar :percent="76" />
          </div>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span class="font-bold text-text">Science Quest</span>
            <ProgressBar :percent="42" color="#F97316" />
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="testimonials py-4">
        <h2 class="text-2xl font-bold text-primary mb-6 text-center">What Students Say</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TestimonialCard v-for="t in testimonials" :key="t.name" :name="t.name" :text="t.text" :avatar="t.avatar" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ClayCard from './components/ClayCard.vue'
import ProgressBar from './components/ProgressBar.vue'
import TestimonialCard from './components/TestimonialCard.vue'

const courses = ref([
  { icon: '📚', title: 'Math Adventure', desc: 'Fun math games and puzzles.' },
  { icon: '🔬', title: 'Science Quest', desc: 'Explore experiments and wonders.' },
  { icon: '🎨', title: 'Art Studio', desc: 'Unleash creativity with colors.' },
])

const testimonials = ref([
  { name: 'Alice', text: 'I love the colorful cards and easy progress tracking!', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Ben', text: 'The courses are so much fun and I learn a lot every day!', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;700&family=Nunito:wght@400;700&display=swap');

.app-bg {
  background: #EEF2FF;
}
.text-primary {
  color: #4F46E5;
}
.text-secondary {
  color: #818CF8;
}
.text-text {
  color: #1E1B4B;
}
.cta-btn {
  background: #F97316;
  color: #fff;
  box-shadow: 0 4px 16px 0 #F9731633, 0 2px 4px 0 #4F46E533;
  border: none;
  outline: none;
}
.shadow-cta {
  box-shadow: 0 4px 16px 0 #F9731633, 0 2px 4px 0 #4F46E533;
}
.font-fredoka {
  font-family: 'Fredoka', 'Nunito', sans-serif;
}
main {
  width: 100%;
}
.catalog {
  margin-top: 0.5rem;
}
.progress-demo {
  margin-top: 0.5rem;
}
.testimonials {
  margin-top: 0.5rem;
}
@media (max-width: 768px) {
  .catalog, .testimonials, .progress-demo {
    gap: 1.5rem !important;
  }
}
</style>

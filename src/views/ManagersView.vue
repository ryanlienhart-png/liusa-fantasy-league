<template>
  <div class="managers-page">
    <div class="container">
      <h2 class="page-title">meet the managers</h2>
      <p class="page-sub">these will be your competition.</p>

      <div class="mgr-grid">
        <ManagerCard v-for="m in managers" :key="m.id" :manager="m" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ManagerCard from '../components/ManagerCard.vue'
import { managers } from '../data/managers.js'
</script>

<style scoped>
.managers-page { padding: 40px 0 60px; }

.mgr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
</style>

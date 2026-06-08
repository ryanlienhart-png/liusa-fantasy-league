<template>
  <div class="managers-page">
    <div class="container">
      <h2 class="page-title">meet the managers</h2>
      <p class="page-sub">these will be your competition.</p>

      <div class="league-section">
        <h3 class="league-head villa-head">🏡 Villa League</h3>
        <div class="mgr-grid">
          <ManagerCard v-for="m in villaManagers" :key="m.id" :manager="m" />
        </div>
      </div>

      <div class="league-section">
        <h3 class="league-head casa-head">🏠 Casa League</h3>
        <div class="mgr-grid">
          <ManagerCard v-for="m in casaManagers" :key="m.id" :manager="m" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ManagerCard from '../components/ManagerCard.vue'
import { villaManagers, casaManagers } from '../data/managers.js'
</script>

<style scoped>
.managers-page { padding: 40px 0 60px; }

.league-section { margin-bottom: 52px; }

.league-head {
  font-family: 'Pacifico', cursive;
  font-size: 1.4rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px dashed var(--pink-light);
}
.villa-head { color: var(--pink); }
.casa-head  { color: #E65100; }

.mgr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}
</style>

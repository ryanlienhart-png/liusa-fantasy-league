<template>
  <div class="mgr-card" :style="{ '--accent': manager.color }">
    <div class="avatar" :style="{ background: manager.color }">
      <img
        v-if="manager.photo"
        :src="manager.photo"
        :alt="manager.name"
        class="avatar-img"
        @error="e => e.target.style.display = 'none'"
      />
      <span v-else>{{ initials }}</span>
    </div>
    <div class="info">
      <div class="mgr-name">
        {{ manager.name }}
        <span v-if="manager.isHost" class="pill pill-host">Host</span>
      </div>
      <div class="picks">
        <template v-if="picks.length">
          <span v-for="p in picks" :key="p" class="pick-chip">{{ p }}</span>
        </template>
        <span v-else class="pick-chip pick-empty">No picks yet</span>
      </div>
      <div class="score-row">
        <span class="score-num">{{ score }}</span>
        <span class="score-label">pts</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { gameState, getManagerScore } from '../store/game.js'

const props = defineProps({
  manager: { type: Object, required: true },
})

const initials = computed(() =>
  props.manager.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
)
const picks = computed(() => gameState.managerPicks[props.manager.name] || [])
const score = computed(() => getManagerScore(props.manager.name))
</script>

<style scoped>
.mgr-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  border-left: 5px solid var(--accent);
  transition: transform .2s, box-shadow .2s;
}
.mgr-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(255,27,141,.2);
}

.avatar {
  width: 60px; height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Pacifico', cursive;
  font-size: 1.4rem;
  color: #fff;
  flex-shrink: 0;
  text-shadow: 0 1px 4px rgba(0,0,0,.3);
  overflow: hidden;
  position: relative;
}
.avatar-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.info { flex: 1; min-width: 0; }

.mgr-name {
  font-weight: 900;
  font-size: 1.05rem;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.picks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.pick-chip {
  background: var(--pink-pale);
  color: var(--pink-dark);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: .8rem;
  font-weight: 800;
}
.pick-empty {
  background: #f0f0f0;
  color: #999;
}

.score-row { display: flex; align-items: baseline; gap: 4px; }
.score-num  { font-size: 1.6rem; font-weight: 900; color: var(--pink); }
.score-label { font-size: .8rem; font-weight: 700; color: var(--text-mid); }
</style>

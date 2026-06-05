<template>
  <div class="lb-page">
    <div class="container">
      <h2 class="page-title">leaderboard</h2>
      <p class="page-sub">ranked by total islander points</p>

      <div class="lb-list">
        <div
          v-for="(entry, i) in ranked"
          :key="entry.manager.name"
          class="lb-row"
          :class="[`rank-${i+1}`, { tied: entry.tied }]"
        >
          <!-- Rank badge -->
          <div class="rank-badge">
            <template v-if="i === 0">🥇</template>
            <template v-else-if="i === 1">🥈</template>
            <template v-else-if="i === 2">🥉</template>
            <template v-else>{{ i + 1 }}</template>
          </div>

          <!-- Avatar -->
          <div class="lb-avatar" :style="{ background: entry.manager.color }">
            <img
              v-if="entry.manager.photo"
              :src="entry.manager.photo"
              :alt="entry.manager.name"
              class="lb-avatar-img"
              @error="e => e.target.style.display = 'none'"
            />
            <span v-else>{{ avatarInitials(entry.manager.name) }}</span>
          </div>

          <!-- Info -->
          <div class="lb-info">
            <span class="lb-name">{{ entry.manager.name }}</span>
            <span v-if="entry.manager.isHost" class="pill pill-host" style="margin-left:8px">Host</span>
            <div class="lb-picks">
              <template v-if="entry.picks.length">
                <span v-for="p in entry.picks" :key="p.name" class="lb-chip" :class="{ elim: p.elim }">
                  {{ p.name }}
                  <em v-if="p.elim"> (out)</em>
                </span>
              </template>
              <span v-else class="lb-chip lb-chip-empty">No picks yet</span>
            </div>
          </div>

          <!-- Score -->
          <div class="lb-score">
            <span class="lb-pts">{{ entry.score }}</span>
            <span class="lb-pts-label">pts</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <p v-if="!ranked.length" class="empty-msg">No data yet. Draft picks and scoring will appear here.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { managers } from '../data/managers.js'
import { gameState, getManagerScore, isEliminated } from '../store/game.js'

function avatarInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const ranked = computed(() => {
  return managers
    .map(m => ({
      manager: m,
      score: getManagerScore(m.name),
      picks: (gameState.managerPicks[m.name] || []).map(name => ({
        name,
        elim: isEliminated(name),
      })),
    }))
    .sort((a, b) => b.score - a.score)
})
</script>

<style scoped>
.lb-page { padding: 40px 0 60px; }

.lb-list { display: flex; flex-direction: column; gap: 12px; }

.lb-row {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform .2s;
}
.lb-row:hover { transform: translateX(4px); }

.rank-1 { border-left: 6px solid #FFD700; background: linear-gradient(90deg, #FFFDE7, #fff 40%); }
.rank-2 { border-left: 6px solid #C0C0C0; background: linear-gradient(90deg, #F5F5F5, #fff 40%); }
.rank-3 { border-left: 6px solid #CD7F32; background: linear-gradient(90deg, #FFF3E0, #fff 40%); }

.rank-badge {
  font-size: 1.6rem;
  width: 44px;
  text-align: center;
  font-weight: 900;
  color: var(--text-mid);
  flex-shrink: 0;
}

.lb-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Pacifico', cursive;
  font-size: 1.2rem;
  color: #fff;
  flex-shrink: 0;
  text-shadow: 0 1px 4px rgba(0,0,0,.3);
  overflow: hidden;
  position: relative;
}
.lb-avatar-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.lb-info { flex: 1; min-width: 0; }

.lb-name {
  font-weight: 900;
  font-size: 1.05rem;
  display: inline;
}

.lb-picks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.lb-chip {
  background: var(--pink-pale);
  color: var(--pink-dark);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: .8rem;
  font-weight: 800;
}
.lb-chip.elim { background: #f8d7da; color: #721c24; text-decoration: line-through; }
.lb-chip-empty { background: #f0f0f0; color: #999; }

.lb-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.lb-pts       { font-size: 2rem; font-weight: 900; color: var(--pink); }
.lb-pts-label { font-size: .85rem; font-weight: 700; color: var(--text-mid); }

.empty-msg {
  text-align: center;
  color: var(--text-mid);
  font-weight: 700;
  margin-top: 40px;
  font-size: 1rem;
}
</style>

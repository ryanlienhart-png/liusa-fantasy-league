<template>
  <div class="lb-page">
    <div class="container">
      <h2 class="page-title">leaderboard</h2>
      <p class="page-sub">ranked by total islander points</p>

      <div class="lb-columns">
        <!-- Villa League -->
        <div class="lb-column">
          <h3 class="col-head villa-head">🏡 Villa League</h3>
          <div class="lb-list">
            <div
              v-for="(entry, i) in villaRanked"
              :key="entry.manager.name"
              class="lb-row"
              :class="`rank-${i+1}`"
            >
              <div class="rank-badge">
                <template v-if="i === 0">🥇</template>
                <template v-else-if="i === 1">🥈</template>
                <template v-else-if="i === 2">🥉</template>
                <template v-else>{{ i + 1 }}</template>
              </div>
              <div class="lb-avatar" :style="{ background: entry.manager.color }">
                <img
                  v-if="entry.manager.photo"
                  :src="entry.manager.photo"
                  :alt="entry.manager.name"
                  class="lb-avatar-img"
                  @error="e => e.target.style.display = 'none'"
                />
                <span v-else>{{ initials(entry.manager.name) }}</span>
              </div>
              <div class="lb-info">
                <span class="lb-name">{{ entry.manager.name }}</span>
                <span v-if="entry.manager.isHost" class="pill pill-host" style="margin-left:6px">Host</span>
                <div class="lb-picks">
                  <template v-if="entry.picks.length">
                    <span v-for="p in entry.picks" :key="p.name" class="lb-chip" :class="{ elim: p.elim }">
                      {{ p.name }}<em v-if="p.elim"> (out)</em>
                    </span>
                  </template>
                  <span v-else class="lb-chip lb-chip-empty">No picks</span>
                </div>
              </div>
              <div class="lb-score">
                <span class="lb-pts">{{ entry.score }}</span>
                <span class="lb-pts-label">pts</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Casa League -->
        <div class="lb-column">
          <h3 class="col-head casa-head">🏠 Casa League</h3>
          <div class="lb-list">
            <div
              v-for="(entry, i) in casaRanked"
              :key="entry.manager.name"
              class="lb-row"
              :class="`rank-${i+1}`"
            >
              <div class="rank-badge">
                <template v-if="i === 0">🥇</template>
                <template v-else-if="i === 1">🥈</template>
                <template v-else-if="i === 2">🥉</template>
                <template v-else>{{ i + 1 }}</template>
              </div>
              <div class="lb-avatar" :style="{ background: entry.manager.color }">
                <img
                  v-if="entry.manager.photo"
                  :src="entry.manager.photo"
                  :alt="entry.manager.name"
                  class="lb-avatar-img"
                  @error="e => e.target.style.display = 'none'"
                />
                <span v-else>{{ initials(entry.manager.name) }}</span>
              </div>
              <div class="lb-info">
                <span class="lb-name">{{ entry.manager.name }}</span>
                <span v-if="entry.manager.isHost" class="pill pill-host" style="margin-left:6px">Host</span>
                <div class="lb-picks">
                  <template v-if="entry.picks.length">
                    <span v-for="p in entry.picks" :key="p.name" class="lb-chip" :class="{ elim: p.elim }">
                      {{ p.name }}<em v-if="p.elim"> (out)</em>
                    </span>
                  </template>
                  <span v-else class="lb-chip lb-chip-empty">No picks</span>
                </div>
              </div>
              <div class="lb-score">
                <span class="lb-pts">{{ entry.score }}</span>
                <span class="lb-pts-label">pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { villaManagers, casaManagers, mgrKey } from '../data/managers.js'
import { gameState, getManagerScore, isEliminated } from '../store/game.js'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function rankManagers(list) {
  return list
    .map(m => ({
      manager: m,
      score: getManagerScore(mgrKey(m)),
      picks: (gameState.managerPicks[mgrKey(m)] || []).map(name => ({
        name,
        elim: isEliminated(name),
      })),
    }))
    .sort((a, b) => b.score - a.score)
}

const villaRanked = computed(() => rankManagers(villaManagers))
const casaRanked  = computed(() => rankManagers(casaManagers))
</script>

<style scoped>
.lb-page { padding: 40px 0 60px; }

.lb-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 900px) {
  .lb-columns { grid-template-columns: 1fr; }
}

.col-head {
  font-family: 'Pacifico', cursive;
  font-size: 1.3rem;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px dashed var(--pink-light);
}
.villa-head { color: var(--pink); }
.casa-head  { color: #E65100; }

.lb-list { display: flex; flex-direction: column; gap: 10px; }

.lb-row {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform .2s;
}
.lb-row:hover { transform: translateX(3px); }

.rank-1 { border-left: 5px solid #FFD700; background: linear-gradient(90deg, #FFFDE7, #fff 50%); }
.rank-2 { border-left: 5px solid #C0C0C0; background: linear-gradient(90deg, #F5F5F5, #fff 50%); }
.rank-3 { border-left: 5px solid #CD7F32; background: linear-gradient(90deg, #FFF3E0, #fff 50%); }

.rank-badge {
  font-size: 1.3rem;
  width: 32px;
  text-align: center;
  font-weight: 900;
  color: var(--text-mid);
  flex-shrink: 0;
}

.lb-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Pacifico', cursive;
  font-size: 1rem;
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

.lb-name { font-weight: 900; font-size: .95rem; }

.lb-picks {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.lb-chip {
  background: var(--pink-pale);
  color: var(--pink-dark);
  border-radius: 999px;
  padding: 2px 9px;
  font-size: .75rem;
  font-weight: 800;
}
.lb-chip.elim { background: #f8d7da; color: #721c24; text-decoration: line-through; }
.lb-chip-empty { background: #f0f0f0; color: #999; }

.lb-score {
  display: flex;
  align-items: baseline;
  gap: 3px;
  flex-shrink: 0;
}
.lb-pts       { font-size: 1.6rem; font-weight: 900; color: var(--pink); }
.lb-pts-label { font-size: .8rem; font-weight: 700; color: var(--text-mid); }
</style>

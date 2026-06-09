<template>
  <div class="lb-page">
    <h3 class="panel-title">League Leaderboard</h3>
    <p class="panel-sub">
      {{ isMain ? 'Official managers ranked by total islander points.' : 'Managers ranked by total islander points.' }}
    </p>

    <div class="lb-list">
      <div
        v-for="(entry, i) in ranked"
        :key="entry.key"
        class="lb-row"
        :class="`rank-${Math.min(i + 1, 4)}`"
      >
        <div class="rank-badge">
          <template v-if="i === 0">🥇</template>
          <template v-else-if="i === 1">🥈</template>
          <template v-else-if="i === 2">🥉</template>
          <template v-else>{{ i + 1 }}</template>
        </div>
        <div v-if="entry.photo" class="lb-avatar" :style="{ background: entry.color }">
          <img :src="entry.photo" :alt="entry.userName" class="lb-avatar-img" @error="onImgError" />
        </div>
        <div class="lb-info">
          <span class="lb-name">
            {{ entry.userName }}
            <span v-if="entry.role === 'host'" class="pill pill-host">Host</span>
          </span>
          <div class="lb-picks">
            <span v-for="p in entry.picks" :key="p" class="lb-chip" :class="{ elim: p.elim }">
              {{ p.name }}<em v-if="p.elim"> (out)</em>
            </span>
            <span v-if="entry.picks.length === 0" class="lb-chip empty">No picks</span>
          </div>
        </div>
        <div class="lb-score">
          <span class="lb-pts">{{ entry.score }}</span>
          <span class="lb-pts-label">pts</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mgrKey } from '../data/managers.js'
import { getMainLeague, isMainLeague } from '../data/mainLeagues.js'
import { globalState, getIslanderById, getIslanderPoints } from '../store/globalData.js'
import { activeLeagueMembers, activeLeaguePicks } from '../store/leagues.js'
import { gameState, getManagerScore, isEliminated } from '../store/game.js'

const route = useRoute()
const leagueId = computed(() => route.params.leagueId)
const isMain = computed(() => isMainLeague(leagueId.value))

function onImgError(e) {
  e.target.style.display = 'none'
}

const ranked = computed(() => {
  if (isMain.value) {
    const league = getMainLeague(leagueId.value)
    if (!league) return []
    return league.managers
      .map(m => {
        const key = mgrKey(m)
        const pickNames = gameState.managerPicks[key] ?? []
        return {
          key,
          userName: m.name,
          role: m.isHost ? 'host' : 'member',
          color: m.color,
          photo: m.photo,
          score: getManagerScore(key),
          picks: pickNames.map(name => ({ name, elim: isEliminated(name) })),
        }
      })
      .sort((a, b) => b.score - a.score)
  }

  return activeLeagueMembers.value
    .map(m => {
      const memberKey = m.userId ?? m.legacyKey
      const picks = activeLeaguePicks.value
        .filter(p => (p.userId ?? p.legacyKey) === memberKey)
        .sort((a, b) => a.pickSlot - b.pickSlot)
        .map(p => ({
          name: getIslanderById(p.islanderId)?.name
            ?? globalState.islanders.find(i => i.id === p.islanderId)?.name
            ?? '—',
          elim: false,
        }))
      const score = activeLeaguePicks.value
        .filter(p => (p.userId ?? p.legacyKey) === memberKey)
        .reduce((sum, p) => sum + getIslanderPoints(p.islanderId), 0)
      return {
        key: memberKey,
        userName: m.userName,
        role: m.role,
        color: m.color,
        photo: m.photo,
        picks,
        score,
      }
    })
    .sort((a, b) => b.score - a.score)
})
</script>

<style scoped>
.panel-title {
  font-family: 'Pacifico', cursive;
  color: var(--pink);
  font-size: 1.4rem;
  margin-bottom: 4px;
}
.panel-sub { color: var(--text-mid); font-weight: 700; margin-bottom: 24px; }
.lb-list { display: flex; flex-direction: column; gap: 10px; }
.lb-row {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.rank-1 { border-left: 5px solid #FFD700; }
.rank-2 { border-left: 5px solid #C0C0C0; }
.rank-3 { border-left: 5px solid #CD7F32; }
.rank-badge { width: 32px; text-align: center; font-size: 1.2rem; flex-shrink: 0; }
.lb-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}
.lb-avatar-img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center top;
}
.lb-info { flex: 1; min-width: 0; }
.lb-name { font-weight: 900; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.lb-picks { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.lb-chip {
  background: var(--pink-pale);
  color: var(--pink-dark);
  border-radius: 999px;
  padding: 2px 9px;
  font-size: .75rem;
  font-weight: 800;
}
.lb-chip.elim { background: #f8d7da; color: #721c24; text-decoration: line-through; }
.lb-chip.empty { background: #f0f0f0; color: #999; }
.lb-score { display: flex; align-items: baseline; gap: 3px; }
.lb-pts { font-size: 1.6rem; font-weight: 900; color: var(--pink); }
.lb-pts-label { font-size: .8rem; font-weight: 700; color: var(--text-mid); }
</style>

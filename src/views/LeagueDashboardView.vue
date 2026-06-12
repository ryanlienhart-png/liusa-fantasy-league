<template>
  <div class="dashboard">
    <template v-if="isMain">
      <p class="main-note">
        This is an official league with {{ mainLeague?.managers.length }} pre-assigned managers.
        View the <RouterLink :to="`/leagues/${leagueId}/leaderboard`">leaderboard</RouterLink>
        or <RouterLink to="/managers">all managers</RouterLink>.
      </p>
      <div class="mini-lb">
        <h3>Top 3</h3>
        <div v-for="(entry, i) in topThree" :key="entry.key" class="mini-row">
          <span class="mini-rank">{{ i + 1 }}</span>
          <span class="mini-name">{{ entry.userName }}</span>
          <span class="mini-pts">{{ entry.score }} pts</span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="dash-grid">
        <div class="dash-card">
          <h3>Your Team</h3>
          <p class="dash-score">{{ myScore }} <span>pts</span></p>
          <div class="dash-picks">
            <span v-for="p in myPicks" :key="p.pickSlot" class="pick-chip">
              {{ islanderName(p.islanderId) }}
            </span>
            <span v-if="myPicks.length < 2" class="pick-chip empty">Pick your islanders →</span>
          </div>
          <RouterLink :to="`/leagues/${leagueId}/picks`" class="dash-link">Manage picks</RouterLink>
        </div>

        <div class="dash-card">
          <h3>League Members</h3>
          <p class="dash-num">{{ members.length }}</p>
          <ul class="member-list">
            <li v-for="m in members" :key="m.id">
              {{ m.userName }}
              <span v-if="m.role === 'host'" class="pill pill-host">Host</span>
            </li>
          </ul>
        </div>

        <div class="dash-card wide">
          <h3>Top 3</h3>
          <div class="mini-lb">
            <div v-for="(entry, i) in topThree" :key="entry.key" class="mini-row">
              <span class="mini-rank">{{ i + 1 }}</span>
              <span class="mini-name">{{ entry.userName }}</span>
              <span class="mini-pts">{{ entry.score }} pts</span>
            </div>
            <p v-if="topThree.length === 0" class="empty">No picks yet.</p>
          </div>
          <RouterLink :to="`/leagues/${leagueId}/leaderboard`" class="dash-link">Full leaderboard</RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mgrKey } from '../data/managers.js'
import { getMainLeague, isMainLeague } from '../data/mainLeagues.js'
import { currentUser } from '../store/auth.js'
import { globalState, getIslanderById, getIslanderPoints } from '../store/globalData.js'
import { activeLeagueMembers, activeLeaguePicks } from '../store/leagues.js'
import { gameState, getManagerScore } from '../store/game.js'

const route = useRoute()
const leagueId = computed(() => route.params.leagueId)
const isMain = computed(() => isMainLeague(leagueId.value))
const mainLeague = computed(() => getMainLeague(leagueId.value))

const members = computed(() => activeLeagueMembers.value)
const myPicks = computed(() =>
  activeLeaguePicks.value
    .filter(p => p.userId === currentUser.value?.uid)
    .sort((a, b) => a.pickSlot - b.pickSlot)
)

const myScore = computed(() =>
  myPicks.value.reduce((sum, p) => sum + getIslanderPoints(p.islanderId), 0)
)

const topThree = computed(() => {
  if (isMain.value && mainLeague.value) {
    return mainLeague.value.managers
      .map(m => ({
        key: mgrKey(m),
        userName: m.name,
        score: getManagerScore(mgrKey(m)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }

  return members.value
    .map(m => ({
      key: m.userId ?? m.legacyKey,
      userName: m.userName,
      score: activeLeaguePicks.value
        .filter(p => (p.userId ?? p.legacyKey) === (m.userId ?? m.legacyKey))
        .reduce((sum, p) => sum + getIslanderPoints(p.islanderId), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
})

function islanderName(id) {
  return getIslanderById(id)?.name ?? globalState.islanders.find(i => i.id === id)?.name ?? '—'
}
</script>

<style scoped>
.main-note {
  background: #fff;
  border-radius: var(--radius);
  padding: 20px;
  font-weight: 700;
  color: var(--text-mid);
  margin-bottom: 20px;
  box-shadow: var(--shadow);
}
.main-note a { color: var(--pink); font-weight: 900; }
.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
.dash-card, .mini-lb {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}
.dash-card.wide { grid-column: 1 / -1; }
.dash-card h3, .mini-lb h3 {
  font-family: 'Pacifico', cursive;
  color: var(--pink);
  margin-bottom: 12px;
}
.dash-score { font-size: 2.5rem; font-weight: 900; color: var(--pink); }
.dash-score span { font-size: 1rem; color: var(--text-mid); }
.dash-num { font-size: 2rem; font-weight: 900; color: var(--pink); }
.dash-picks { display: flex; gap: 6px; flex-wrap: wrap; margin: 12px 0; }
.pick-chip {
  background: var(--pink-pale);
  color: var(--pink-dark);
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 800;
  font-size: .85rem;
}
.pick-chip.empty { background: #f0f0f0; color: #999; }
.member-list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.member-list li { font-weight: 700; display: flex; align-items: center; gap: 6px; }
.dash-link { color: var(--pink); font-weight: 800; font-size: .9rem; }
.mini-row { display: flex; align-items: center; gap: 10px; font-weight: 700; margin-bottom: 8px; }
.mini-rank { width: 24px; font-weight: 900; color: var(--text-mid); }
.mini-name { flex: 1; }
.mini-pts { color: var(--pink); font-weight: 900; }
.empty { color: var(--text-mid); font-size: .9rem; }
</style>

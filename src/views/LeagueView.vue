<template>
  <div class="league-page">
    <div class="container" v-if="activeLeague">
      <div class="league-header">
        <div>
          <h2 class="page-title" style="margin-bottom:4px">{{ activeLeague.name }}</h2>
          <p class="page-sub" style="margin-bottom:0">
            Invite code: <strong>{{ activeLeague.inviteCode }}</strong>
            <span v-if="isHost" class="pill pill-host" style="margin-left:8px">Host</span>
          </p>
        </div>
        <RouterLink v-if="isHost && !isMain" :to="`/leagues/${leagueId}/settings`" class="btn-ghost">Settings</RouterLink>
      </div>

      <div class="league-tabs">
        <RouterLink :to="`/leagues/${leagueId}`" :class="{ active: isDashboard }">Dashboard</RouterLink>
        <RouterLink v-if="!isMain" :to="`/leagues/${leagueId}/picks`" active-class="active">My Picks</RouterLink>
        <RouterLink :to="`/leagues/${leagueId}/leaderboard`" active-class="active">Leaderboard</RouterLink>
      </div>

      <RouterView />
    </div>
    <div v-else class="container empty-msg">Loading league…</div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { currentUser } from '../store/auth.js'
import { activeLeague, watchLeague } from '../store/leagues.js'
import { isMainLeague } from '../data/mainLeagues.js'

const route = useRoute()
const leagueId = computed(() => route.params.leagueId)
const isMain = computed(() => isMainLeague(leagueId.value))
const isHost = computed(() => activeLeague.value?.hostUserId === currentUser.value?.uid)
const isDashboard = computed(() => {
  const base = `/leagues/${leagueId.value}`
  return route.path === base || route.path === `${base}/`
})

let stopWatch = () => {}

watch(leagueId, (id) => {
  stopWatch()
  if (id) stopWatch = watchLeague(id)
}, { immediate: true })

onMounted(() => {
  if (leagueId.value) stopWatch = watchLeague(leagueId.value)
})

onUnmounted(() => stopWatch())
</script>

<style scoped>
.league-page { padding: 40px 0 60px; }
.league-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}
.league-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.league-tabs a {
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 800;
  color: var(--text-mid);
  text-decoration: none;
  background: rgba(255,255,255,.7);
}
.league-tabs a.active {
  background: var(--pink);
  color: #fff;
}
.btn-ghost {
  padding: 8px 16px;
  border: 2px solid var(--pink-light);
  border-radius: 999px;
  font-weight: 800;
  color: var(--pink);
  text-decoration: none;
  background: #fff;
}
.empty-msg { text-align: center; font-weight: 700; color: var(--text-mid); padding: 40px; }
</style>

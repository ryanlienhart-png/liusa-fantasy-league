<template>
  <div class="leagues-page">
    <div class="container">
      <h2 class="page-title">my leagues</h2>
      <p class="page-sub">Official leagues and any leagues you've created or joined.</p>

      <section class="section">
        <h3 class="section-head">Official Leagues</h3>
        <p class="section-sub">The original 28 managers — Villa League (15) and Casa League (13).</p>
        <div class="league-grid">
          <RouterLink
            v-for="league in MAIN_LEAGUES"
            :key="league.id"
            :to="`/leagues/${league.id}`"
            class="league-card official"
          >
            <h4>{{ league.name }}</h4>
            <span class="pill pill-host">Official</span>
            <p class="league-meta">{{ league.managers.length }} managers</p>
            <p class="league-links">
              <RouterLink :to="`/leagues/${league.id}/leaderboard`" @click.stop>Leaderboard</RouterLink>
              ·
              <RouterLink to="/managers" @click.stop>All Managers</RouterLink>
            </p>
          </RouterLink>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h3 class="section-head">Your Leagues</h3>
          <div class="actions">
            <RouterLink to="/leagues/create" class="btn-pink">Create League</RouterLink>
            <RouterLink to="/leagues/join" class="btn-secondary">Join with Code</RouterLink>
          </div>
        </div>

        <div v-if="!leaguesReady" class="empty-msg">Loading…</div>

        <div v-else-if="userLeagues.length === 0" class="empty-card">
          <p>You haven't created or joined any custom leagues yet.</p>
        </div>

        <div v-else class="league-grid">
          <RouterLink
            v-for="league in userLeagues"
            :key="league.id"
            :to="`/leagues/${league.id}`"
            class="league-card"
          >
            <h4>{{ league.name }}</h4>
            <span class="pill" :class="league.memberRole === 'host' ? 'pill-host' : 'pill-active'">
              {{ league.memberRole === 'host' ? 'Host' : 'Member' }}
            </span>
            <p class="league-code">Code: <strong>{{ league.inviteCode }}</strong></p>
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MAIN_LEAGUES } from '../data/mainLeagues.js'
import { myLeagues, leaguesReady } from '../store/leagues.js'

const userLeagues = computed(() => myLeagues.value.filter(l => !l.isMain))
</script>

<style scoped>
.leagues-page { padding: 40px 0 60px; }
.section { margin-bottom: 48px; }
.section-head {
  font-family: 'Pacifico', cursive;
  color: var(--pink);
  font-size: 1.3rem;
  margin-bottom: 6px;
}
.section-sub {
  color: var(--text-mid);
  font-weight: 700;
  font-size: .9rem;
  margin-bottom: 20px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-pink, .btn-secondary {
  padding: 10px 20px;
  border-radius: 999px;
  font-weight: 900;
  text-decoration: none;
  font-size: .9rem;
}
.btn-pink { background: var(--pink); color: #fff; }
.btn-secondary { background: #fff; color: var(--pink); border: 2px solid var(--pink); }
.league-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.league-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: transform .2s;
}
.league-card:hover { transform: translateY(-3px); }
.league-card.official { border-top: 4px solid var(--pink); }
.league-card h4 {
  font-family: 'Pacifico', cursive;
  color: var(--pink);
  margin-bottom: 8px;
}
.league-meta, .league-code {
  margin-top: 10px;
  font-size: .85rem;
  color: var(--text-mid);
  font-weight: 700;
}
.league-links {
  margin-top: 10px;
  font-size: .85rem;
  font-weight: 800;
}
.league-links a { color: var(--pink); }
.empty-card, .empty-msg {
  text-align: center;
  background: #fff;
  border-radius: var(--radius);
  padding: 32px;
  color: var(--text-mid);
  font-weight: 700;
}
</style>

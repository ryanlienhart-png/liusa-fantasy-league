<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <p class="you-got-text">you've got a text!!</p>
      <div class="li-logo">
        <img src="/love-island-logo.png" alt="Love Island USA" class="li-logo-img" />
      </div>
      <h1 class="fantasy-title">Fantasy League</h1>
      <p class="hosted-by">Hosted by <span>Sriyonce</span></p>
      <p class="season-badge">Summer 2026 &nbsp;·&nbsp; Villa League</p>

      <div class="hero-actions">
        <RouterLink to="/leaderboard" class="btn-primary">View Leaderboard</RouterLink>
        <RouterLink to="/islanders"   class="btn-secondary">Meet the Islanders</RouterLink>
      </div>
    </section>
    
    <!-- Quick stats -->
    <section class="stats-section container">
      <div class="stat-card">
        <span class="stat-num">15</span>
        <span class="stat-label">Managers</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ islanderCount }}</span>
        <span class="stat-label">Islanders</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">${{ prizePool }}</span>
        <span class="stat-label">Prize Pool</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ activeCount }}</span>
        <span class="stat-label">Still In</span>
      </div>
    </section>

    <!-- At-a-glance info -->
    <section class="info-section container">
      <div class="info-card">
        <h3>The Draft</h3>
        <p>Each manager drafts <strong>2 clients</strong> from the OG islanders. Islanders can be claimed by <strong>max 3 managers</strong>.</p>
      </div>
      <div class="info-card">
        <h3>Points</h3>
        <p>Your score is the sum of your two islanders' points. Events range from <strong>+50</strong> (Wins Love Island) to <strong>-30</strong> (major allegation).</p>
      </div>
      <div class="info-card">
        <h3>Bombshells</h3>
        <p>New islanders enter mid-season via <strong>waivers</strong>. Claim one by dropping a current client. Lower-ranked managers get priority.</p>
      </div>
      <div class="info-card">
        <h3>Winner</h3>
        <p>The manager with the <strong>most points</strong> at the finale takes home the entire <strong>$75 prize pot</strong> + eternal bragging rights.</p>
      </div>
    </section>

    <!-- Palms decoration -->
    <div class="palms" aria-hidden="true">🌴🌊🌴</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { islanders } from '../data/islanders.js'
import { managers }  from '../data/managers.js'
import { gameState } from '../store/game.js'

const islanderCount = computed(() => islanders.length + gameState.bombshells.length)
const prizePool     = computed(() => managers.length * 5)
const activeCount   = computed(() =>
  islanderCount.value - gameState.eliminated.length
)
</script>

<style scoped>
/* Hero */
.hero {
  min-height: calc(100vh - var(--nav-h));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: url('/beach-background.jpg') center center / cover no-repeat;
  filter: blur(6px);
  transform: scale(1.05);
  z-index: 0;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.45);
  z-index: 1;
}

.hero > * {
  position: relative;
  z-index: 2;
}

.you-got-text {
  font-family: 'Pacifico', cursive;
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: var(--pink);
  margin-bottom: 16px;
  letter-spacing: .04em;
  animation: fadeDown .8s ease both;
}

/* Love Island logo */
.li-logo {
  margin-bottom: 4px;
  animation: fadeDown .8s .1s ease both;
}
.li-logo-img {
  width: clamp(220px, 50vw, 380px);
  height: auto;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,.25));
}

.fantasy-title {
  font-size: clamp(2.5rem,10vw,5.5rem);
  color: var(--pink);
  text-shadow: 3px 3px 0 rgba(255,27,141,.25), -1px -1px 0 rgba(255,27,141,.1);
  margin-bottom: 8px;
  animation: fadeDown .8s .2s ease both;
}

.hosted-by {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-mid);
  margin-bottom: 4px;
  animation: fadeDown .8s .3s ease both;
}
.hosted-by span { color: var(--pink); font-weight: 900; }

.season-badge {
  font-size: 1.25rem;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(90deg, var(--pink), #FF8C00);
  padding: 6px 24px;
  border-radius: 999px;
  margin-bottom: 40px;
  animation: fadeDown .8s .4s ease both;
  box-shadow: 0 4px 16px rgba(255,27,141,.35);
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeDown .8s .5s ease both;
}

.btn-primary {
  background: var(--pink);
  color: #fff;
  padding: 14px 32px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 1rem;
  box-shadow: 0 4px 20px rgba(255,27,141,.4);
  transition: transform .2s, box-shadow .2s;
}
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(255,27,141,.5); }

.btn-secondary {
  background: #fff;
  color: var(--pink);
  padding: 14px 32px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 1rem;
  border: 2px solid var(--pink-light);
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
  transition: transform .2s, box-shadow .2s;
}
.btn-secondary:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(255,27,141,.2); }

/* Stats */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  padding: 0 20px 40px;
  margin-top: 16px;
}

.stat-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-num   { font-family: 'Pacifico', cursive; font-size: 2.5rem; color: var(--pink); }
.stat-label { font-size: .85rem; font-weight: 800; color: var(--text-mid); text-transform: uppercase; letter-spacing: .07em; }

/* Info cards */
.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 0 20px 60px;
}

.info-card {
  background: rgba(255,255,255,.85);
  border-radius: var(--radius);
  padding: 24px;
  border-top: 4px solid var(--pink);
  box-shadow: var(--shadow);
}
.info-card h3 {
  font-family: 'Pacifico', cursive;
  color: var(--pink);
  margin-bottom: 10px;
  font-size: 1.15rem;
}
.info-card p { font-size: .9rem; line-height: 1.6; color: var(--text-mid); }

/* Palms */
.palms {
  text-align: center;
  font-size: 2rem;
  padding: 0 0 30px;
  letter-spacing: 1rem;
  opacity: .6;
}

/* Animation */
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

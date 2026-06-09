<template>
  <div class="rules-page">
    <div class="container">
      <h2 class="page-title">the rules</h2>

      <!-- How it works -->
      <section class="rule-card">
        <h3>How It Works</h3>
        <ul>
          <li><strong>Sign up</strong> and create an account to become a manager.</li>
          <li><strong>Create or join</strong> a league with an invite code from your host.</li>
          <li>Each manager picks <strong>2 islanders</strong> in their league.</li>
          <li>Your score is the <strong>sum of your islanders' official points</strong>.</li>
          <li>Official points are set by the <strong>global admin</strong> after each episode — all leagues share the same scores.</li>
        </ul>
      </section>

      <!-- Leagues -->
      <section class="rule-card">
        <h3>Leagues</h3>
        <ul>
          <li>Anyone can <strong>create a league</strong> and become the host.</li>
          <li>Hosts invite friends with a unique <strong>invite code</strong>.</li>
          <li>Each league has its own <strong>leaderboard</strong> and managers.</li>
          <li>Hosts manage their league but <strong>cannot change official islander points</strong>.</li>
        </ul>
      </section>

      <!-- Bombshells -->
      <section class="rule-card">
        <h3>💣 Bombshells</h3>
        <ul>
          <li>New islanders enter throughout the season and are added by the <strong>global admin</strong>.</li>
          <li>Once added, bombshells appear globally and can be picked in any league.</li>
          <li>You can update your picks anytime to swap in a new islander.</li>
        </ul>
      </section>

      <!-- Points -->
      <section class="rule-card">
        <h3>Points System</h3>
        <p class="pts-intro">Points are awarded based on episode events. Negative points exist because… actions have consequences. There are also weekly <strong>bonus points</strong> voted on via groupchat.</p>

        <div class="pts-columns">
          <div>
            <h4 class="pts-head positive">Positive Points</h4>
            <table class="pts-table">
              <tbody>
                <tr v-for="e in positiveEvents" :key="e.id">
                  <td class="pts-val pos">+{{ e.points }}</td>
                  <td>{{ e.label }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h4 class="pts-head negative">Negative Points</h4>
            <table class="pts-table">
              <tbody>
                <tr v-for="e in negativeEvents" :key="e.id">
                  <td class="pts-val neg">{{ e.points }}</td>
                  <td>{{ e.label }}</td>
                </tr>
              </tbody>
            </table>

            <h4 class="pts-head bonus" style="margin-top:24px">Weekly Bonus (+5 each)</h4>
            <table class="pts-table">
              <tbody>
                <tr v-for="e in bonusEvents" :key="e.id">
                  <td class="pts-val pos">+{{ e.points }}</td>
                  <td>{{ e.label }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Payment -->
      <section class="rule-card commissioner">
        <h3>Payment + Winner</h3>
        <ul>
          <li>Send <strong>$5</strong> via Apple Pay or Zelle (preferred), Cashapp or Venmo accepted.</li>
          <li><strong>No payment = no draft spot.</strong></li>
          <li>The winner takes home the <strong>entire prize pot + bragging rights</strong>.</li>
        </ul>
        <p class="xoxo">XOXO, <strong>Srinasty</strong> aka <em>Sriniana Badix</em></p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { positiveEvents, negativeEvents, bonusEvents } from '../data/pointEvents.js'
</script>

<style scoped>
.rules-page { padding: 40px 0 60px; }

.rule-card {
  background: rgba(255,255,255,.9);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
  margin-bottom: 24px;
  border-top: 5px solid var(--pink);
}

.rule-card h3 {
  font-family: 'Pacifico', cursive;
  color: var(--pink);
  font-size: 1.5rem;
  margin-bottom: 16px;
}

.rule-card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rule-card li {
  padding-left: 24px;
  position: relative;
  line-height: 1.6;
  color: var(--text-mid);
}
.rule-card li::before {
  content: '💗';
  position: absolute;
  left: 0;
  font-size: .8rem;
  top: 3px;
}

.pts-intro {
  color: var(--text-mid);
  line-height: 1.7;
  margin-bottom: 20px;
}

.pts-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.pts-head {
  font-size: 1rem;
  font-weight: 900;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.pts-head.positive { color: #1a7a1a; }
.pts-head.negative { color: #a01a1a; }
.pts-head.bonus    { color: #8B6914; }

.pts-table { width: 100%; border-collapse: collapse; }
.pts-table tr { border-bottom: 1px solid #f0e0e8; }
.pts-table td { padding: 6px 8px; font-size: .88rem; color: var(--text-mid); }

.pts-val {
  font-weight: 900;
  width: 48px;
  white-space: nowrap;
  font-size: .95rem;
}
.pos { color: #1a7a1a; }
.neg { color: #a01a1a; }

.commissioner { border-top-color: var(--gold); }
.commissioner h3 { color: #9a6800; }

.xoxo {
  margin-top: 20px;
  font-size: 1rem;
  color: var(--pink);
  font-style: italic;
}

@media (max-width: 640px) {
  .pts-columns { grid-template-columns: 1fr; }
}
</style>

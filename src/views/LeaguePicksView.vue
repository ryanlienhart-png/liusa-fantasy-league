<template>
  <div class="picks-page">
    <h3 class="panel-title">Pick Your Islanders</h3>
    <p class="panel-sub">Choose 2 islanders. Your score is the sum of their global fantasy points.</p>

    <div v-if="locked" class="lock-banner">
      🔒 Picks are locked. Contact your league host if you need to make changes.
    </div>

    <p v-else class="limit-note">
      Max <strong>{{ maxClaims }}</strong> managers per islander in this league ({{ memberCount }} members).
      No two managers can have the same pair.
    </p>

    <div class="pick-slots">
      <div v-for="slot in [1, 2]" :key="slot" class="pick-slot">
        <label>Pick {{ slot }}</label>
        <select
          :value="pickForSlot(slot)"
          :disabled="locked"
          @change="onPickChange(slot, $event.target.value)"
        >
          <option value="">— Select islander —</option>
          <optgroup v-if="girls.length" label="Girls">
            <option v-for="i in girls" :key="i.id" :value="i.id" :disabled="isTaken(i.id, slot)">
              {{ i.name }} ({{ getIslanderPoints(i.id) }} pts){{ claimLabel(i.id) }}
            </option>
          </optgroup>
          <optgroup v-if="boys.length" label="Boys">
            <option v-for="i in boys" :key="i.id" :value="i.id" :disabled="isTaken(i.id, slot)">
              {{ i.name }} ({{ getIslanderPoints(i.id) }} pts){{ claimLabel(i.id) }}
            </option>
          </optgroup>
          <optgroup v-if="bombshells.length" label="Bombshells">
            <option v-for="i in bombshells" :key="i.id" :value="i.id" :disabled="isTaken(i.id, slot)">
              {{ i.name }} ({{ getIslanderPoints(i.id) }} pts){{ claimLabel(i.id) }}
            </option>
          </optgroup>
        </select>
      </div>
    </div>

    <div class="score-preview">
      <strong>Your score:</strong> {{ totalScore }} pts
    </div>
    <p v-if="error" class="auth-err">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { currentUser } from '../store/auth.js'
import { globalState, getIslanderPoints } from '../store/globalData.js'
import {
  activeLeague,
  activeLeagueMembers,
  activeLeaguePicks,
  maxClaimsPerIslander,
  setManagerPick,
  clearManagerPick,
} from '../store/leagues.js'
import { countIslanderClaims } from '../utils/pickValidation.js'

const route = useRoute()
const error = ref('')
const leagueId = computed(() => route.params.leagueId)

const locked = computed(() => activeLeague.value?.picksLocked ?? false)
const memberCount = computed(() => activeLeagueMembers.value.length)
const maxClaims = computed(() => maxClaimsPerIslander(memberCount.value))

const myPicks = computed(() =>
  activeLeaguePicks.value.filter(p => p.userId === currentUser.value?.uid)
)

const picksByMember = computed(() => {
  const map = {}
  for (const m of activeLeagueMembers.value) {
    const key = m.userId ?? m.legacyKey
    map[key] = activeLeaguePicks.value
      .filter(p => (p.userId ?? p.legacyKey) === key)
      .sort((a, b) => a.pickSlot - b.pickSlot)
      .map(p => p.islanderId)
  }
  return map
})

const girls = computed(() => globalState.islanders.filter(i => i.category === 'girl' && i.status !== 'dumped'))
const boys = computed(() => globalState.islanders.filter(i => i.category === 'boy' && i.status !== 'dumped'))
const bombshells = computed(() => globalState.islanders.filter(i => i.category === 'bombshell' && i.status !== 'dumped'))

const totalScore = computed(() =>
  myPicks.value.reduce((sum, p) => sum + getIslanderPoints(p.islanderId), 0)
)

function pickForSlot(slot) {
  return myPicks.value.find(p => p.pickSlot === slot)?.islanderId ?? ''
}

function isTaken(islanderId, currentSlot) {
  return myPicks.value.some(p => p.islanderId === islanderId && p.pickSlot !== currentSlot)
}

function claimLabel(islanderId) {
  const count = countIslanderClaims(picksByMember.value, islanderId, currentUser.value?.uid)
  if (count === 0) return ''
  return ` — ${count}/${maxClaims.value} claimed`
}

async function onPickChange(slot, islanderId) {
  error.value = ''
  try {
    if (!islanderId) {
      await clearManagerPick({ leagueId: leagueId.value, userId: currentUser.value.uid, pickSlot: slot })
    } else {
      await setManagerPick({
        leagueId: leagueId.value,
        userId: currentUser.value.uid,
        pickSlot: slot,
        islanderId,
      })
    }
  } catch (e) {
    error.value = e.message ?? 'Could not save pick.'
  }
}
</script>

<style scoped>
.panel-title {
  font-family: 'Pacifico', cursive;
  color: var(--pink);
  font-size: 1.4rem;
  margin-bottom: 4px;
}
.panel-sub { color: var(--text-mid); font-weight: 700; margin-bottom: 12px; }
.limit-note {
  background: var(--pink-pale);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: .9rem;
  font-weight: 700;
  color: var(--text-mid);
  margin-bottom: 20px;
}
.lock-banner {
  background: #fff8e1;
  border: 2px solid #ffc107;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 800;
  color: #856404;
  margin-bottom: 20px;
}
.pick-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.pick-slot label {
  display: block;
  font-weight: 800;
  margin-bottom: 6px;
  color: var(--text-mid);
}
.pick-slot select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--pink-light);
  border-radius: 10px;
  font: inherit;
}
.pick-slot select:disabled { opacity: .6; cursor: not-allowed; }
.score-preview {
  background: #fff;
  border-radius: var(--radius);
  padding: 16px 20px;
  font-size: 1.1rem;
  box-shadow: var(--shadow);
}
.auth-err { color: #c62828; font-weight: 700; margin-top: 12px; }
</style>

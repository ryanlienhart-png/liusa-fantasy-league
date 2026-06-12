<template>
  <div class="settings-page" v-if="activeLeague">
    <h3 class="panel-title">League Settings</h3>
    <p class="panel-sub">Host controls for this league only.</p>

    <form class="form-card" @submit.prevent="saveSettings">
      <label>
        League name
        <input v-model="name" type="text" required />
      </label>
      <label>
        Privacy
        <select v-model="privacy">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </label>
      <div class="invite-box">
        <strong>Invite code:</strong> {{ activeLeague.inviteCode }}
        <p class="hint">Share this code so others can join at Join League.</p>
      </div>
      <div class="lock-row">
        <div>
          <strong>Manager picks</strong>
          <p class="hint">When locked, members can't change their islander picks.</p>
        </div>
        <button type="button" class="lock-btn" :class="{ locked: picksLocked }" @click="togglePickLock">
          {{ picksLocked ? '🔒 Locked' : '🔓 Unlocked' }}
        </button>
      </div>
      <button class="btn-pink" type="submit" :disabled="saving">Save Settings</button>
      <p v-if="msg" class="msg">{{ msg }}</p>
    </form>

    <section class="members-section">
      <h4>Members ({{ members.length }})</h4>
      <div v-for="m in members" :key="m.id" class="member-row">
        <span>{{ m.userName }}</span>
        <span class="pill" :class="m.role === 'host' ? 'pill-host' : 'pill-active'">{{ m.role }}</span>
        <button
          v-if="m.role !== 'host'"
          class="btn-remove"
          @click="remove(m)"
        >Remove</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { currentUser } from '../store/auth.js'
import { activeLeague, activeLeagueMembers, updateLeague, removeMember, watchLeague, setLeaguePickLock } from '../store/leagues.js'
import { isMainLeague } from '../data/mainLeagues.js'

const route = useRoute()
const router = useRouter()
const leagueId = computed(() => route.params.leagueId)
const name = ref('')
const privacy = ref('public')
const picksLocked = ref(false)
const saving = ref(false)
const msg = ref('')

const members = computed(() => activeLeagueMembers.value)

watch(activeLeague, (l) => {
  if (l) {
    name.value = l.name
    privacy.value = l.privacy ?? 'public'
    picksLocked.value = l.picksLocked ?? false
    if (isMainLeague(leagueId.value) || l.hostUserId !== currentUser.value?.uid) {
      router.replace(`/leagues/${leagueId.value}`)
    }
  }
}, { immediate: true })

let stopWatch = () => {}
onMounted(() => {
  if (leagueId.value) stopWatch = watchLeague(leagueId.value)
})
onUnmounted(() => stopWatch())

async function saveSettings() {
  saving.value = true
  msg.value = ''
  try {
    await updateLeague(leagueId.value, { name: name.value.trim(), privacy: privacy.value })
    msg.value = 'Settings saved.'
  } catch (e) {
    msg.value = e.message
  } finally {
    saving.value = false
  }
}

async function remove(member) {
  if (!confirm(`Remove ${member.userName} from this league?`)) return
  await removeMember(member.id)
}

async function togglePickLock() {
  try {
    await setLeaguePickLock(leagueId.value, !picksLocked.value)
    picksLocked.value = !picksLocked.value
    msg.value = picksLocked.value ? 'Picks locked.' : 'Picks unlocked.'
  } catch (e) {
    msg.value = e.message
  }
}
</script>

<style scoped>
.panel-title {
  font-family: 'Pacifico', cursive;
  color: var(--pink);
  font-size: 1.4rem;
}
.panel-sub { color: var(--text-mid); font-weight: 700; margin-bottom: 24px; }
.form-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 480px;
  margin-bottom: 32px;
}
label { display: flex; flex-direction: column; gap: 6px; font-weight: 800; color: var(--text-mid); }
input, select { padding: 10px 14px; border: 2px solid var(--pink-light); border-radius: 10px; font: inherit; }
.invite-box {
  background: var(--pink-pale);
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 700;
}
.hint { font-size: .85rem; color: var(--text-mid); margin-top: 4px; }
.btn-pink {
  background: var(--pink);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  font-weight: 900;
  cursor: pointer;
  align-self: flex-start;
}
.msg { color: var(--pink-dark); font-weight: 700; }
.lock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: var(--cream);
  padding: 14px;
  border-radius: 10px;
}
.lock-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: 2px solid var(--pink-light);
  background: #fff;
  font-weight: 900;
  cursor: pointer;
  flex-shrink: 0;
}
.lock-btn.locked { background: #fff3cd; border-color: #ffc107; }
.members-section h4 { font-weight: 900; margin-bottom: 12px; }
.member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 8px;
  box-shadow: var(--shadow);
}
.member-row span:first-child { flex: 1; font-weight: 700; }
.btn-remove {
  background: none;
  border: 1px solid #e57373;
  color: #c62828;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: .8rem;
  font-weight: 800;
  cursor: pointer;
}
</style>

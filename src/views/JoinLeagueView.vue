<template>
  <div class="form-page">
    <div class="container">
      <h2 class="page-title">join league</h2>
      <p class="page-sub">Enter the invite code from your league host.</p>

      <form class="form-card" @submit.prevent="handleJoin">
        <label>
          Invite code
          <input
            v-model="inviteCode"
            type="text"
            required
            placeholder="e.g. ABC123"
            class="code-input"
            maxlength="8"
          />
        </label>
        <p v-if="error" class="auth-err">{{ error }}</p>
        <button class="btn-pink" type="submit" :disabled="loading">
          {{ loading ? 'Joining…' : 'Join League' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, userProfile } from '../store/auth.js'
import { joinLeagueByCode } from '../store/leagues.js'

const router = useRouter()
const inviteCode = ref('')
const error = ref('')
const loading = ref(false)

async function handleJoin() {
  error.value = ''
  loading.value = true
  try {
    const leagueId = await joinLeagueByCode({
      inviteCode: inviteCode.value,
      userId: currentUser.value.uid,
      userName: userProfile.value?.name ?? 'Manager',
    })
    router.push(`/leagues/${leagueId}`)
  } catch (e) {
    error.value = e.message ?? 'Could not join league.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-page { padding: 40px 0 60px; }
.form-card {
  max-width: 420px;
  margin: 0 auto;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 800;
  font-size: .9rem;
  color: var(--text-mid);
}
.code-input {
  text-transform: uppercase;
  letter-spacing: .15em;
  font-weight: 900;
  text-align: center;
  font-size: 1.2rem;
}
input {
  padding: 10px 14px;
  border: 2px solid var(--pink-light);
  border-radius: 10px;
  font: inherit;
}
.btn-pink {
  background: var(--pink);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 12px 24px;
  font-weight: 900;
  cursor: pointer;
}
.auth-err { color: #c62828; font-weight: 700; }
</style>

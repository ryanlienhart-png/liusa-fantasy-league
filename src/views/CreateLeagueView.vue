<template>
  <div class="form-page">
    <div class="container">
      <h2 class="page-title">create league</h2>
      <p class="page-sub">You'll be the host. Invite friends with your league code.</p>

      <form class="form-card" @submit.prevent="handleCreate">
        <label>
          League name
          <input v-model="name" type="text" required placeholder="e.g. Girls Trip League" />
        </label>
        <label>
          Privacy
          <select v-model="privacy">
            <option value="public">Public (anyone with code can join)</option>
            <option value="private">Private</option>
          </select>
        </label>
        <p v-if="error" class="auth-err">{{ error }}</p>
        <button class="btn-pink" type="submit" :disabled="loading">
          {{ loading ? 'Creating…' : 'Create League' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, userProfile } from '../store/auth.js'
import { createLeague } from '../store/leagues.js'

const router = useRouter()
const name = ref('')
const privacy = ref('public')
const error = ref('')
const loading = ref(false)

async function handleCreate() {
  error.value = ''
  loading.value = true
  try {
    const leagueId = await createLeague({
      name: name.value.trim(),
      privacy: privacy.value,
      hostUserId: currentUser.value.uid,
      hostName: userProfile.value?.name ?? 'Host',
    })
    router.push(`/leagues/${leagueId}`)
  } catch (e) {
    error.value = e.message ?? 'Could not create league.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-page { padding: 40px 0 60px; }
.form-card {
  max-width: 480px;
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
input, select {
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

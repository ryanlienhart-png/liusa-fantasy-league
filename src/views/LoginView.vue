<template>
  <div class="auth-page">
    <div class="container">
      <h2 class="page-title">log in</h2>
      <p class="page-sub">Welcome back to the villa.</p>

      <form class="auth-card" @submit.prevent="handleLogin">
        <label>
          Email
          <input v-model="email" type="email" required autocomplete="email" />
        </label>
        <label>
          Password
          <input v-model="password" type="password" required autocomplete="current-password" />
        </label>
        <p v-if="error" class="auth-err">{{ error }}</p>
        <button class="btn-pink" type="submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Log In' }}
        </button>
        <p class="auth-switch">
          No account? <RouterLink to="/signup">Sign up</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { logIn } from '../store/auth.js'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await logIn({ email: email.value, password: password.value })
    router.push(route.query.redirect ?? '/leagues')
  } catch (e) {
    error.value = e.message ?? 'Could not log in.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { padding: 40px 0 60px; }
.auth-card {
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
input {
  padding: 10px 14px;
  border: 2px solid var(--pink-light);
  border-radius: 10px;
  font: inherit;
}
input:focus { outline: none; border-color: var(--pink); }
.btn-pink {
  background: var(--pink);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 12px 24px;
  font-weight: 900;
  cursor: pointer;
}
.btn-pink:disabled { opacity: .6; cursor: not-allowed; }
.auth-err { color: #c62828; font-weight: 700; font-size: .9rem; }
.auth-switch { text-align: center; font-size: .9rem; color: var(--text-mid); }
.auth-switch a { color: var(--pink); font-weight: 800; }
</style>

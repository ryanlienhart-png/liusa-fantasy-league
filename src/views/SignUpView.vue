<template>
  <div class="auth-page">
    <div class="container">
      <h2 class="page-title">sign up</h2>
      <p class="page-sub">Create your manager account and join a league.</p>

      <form class="auth-card" @submit.prevent="handleSignUp">
        <label>
          Name
          <input v-model="name" type="text" required autocomplete="name" />
        </label>
        <label>
          Email
          <input v-model="email" type="email" required autocomplete="email" />
        </label>
        <label>
          Password
          <input v-model="password" type="password" required minlength="6" autocomplete="new-password" />
        </label>
        <p v-if="error" class="auth-err">{{ error }}</p>
        <button class="btn-pink" type="submit" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Sign Up' }}
        </button>
        <p class="auth-switch">
          Already have an account? <RouterLink to="/login">Log in</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp } from '../store/auth.js'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSignUp() {
  error.value = ''
  loading.value = true
  try {
    await signUp({ name: name.value, email: email.value, password: password.value })
    router.push('/leagues')
  } catch (e) {
    error.value = e.message ?? 'Could not create account.'
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

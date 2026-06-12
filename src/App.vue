<template>
  <div v-if="!ready" class="loading-screen">
    <p class="loading-heart">💛</p>
    <p class="loading-text">you've got a text!!</p>
    <p class="loading-sub">Loading Villa League…</p>
  </div>
  <div v-else class="app-shell">
    <NavBar />
    <main class="main-content">
      <RouterView />
    </main>
    <footer class="site-footer">
      <p>Summer 2026 &nbsp;·&nbsp; Hosted by <strong>Sriniana Badix</strong> &nbsp;·&nbsp; you've got a text!!</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NavBar from './components/NavBar.vue'
import { RouterView } from 'vue-router'
import { authReady } from './store/auth.js'
import { globalReady } from './store/globalData.js'
import { isReady as gameReady } from './store/game.js'

const ready = computed(() => authReady.value && globalReady.value && gameReady.value)
</script>

<style>
/* ─── Design tokens ─── */
:root {
  --pink:       #FF1B8D;
  --pink-dark:  #C2006A;
  --pink-light: #FFB3D9;
  --pink-pale:  #FFE0EF;
  --gold:       #FFD700;
  --gold-dark:  #C8A800;
  --cream:      #FFF8F0;
  --sand:       #FFECD2;
  --text:       #1a0820;
  --text-mid:   #5a2050;
  --nav-h:      64px;
  --radius:     16px;
  --shadow:     0 4px 24px rgba(255,27,141,.15);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  font-family: 'Nunito', sans-serif;
  background:
    linear-gradient(180deg,
      #7EC8E3 0%,
      #B8E4F9 12%,
      #E8F7FF 22%,
      #FFF8F0 35%,
      #FFE8C8 60%,
      #F5C87A 100%);
  background-attachment: fixed;
  min-height: 100vh;
  color: var(--text);
}

h1, h2, h3 { font-family: 'Pacifico', cursive; }
a { text-decoration: none; color: inherit; }

.app-shell { display: flex; flex-direction: column; min-height: 100vh; }
.main-content { flex: 1; padding-top: var(--nav-h); }

.loading-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}
.loading-heart { font-size: 3rem; animation: pulse 1.2s ease-in-out infinite; }
.loading-text { font-family: 'Pacifico', cursive; font-size: 1.5rem; color: var(--pink); }
.loading-sub { font-weight: 700; color: var(--text-mid); font-size: .95rem; }
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.2); }
}

.site-footer {
  text-align: center;
  padding: 20px;
  background: rgba(255,27,141,.08);
  border-top: 2px solid var(--pink-light);
  color: var(--text-mid);
  font-size: .85rem;
  font-weight: 700;
}

.container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

.page-title {
  font-family: 'Pacifico', cursive;
  color: var(--pink);
  font-size: clamp(1.8rem, 5vw, 3rem);
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 2px 2px 0 rgba(255,27,141,.15);
}

.page-sub {
  text-align: center;
  color: var(--text-mid);
  font-weight: 700;
  margin-bottom: 40px;
  font-size: 1rem;
}

.pill {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .05em;
}
.pill-active   { background: #d4edda; color: #155724; }
.pill-out      { background: #f8d7da; color: #721c24; }
.pill-bombshell{ background: #fff3cd; color: #856404; }
.pill-host     { background: linear-gradient(90deg, var(--pink), #FF8C00); color: #fff; }
</style>

<template>
  <nav class="navbar">
    <div class="nav-inner container">
      <RouterLink to="/" class="brand">
        <span class="brand-heart">💛</span>
      </RouterLink>

      <div class="nav-links" :class="{ open: menuOpen }">
        <RouterLink to="/"            @click="menuOpen=false">Home</RouterLink>
        <RouterLink to="/islanders"   @click="menuOpen=false">Islanders</RouterLink>
        <RouterLink to="/managers"    @click="menuOpen=false">Managers</RouterLink>
        <RouterLink to="/leaderboard" @click="menuOpen=false">Leaderboard</RouterLink>
        <RouterLink to="/rules"       @click="menuOpen=false">Rules</RouterLink>
        <RouterLink to="/admin"       @click="menuOpen=false" class="admin-link">Admin</RouterLink>
      </div>

      <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
const menuOpen = ref(false)
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  height: var(--nav-h);
  background: rgba(255,255,255,.85);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid var(--pink-light);
  box-shadow: 0 2px 16px rgba(255,27,141,.12);
}

.nav-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Pacifico', cursive;
  font-size: 1.25rem;
  color: var(--pink);
}
.brand-heart { font-size: 1.4rem; }

/* Links */
.nav-links {
  display: flex;
  gap: 6px;
  align-items: center;
}

.nav-links a {
  padding: 7px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: .9rem;
  color: var(--text-mid);
  transition: background .2s, color .2s;
}
.nav-links a:hover,
.nav-links a.router-link-active {
  background: var(--pink-pale);
  color: var(--pink);
}
.admin-link {
  background: var(--pink) !important;
  color: #fff !important;
}
.admin-link:hover {
  background: var(--pink-dark) !important;
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.hamburger span {
  display: block;
  width: 24px;
  height: 2.5px;
  background: var(--pink);
  border-radius: 2px;
}

@media (max-width: 768px) {
  .hamburger { display: flex; }
  .nav-links {
    display: none;
    position: absolute;
    top: var(--nav-h);
    left: 0; right: 0;
    background: rgba(255,255,255,.97);
    flex-direction: column;
    padding: 16px;
    gap: 8px;
    border-bottom: 2px solid var(--pink-light);
    box-shadow: 0 8px 24px rgba(255,27,141,.12);
  }
  .nav-links.open { display: flex; }
  .nav-links a { text-align: center; border-radius: 12px; }
}
</style>

<template>
  <div class="mgr-card" :style="{ '--accent': manager.color }">
    <!-- Manager header -->
    <div class="mgr-header">
      <div class="avatar" :style="{ background: manager.color }">
        <img
          v-if="manager.photo"
          :src="manager.photo"
          :alt="manager.name"
          class="avatar-img"
          @error="e => e.target.style.display = 'none'"
        />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="header-info">
        <div class="mgr-name">
          {{ manager.name }}
          <span v-if="manager.isHost" class="pill pill-host">Host</span>
        </div>
        <div class="score-row">
          <span class="score-num">{{ score }}</span>
          <span class="score-label">pts</span>
        </div>
      </div>
    </div>

    <!-- Islander client thumbnails -->
    <div class="clients">
      <template v-if="picksData.length">
        <div
          v-for="(p, i) in picksData"
          :key="p.name + i"
          class="client"
          :title="p.name"
        >
          <div class="client-thumb" :style="{ borderColor: 'var(--accent)' }">
            <img v-if="p.photo" :src="p.photo" :alt="p.name" @error="e => e.target.style.display = 'none'" />
            <span v-else>{{ p.initials }}</span>
          </div>
          <span class="client-name">{{ p.firstName }}</span>
        </div>
      </template>
      <span v-else class="pick-empty">No clients yet</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { gameState, getManagerScore } from '../store/game.js'
import { mgrKey } from '../data/managers.js'
import { islanders } from '../data/islanders.js'

const props = defineProps({
  manager: { type: Object, required: true },
})

const initials = computed(() =>
  props.manager.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
)
const picks = computed(() => gameState.managerPicks[mgrKey(props.manager)] || [])
const score = computed(() => getManagerScore(mgrKey(props.manager)))

// Fallback photos for bombshells added before the upload feature existed
const bombshellPhotos = {
  gabriel: '/islanders/gabriel.png',
  kayda:   '/islanders/kayda.jpg',
  corbin:  '/islanders/corbin.jpg',
  caleb:   '/islanders/caleb.jpg',
  jen:     '/islanders/jen.jpg',
  sol:     '/islanders/sol.jpg',
}

// Combine OG islanders + live bombshells into one reactive lookup
const allIslandersMap = computed(() => {
  const map = {}
  islanders.forEach(i => { map[i.name] = i })
  gameState.bombshells.forEach(b => {
    const key = b.name.toLowerCase()
    map[b.name] = {
      name: b.name,
      photo: b.photo || bombshellPhotos[key] || `/islanders/${key}.png`,
    }
  })
  return map
})

const picksData = computed(() =>
  picks.value.map(name => {
    const i = allIslandersMap.value[name]
    const firstName = name.split(' ')[0]
    const inits = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    return i
      ? { name: i.name, firstName, photo: i.photo ?? null, initials: inits }
      : { name, firstName, photo: null, initials: inits }
  })
)
</script>

<style scoped>
.mgr-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-top: 4px solid var(--accent);
  transition: transform .2s, box-shadow .2s;
}
.mgr-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(255,27,141,.2);
}

/* ── Header row ── */
.mgr-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 72px; height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Pacifico', cursive;
  font-size: 1.3rem;
  color: #fff;
  flex-shrink: 0;
  text-shadow: 0 1px 4px rgba(0,0,0,.3);
  overflow: hidden;
  position: relative;
}
.avatar-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.header-info { flex: 1; min-width: 0; }

.mgr-name {
  font-weight: 900;
  font-size: 1.05rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.score-row { display: flex; align-items: baseline; gap: 4px; }
.score-num  { font-size: 1.5rem; font-weight: 900; color: var(--pink); }
.score-label { font-size: .8rem; font-weight: 700; color: var(--text-mid); }

/* ── Clients row ── */
.clients {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  min-height: 80px;
  align-items: flex-start;
}

.client {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 64px;
}

.client-thumb {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 2.5px solid var(--accent);
  flex-shrink: 0;
}
.client-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}
.client-thumb span {
  font-weight: 800;
  color: #666;
  font-size: .8rem;
}

.client-name {
  font-size: .72rem;
  font-weight: 800;
  color: var(--text-mid);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 64px;
}

.pick-empty {
  color: #bbb;
  font-size: .85rem;
  font-weight: 700;
  align-self: center;
  margin: auto;
}

.pill { font-size: .7rem; font-weight: 800; border-radius: 999px; padding: 2px 8px; }
.pill-host { background: var(--gold); color: #7a4f00; }
</style>

<template>
  <div class="islanders-page">
    <div class="container">
      <h2 class="page-title">meet the islanders</h2>
      <p class="page-sub">these will be your clients.</p>

      <!-- Filters -->
      <div class="filters">
        <button
          v-for="f in filters" :key="f.key"
          class="filter-btn"
          :class="{ active: activeFilter === f.key }"
          @click="activeFilter = f.key"
        >{{ f.label }}</button>
      </div>

      <!-- OG Girls -->
      <template v-if="showGirls">
        <h3 class="section-head">Girls</h3>
        <div class="grid">
          <IslanderCard
            v-for="g in girls" :key="g.id"
            :islander="g"
            @click="openModal(g)"
          />
        </div>
      </template>

      <!-- OG Guys -->
      <template v-if="showGuys">
        <h3 class="section-head">Boys</h3>
        <div class="grid">
          <IslanderCard
            v-for="b in boys" :key="b.id"
            :islander="b"
            @click="openModal(b)"
          />
        </div>
      </template>

      <!-- Bombshells -->
      <template v-if="bombshells.length && showBombshells">
        <h3 class="section-head bomb-head">💣 Bombshells</h3>
        <div class="grid">
          <IslanderCard
            v-for="b in bombshells" :key="b.name"
            :islander="b"
            :isBombshell="true"
            @click="openModal(b)"
          />
        </div>
      </template>

      <p v-if="bombshells.length === 0 && activeFilter === 'bombshells'" class="empty-msg">
        No bombshells have entered the villa yet. 👀
      </p>
    </div>

    <!-- Points modal -->
    <Teleport to="body">
      <div v-if="selected" class="modal-backdrop" @click.self="selected = null">
        <div class="modal" role="dialog">
          <div class="modal-header" :style="{ background: selected.gradient }">
            <h3 class="modal-name">{{ selected.name }}</h3>
            <button class="modal-close" @click="selected = null" aria-label="Close">✕</button>
          </div>

          <div class="modal-body">
            <template v-if="selectedEvents.length">
              <table class="ev-table">
                <thead>
                  <tr>
                    <th class="col-ep">Ep.</th>
                    <th class="col-event">Event</th>
                    <th class="col-note">Note</th>
                    <th class="col-pts">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(ev, i) in selectedEvents" :key="i"
                    :class="ev.points >= 0 ? 'row-pos' : 'row-neg'"
                  >
                    <td class="col-ep">{{ ev.episode || '—' }}</td>
                    <td class="col-event">{{ ev.label }}</td>
                    <td class="col-note muted">{{ ev.note || '' }}</td>
                    <td class="col-pts" :class="ev.points >= 0 ? 'pts-pos' : 'pts-neg'">
                      {{ ev.points > 0 ? '+' : '' }}{{ ev.points }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="modal-total">
                Total: <strong>{{ selectedTotal }} pts</strong>
              </div>
            </template>
            <p v-else class="modal-empty">No events logged yet.</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IslanderCard from '../components/IslanderCard.vue'
import { globalState, getIslanderPoints } from '../store/globalData.js'
import { gameState } from '../store/game.js'

const filters = [
  { key: 'all',        label: 'All' },
  { key: 'girls',      label: 'Girls' },
  { key: 'boys',       label: 'Boys' },
  { key: 'bombshells', label: 'Bombshells' },
]
const activeFilter = ref('all')

const girls = computed(() => globalState.islanders.filter(i => i.category === 'girl'))
const boys  = computed(() => globalState.islanders.filter(i => i.category === 'boy'))
const bombshellPhotos = { gabriel: '/islanders/gabriel.png', kayda: '/islanders/kayda.jpg' }

const bombshells = computed(() => {
  const fromGlobal = globalState.islanders.filter(i => i.category === 'bombshell')
  const fromLegacy = gameState.bombshells.map(b => ({
    id: b.name,
    name: b.name,
    category: 'bombshell',
    status: 'active',
    gradient: b.gradient,
    imageUrl: b.photo || bombshellPhotos[b.name.toLowerCase()] || '',
    gender: b.gender,
  }))
  const seen = new Set(fromGlobal.map(i => i.name))
  return [...fromGlobal, ...fromLegacy.filter(b => !seen.has(b.name))]
})

const showGirls      = computed(() => ['all','girls'].includes(activeFilter.value))
const showGuys       = computed(() => ['all','boys'].includes(activeFilter.value))
const showBombshells = computed(() => ['all','bombshells'].includes(activeFilter.value))

const selected = ref(null)

const selectedEvents = computed(() => {
  if (!selected.value) return []
  return globalState.pointEvents
    .filter(e => e.islanderId === selected.value.id)
    .map(e => {
      const cat = globalState.scoringCategories.find(c => c.id === e.scoringCategoryId)
      return {
        episode: globalState.episodes.find(ep => ep.id === e.episodeId)?.episodeNumber ?? '',
        label: cat?.name ?? e.description ?? 'Event',
        note: e.description ?? '',
        points: e.points,
      }
    })
})

const selectedTotal = computed(() =>
  selected.value ? getIslanderPoints(selected.value.id) : 0
)

function openModal(islander) {
  selected.value = islander
}

function onKeydown(e) {
  if (e.key === 'Escape') selected.value = null
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.islanders-page { padding: 40px 0 60px; }

.filters {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 36px;
}
.filter-btn {
  padding: 8px 22px;
  border-radius: 999px;
  border: 2px solid var(--pink-light);
  background: #fff;
  font-weight: 800;
  font-size: .9rem;
  cursor: pointer;
  color: var(--text-mid);
  transition: all .2s;
}
.filter-btn.active,
.filter-btn:hover {
  background: var(--pink);
  border-color: var(--pink);
  color: #fff;
}

.section-head {
  font-family: 'Pacifico', cursive;
  color: var(--text-mid);
  font-size: 1.3rem;
  margin: 0 0 24px;
  padding-bottom: 8px;
  border-bottom: 2px dashed var(--pink-light);
}
.bomb-head { color: #c8640a; }

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  justify-content: center;
  margin-bottom: 48px;
}

.empty-msg {
  text-align: center;
  color: var(--text-mid);
  font-weight: 700;
  font-size: 1rem;
  margin-top: 20px;
}

/* ── Modal ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .55);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: 0 20px 60px rgba(0,0,0,.3);
  width: 100%;
  max-width: 580px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  flex-shrink: 0;
}

.modal-name {
  font-family: 'Pacifico', cursive;
  font-size: 1.5rem;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0,0,0,.25);
  margin: 0;
}

.modal-close {
  background: rgba(255,255,255,.25);
  border: none;
  color: #fff;
  font-size: 1.1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s;
  flex-shrink: 0;
}
.modal-close:hover { background: rgba(255,255,255,.4); }

.modal-body {
  overflow-y: auto;
  padding: 24px;
  flex: 1;
}

.ev-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .9rem;
}

.ev-table th {
  text-align: left;
  font-size: .75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-mid);
  padding: 6px 10px 10px;
  border-bottom: 2px solid var(--pink-light);
}

.ev-table td {
  padding: 9px 10px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}

.ev-table tr:last-child td { border-bottom: none; }

.row-pos { background: #f6fff8; }
.row-neg { background: #fff6f6; }
.row-adj { background: #fffbf0; }

.col-ep    { width: 44px; color: var(--text-mid); font-size: .8rem; white-space: nowrap; }
.col-event { font-weight: 700; }
.col-note  { font-size: .8rem; }
.col-pts   { width: 52px; text-align: right; font-weight: 900; white-space: nowrap; }

.pts-pos { color: #1a7f37; }
.pts-neg { color: #c62828; }
.muted   { color: var(--text-mid); font-style: italic; }

.modal-total {
  margin-top: 16px;
  text-align: right;
  font-size: 1.05rem;
  color: var(--text-mid);
}
.modal-total strong { color: var(--pink); font-size: 1.2rem; }

.modal-empty {
  text-align: center;
  color: var(--text-mid);
  font-weight: 700;
  padding: 20px 0;
}
</style>

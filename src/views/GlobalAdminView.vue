<template>
  <div class="admin-page">
    <div class="container">
      <h2 class="page-title">Global Admin</h2>
      <p class="page-sub">
        Official Islanders, scoring, and episode results — shared across all leagues.
        <RouterLink to="/admin/commissioner" class="commissioner-link">Commissioner tools</RouterLink>
        for Villa/Casa league picks &amp; legacy scoring.
      </p>

      <div class="tabs">
        <button v-for="t in tabs" :key="t.key" class="tab-btn" :class="{ active: tab === t.key }" @click="tab = t.key">
          {{ t.label }}
        </button>
      </div>

      <!-- Islanders -->
      <section v-if="tab === 'islanders'" class="tab-panel">
        <h3 class="panel-title">Manage Islanders</h3>
        <form class="inline-form" @submit.prevent="addNewIslander">
          <input v-model="newIslander.name" placeholder="Name" required />
          <select v-model="newIslander.category">
            <option value="girl">Girl</option>
            <option value="boy">Boy</option>
            <option value="bombshell">Bombshell</option>
          </select>
          <label class="file-label">
            Headshot
            <input type="file" accept="image/*" @change="onPhotoSelect" />
          </label>
          <input v-model="newIslander.imageUrl" placeholder="Or paste image URL" />
          <button class="btn-pink" type="submit" :disabled="uploading">
            {{ uploading ? 'Uploading…' : 'Add Islander' }}
          </button>
        </form>
        <div class="admin-list">
          <div v-for="i in globalState.islanders" :key="i.id" class="admin-row">
            <img v-if="i.imageUrl" :src="i.imageUrl" class="thumb" alt="" />
            <span>{{ i.name }}</span>
            <span class="pill pill-active">{{ i.category }}</span>
            <span class="pill" :class="i.status === 'active' ? 'pill-active' : 'pill-out'">{{ i.status }}</span>
            <span class="pts">{{ getIslanderPoints(i.id) }} pts</span>
            <button v-if="i.status === 'active'" class="btn-sm" @click="dump(i)">Mark Dumped</button>
            <button v-else class="btn-sm" @click="restore(i)">Restore</button>
          </div>
        </div>
      </section>

      <!-- Point results -->
      <section v-if="tab === 'points'" class="tab-panel">
        <h3 class="panel-title">Add Episode Results</h3>
        <form class="log-form" @submit.prevent="logPoints">
          <input v-model.number="logForm.episodeNumber" type="number" min="1" placeholder="Episode #" required style="width:110px" />
          <select v-model="logForm.islanderId" required>
            <option value="">— Islander —</option>
            <option v-for="i in globalState.islanders" :key="i.id" :value="i.id">{{ i.name }}</option>
          </select>
          <select v-model="logForm.categoryId" required @change="onCategoryChange">
            <option value="">— Scoring category —</option>
            <option v-for="c in globalState.scoringCategories" :key="c.id" :value="c.id">
              {{ c.points > 0 ? '+' : '' }}{{ c.points }} — {{ c.name }}
            </option>
          </select>
          <input v-model="logForm.description" placeholder="Note (optional)" />
          <button class="btn-pink" type="submit">Add Result</button>
        </form>

        <h4 class="sub-head">Recent results</h4>
        <div class="admin-list">
          <div v-for="ev in recentEvents" :key="ev.id" class="admin-row">
            <span>{{ islanderName(ev.islanderId) }}</span>
            <span>{{ categoryName(ev.scoringCategoryId) }}</span>
            <span class="pts" :class="{ neg: ev.points < 0 }">{{ ev.points > 0 ? '+' : '' }}{{ ev.points }}</span>
            <button class="btn-sm danger" @click="removeEvent(ev.id)">Delete</button>
          </div>
        </div>
      </section>

      <!-- League pick locks -->
      <section v-if="tab === 'locks'" class="tab-panel">
        <h3 class="panel-title">Pick Locks</h3>
        <p class="panel-sub">Lock picks in custom leagues so managers can't change islanders.</p>
        <div class="admin-list">
          <div v-for="league in MAIN_LEAGUES" :key="league.id" class="admin-row">
            <span>{{ league.name }} (official)</span>
            <span class="hint">Use Commissioner Tools lock for Villa/Casa draft picks.</span>
          </div>
        </div>
        <p class="panel-sub" style="margin-top:20px">Custom leagues you've joined or host:</p>
        <div class="admin-list">
          <div v-for="league in customLeagues" :key="league.id" class="admin-row">
            <span>{{ league.name }}</span>
            <button class="lock-btn" :class="{ locked: league.picksLocked }" @click="toggleLeagueLock(league)">
              {{ league.picksLocked ? '🔒 Locked' : '🔓 Unlocked' }}
            </button>
          </div>
          <p v-if="customLeagues.length === 0" class="hint">No custom leagues yet.</p>
        </div>
      </section>

      <p v-if="error" class="auth-err">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { currentUser } from '../store/auth.js'
import { MAIN_LEAGUES } from '../data/mainLeagues.js'
import {
  globalState,
  getIslanderPoints,
  addIslander,
  updateIslander,
  addPointEvent,
  removePointEvent,
} from '../store/globalData.js'
import { myLeagues, setLeaguePickLock } from '../store/leagues.js'
import { uploadIslanderPhoto } from '../utils/storage.js'

const tab = ref('islanders')
const error = ref('')
const uploading = ref(false)
const photoFile = ref(null)
const tabs = [
  { key: 'islanders', label: 'Islanders' },
  { key: 'points', label: 'Results' },
  { key: 'locks', label: 'Pick Locks' },
]

const newIslander = reactive({ name: '', category: 'girl', imageUrl: '' })
const logForm = reactive({ episodeNumber: '', islanderId: '', categoryId: '', description: '', points: 0 })

const customLeagues = computed(() => myLeagues.value.filter(l => !l.isMain))

const recentEvents = computed(() =>
  [...globalState.pointEvents]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 30)
)

function islanderName(id) {
  return globalState.islanders.find(i => i.id === id)?.name ?? id
}

function categoryName(id) {
  return globalState.scoringCategories.find(c => c.id === id)?.name ?? id
}

function onPhotoSelect(e) {
  photoFile.value = e.target.files?.[0] ?? null
}

function onCategoryChange() {
  const cat = globalState.scoringCategories.find(c => c.id === logForm.categoryId)
  logForm.points = cat?.points ?? 0
}

async function addNewIslander() {
  error.value = ''
  uploading.value = true
  try {
    let imageUrl = newIslander.imageUrl
    if (photoFile.value) {
      imageUrl = await uploadIslanderPhoto(photoFile.value, newIslander.name)
    }
    await addIslander({
      name: newIslander.name.trim(),
      category: newIslander.category,
      imageUrl: imageUrl || '',
      gradient: 'linear-gradient(135deg, #FF1B8D, #FF8C00)',
    })
    newIslander.name = ''
    newIslander.imageUrl = ''
    photoFile.value = null
  } catch (e) { error.value = e.message }
  finally { uploading.value = false }
}

async function dump(i) {
  await updateIslander(i.id, { status: 'dumped' })
}

async function restore(i) {
  await updateIslander(i.id, { status: 'active' })
}

async function logPoints() {
  error.value = ''
  try {
    await addPointEvent({
      episodeId: logForm.episodeNumber,
      islanderId: logForm.islanderId,
      scoringCategoryId: logForm.categoryId,
      points: logForm.points,
      description: logForm.description,
      createdBy: currentUser.value?.uid,
    })
    logForm.description = ''
  } catch (e) { error.value = e.message }
}

async function removeEvent(id) {
  await removePointEvent(id)
}

async function toggleLeagueLock(league) {
  try {
    await setLeaguePickLock(league.id, !league.picksLocked)
  } catch (e) {
    error.value = e.message
  }
}
</script>

<style scoped>
.admin-page { padding: 40px 0 60px; }
.tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.tab-btn {
  padding: 8px 16px;
  border: 2px solid var(--pink-light);
  border-radius: 999px;
  background: #fff;
  font-weight: 800;
  cursor: pointer;
  color: var(--text-mid);
}
.tab-btn.active { background: var(--pink); color: #fff; border-color: var(--pink); }
.tab-panel { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: 24px; }
.panel-title { font-family: 'Pacifico', cursive; color: var(--pink); margin-bottom: 8px; }
.panel-sub { color: var(--text-mid); font-weight: 700; margin-bottom: 16px; }
.inline-form, .log-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  align-items: flex-end;
}
input, select {
  padding: 8px 12px;
  border: 2px solid var(--pink-light);
  border-radius: 8px;
  font: inherit;
}
.file-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 800;
  font-size: .85rem;
  color: var(--text-mid);
}
.btn-pink {
  background: var(--pink);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  font-weight: 900;
  cursor: pointer;
}
.admin-list { display: flex; flex-direction: column; gap: 8px; }
.admin-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--cream);
  border-radius: 10px;
  flex-wrap: wrap;
}
.admin-row span:first-of-type { flex: 1; font-weight: 800; min-width: 100px; }
.thumb { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.pts { font-weight: 900; color: var(--pink); }
.pts.neg { color: #c62828; }
.btn-sm {
  border: 1px solid var(--pink-light);
  background: #fff;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: .8rem;
  font-weight: 800;
  cursor: pointer;
}
.btn-sm.danger { border-color: #e57373; color: #c62828; }
.lock-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 2px solid var(--pink-light);
  background: #fff;
  font-weight: 900;
  cursor: pointer;
}
.lock-btn.locked { background: #fff3cd; border-color: #ffc107; }
.sub-head { font-weight: 900; margin: 20px 0 12px; }
.hint { font-size: .85rem; color: var(--text-mid); font-weight: 700; }
.auth-err { color: #c62828; font-weight: 700; margin-top: 16px; }
.commissioner-link { color: var(--pink); font-weight: 900; margin-left: 6px; }
</style>

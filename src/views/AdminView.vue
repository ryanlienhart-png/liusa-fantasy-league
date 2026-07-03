<template>
  <div class="admin-page">
    <div class="container">

      <template v-if="!authed">
        <p class="auth-lede">Global admin access required.</p>
      </template>

      <template v-else>
        <div class="admin-header">
          <h2 class="page-title" style="margin-bottom:0">Commissioner Tools</h2>
          <div class="header-actions">
            <button
              class="lock-btn"
              :class="{ locked: gameState.picksLocked }"
              @click="togglePickLock"
            >
              {{ gameState.picksLocked ? '🔒 Picks Locked' : '🔓 Unlock Picks' }}
            </button>
            <RouterLink to="/admin" class="btn-ghost">Global Admin</RouterLink>
          </div>
        </div>
        <p v-if="gameState.picksLocked" class="lock-notice">Villa &amp; Casa draft picks are locked. Managers cannot be reassigned until you unlock.</p>
        <p v-if="pickError" class="auth-err">{{ pickError }}</p>

        <!-- Tabs -->
        <div class="tabs">
          <button v-for="t in tabs" :key="t.key" class="tab-btn" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
            {{ t.label }}
          </button>
        </div>

        <!-- ── TAB: Draft Picks ── -->
        <section v-if="activeTab === 'picks'" class="tab-panel">
          <h3 class="panel-title">Assign Draft Picks</h3>
          <p class="panel-sub">Each manager gets 2 islanders. Max 3 managers per islander.</p>

          <div class="picks-grid">
            <div v-for="m in managers" :key="mgrKey(m)" class="pick-row">
              <div class="pick-mgr" :style="{ borderLeftColor: m.color }">
                <strong>{{ m.name }}</strong>
                <span v-if="m.league === 'casa'" class="pill" style="margin-left:6px;background:#fff3e0;color:#E65100;font-size:.7rem">Casa</span>
                <span v-if="m.isHost" class="pill pill-host" style="margin-left:4px">Host</span>
              </div>
              <div class="pick-selects">
                <select v-model="draftSelections[mgrKey(m)][0]" class="pick-select" :disabled="gameState.picksLocked" @change="savePick(m)">
                  <option value="">— Pick 1 —</option>
                  <option v-for="isl in allIslanderNames" :key="isl" :value="isl">{{ isl }}</option>
                </select>
                <select v-model="draftSelections[mgrKey(m)][1]" class="pick-select" :disabled="gameState.picksLocked" @change="savePick(m)">
                  <option value="">— Pick 2 —</option>
                  <option v-for="isl in allIslanderNames" :key="isl" :value="isl">{{ isl }}</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- ── TAB: Log Points ── -->
        <section v-if="activeTab === 'points'" class="tab-panel">
          <h3 class="panel-title">Log Point Event</h3>

          <div class="log-form">
            <div class="form-row">
              <label>Islander</label>
              <select v-model="logForm.islander" class="pick-select">
                <option value="">— Select Islander —</option>
                <option v-for="n in allIslanderNames" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
            <div class="form-row">
              <label>Event</label>
              <select v-model="logForm.eventId" class="pick-select">
                <option value="">— Select Event —</option>
                <optgroup label="Positive">
                  <option v-for="e in positiveEvents" :key="e.id" :value="e.id">+{{ e.points }} — {{ e.label }}</option>
                </optgroup>
                <optgroup label="Negative">
                  <option v-for="e in negativeEvents" :key="e.id" :value="e.id">{{ e.points }} — {{ e.label }}</option>
                </optgroup>
                <optgroup label="Bonus">
                  <option v-for="e in bonusEvents" :key="e.id" :value="e.id">+{{ e.points }} — {{ e.label }}</option>
                </optgroup>
              </select>
            </div>
            <div class="form-row">
              <label>Episode # <em>(optional)</em></label>
              <input v-model="logForm.episode" type="text" class="pick-select" placeholder="e.g. 3" />
            </div>
            <div class="form-row">
              <label>Note <em>(optional)</em></label>
              <input v-model="logForm.note" type="text" class="pick-select" placeholder="e.g. Chose Gabriel at recoupling" />
            </div>
            <button class="btn-pink" :disabled="!logForm.islander || !logForm.eventId" @click="submitLog">
              + Log Event
            </button>
            <p v-if="logSuccess" class="success-msg">✅ Event logged!</p>
          </div>

          <!-- Event history per islander -->
          <div v-if="logForm.islander && islanderLog.length" class="event-history">
            <h4>{{ logForm.islander }}'s Events</h4>
            <div class="event-list">
              <div v-for="(ev, i) in islanderLog" :key="i" class="event-item" :class="ev.points > 0 ? 'ev-pos' : 'ev-neg'">
                <span class="ev-pts">{{ ev.points > 0 ? '+' : '' }}{{ ev.points }}</span>
                <span class="ev-label">{{ ev.label }}</span>
                <span v-if="ev.episode" class="ev-ep">Ep. {{ ev.episode }}</span>
                <span v-if="ev.note" class="ev-note">{{ ev.note }}</span>
                <button class="ev-del" @click="removeEvent(logForm.islander, i)" title="Remove">✕</button>
              </div>
            </div>
            <p class="ev-total">Total: <strong>{{ islanderTotal }}</strong> pts</p>
          </div>
        </section>

        <!-- ── TAB: Roster ── -->
        <section v-if="activeTab === 'roster'" class="tab-panel">
          <h3 class="panel-title">Manage Roster</h3>

          <h4 class="sub-panel-head">OG Islanders</h4>
          <div class="roster-grid">
            <div v-for="isl in islanders" :key="isl.name" class="roster-item">
              <div class="roster-swatch" :style="{ background: isl.gradient }">{{ isl.name[0] }}</div>
              <span class="roster-name">{{ isl.name }}</span>
              <span class="roster-pts">{{ getIslanderPoints(isl.name) }} pts</span>
              <button
                class="toggle-elim-btn"
                :class="isEliminated(isl.name) ? 'btn-restore' : 'btn-elim'"
                @click="toggleEliminated(isl.name)"
              >
                {{ isEliminated(isl.name) ? 'Restore Dumped' : 'Mark Dumped' }}
              </button>
            </div>
          </div>

          <h4 class="sub-panel-head" style="margin-top:32px">Bombshells</h4>
          <div class="bomb-add">
            <input v-model="bombForm.name" type="text" class="pick-select" placeholder="Bombshell name" />
            <select v-model="bombForm.gender" class="pick-select bomb-gender">
              <option value="female">Girl</option>
              <option value="male">Boy</option>
            </select>
            <label class="bomb-upload-btn">
              {{ bombForm.file ? bombForm.file.name : '📷 Photo' }}
              <input ref="bombFileInput" type="file" accept="image/*" style="display:none" @change="e => bombForm.file = e.target.files[0]" />
            </label>
            <button class="btn-pink" :disabled="!bombForm.name.trim() || bombUploading" @click="addBombshell">
              {{ bombUploading ? 'Processing…' : '+ Add Bombshell' }}
            </button>
          </div>
          <p v-if="bombUploadErr" class="auth-err" style="margin-top:8px">{{ bombUploadErr }}</p>
          <div v-if="gameState.bombshells.length" class="roster-grid" style="margin-top:12px">
            <div v-for="b in gameState.bombshells" :key="b.name" class="roster-item">
              <div class="roster-swatch bomb-swatch">💣</div>
              <span class="roster-name">{{ b.name }}</span>
              <span class="roster-pts">{{ getIslanderPoints(b.name) }} pts</span>
              <button
                class="toggle-elim-btn"
                :class="(b.status === 'dumped') ? 'btn-restore' : 'btn-elim'"
                @click="toggleBombshellStatus(b.name)"
              >
                {{ (b.status === 'dumped') ? 'Restore Dumped' : 'Mark Dumped' }}
              </button>
            </div>
          </div>
          <p v-else class="empty-msg">No bombshells yet.</p>
        </section>

        <!-- ── TAB: Couples ── -->
        <section v-if="activeTab === 'couples'" class="tab-panel">
          <h3 class="panel-title">Couples</h3>
          <p class="panel-sub">Pair two islanders together. Their card will show the partner's name.</p>

          <div class="couple-form">
            <select v-model="coupleForm.a" class="pick-select">
              <option value="">— Islander 1 —</option>
              <option v-for="n in allIslanderNames" :key="n" :value="n">{{ n }}</option>
            </select>
            <span class="couple-heart">❤</span>
            <select v-model="coupleForm.b" class="pick-select">
              <option value="">— Islander 2 —</option>
              <option v-for="n in allIslanderNames" :key="n" :value="n">{{ n }}</option>
            </select>
            <button
              class="btn-pink"
              :disabled="!coupleForm.a || !coupleForm.b || coupleForm.a === coupleForm.b"
              @click="coupleUp"
            >Couple Up</button>
          </div>

          <div v-if="couplesList.length" class="couples-list">
            <div v-for="c in couplesList" :key="c.a + c.b" class="couple-item">
              <span class="couple-names">{{ c.a }} <span class="couple-heart">❤</span> {{ c.b }}</span>
              <button class="toggle-elim-btn btn-elim" @click="removeCouple(c.a)">Split</button>
            </div>
          </div>
          <p v-else class="empty-msg">No couples set yet.</p>
        </section>

        <!-- ── TAB: Override Points ── -->
        <section v-if="activeTab === 'override'" class="tab-panel">
          <h3 class="panel-title">Override Points</h3>
          <p class="panel-sub">Set a bonus (or deduction) on top of earned points. Click <strong>Review Changes</strong> when ready — nothing saves until you confirm.</p>

          <h4 class="sub-panel-head">Islander Bonuses</h4>
          <div class="ov-table">
            <div class="ov-head">
              <span>Islander</span>
              <span class="ov-r">Event Pts</span>
              <span class="ov-r">Bonus</span>
              <span class="ov-r">Total</span>
            </div>
            <div v-for="name in allIslanderNames" :key="name" class="ov-row">
              <span class="ov-name">{{ name }}</span>
              <span class="ov-r ov-dim">{{ getIslanderEventPoints(name) }}</span>
              <input v-model.number="islAdj[name]" type="number" class="ov-input" @focus="$event.target.select()" />
              <span class="ov-r ov-bold" :class="{ 'ov-pos': ovIslanderTotal(name) > 0, 'ov-neg': ovIslanderTotal(name) < 0 }">
                {{ ovIslanderTotal(name) }}
              </span>
            </div>
          </div>

          <h4 class="sub-panel-head" style="margin-top:36px">Manager Bonuses</h4>
          <div class="ov-table">
            <div class="ov-head">
              <span>Manager</span>
              <span class="ov-r">Pick Score</span>
              <span class="ov-r">Bonus</span>
              <span class="ov-r">Total</span>
            </div>
            <div v-for="m in managers" :key="mgrKey(m)" class="ov-row">
              <span class="ov-name">{{ m.name }}<em v-if="m.storeKey" style="font-size:.75rem;color:var(--text-mid);margin-left:4px">(Casa)</em></span>
              <span class="ov-r ov-dim">{{ getManagerPicksScore(mgrKey(m)) }}</span>
              <input v-model.number="mgrAdj[mgrKey(m)]" type="number" class="ov-input" @focus="$event.target.select()" />
              <span class="ov-r ov-bold">{{ ovMgrTotal(m) }}</span>
            </div>
          </div>

          <div style="margin-top:28px" v-if="!showOvConfirm">
            <button class="btn-pink" @click="reviewOvChanges">Review Changes</button>
          </div>

          <div v-if="showOvConfirm" class="ov-confirm">
            <h4 class="ov-confirm-title">Confirm Changes</h4>
            <template v-if="ovChanges.length">
              <div v-for="c in ovChanges" :key="c.label" class="ov-change-item">
                <span class="ovc-label">{{ c.label }}</span>
                <span class="ovc-arrow">{{ c.from }} pts → <strong>{{ c.to }} pts</strong></span>
              </div>
            </template>
            <p v-else class="empty-msg" style="margin:0">No changes detected.</p>
            <div class="ov-confirm-actions">
              <button class="btn-pink" :disabled="!ovChanges.length" @click="saveOvChanges">✅ Confirm & Save</button>
              <button class="btn-ghost" @click="showOvConfirm = false">Cancel</button>
            </div>
            <p v-if="ovSaved" class="success-msg">✅ Saved!</p>
          </div>
        </section>

        <!-- ── TAB: Reset ── -->
        <section v-if="activeTab === 'reset'" class="tab-panel">
          <h3 class="panel-title">Data Management</h3>
          <p class="panel-sub danger-text">These actions cannot be undone.</p>
          <div class="reset-btns">
            <button class="btn-danger" @click="confirmReset('points')">Reset All Points</button>
            <button class="btn-danger" @click="confirmReset('picks')">Reset All Draft Picks</button>
            <button class="btn-danger" @click="confirmReset('all')">Reset Everything</button>
          </div>
          <p v-if="resetMsg" class="success-msg">{{ resetMsg }}</p>
        </section>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { isGlobalAdmin } from '../store/auth.js'
import { managers, mgrKey } from '../data/managers.js'
import { islanders }  from '../data/islanders.js'
import { positiveEvents, negativeEvents, bonusEvents } from '../data/pointEvents.js'
import {
  gameState,
  getIslanderPoints,
  getIslanderEventPoints,
  getManagerScore,
  getManagerPicksScore,
  isEliminated,
  setManagerPicks,
  setPickLock,
  logEvent,
  removeEvent,
  toggleEliminated,
  addBombshell as storeAddBombshell,
  toggleBombshellStatus,
  setAdjustments,
  setCouple,
  removeCouple,
  resetPoints,
  resetPicks,
  resetAll,
} from '../store/game.js'
const authed = ref(false)
const pickError = ref('')
const bombUploading = ref(false)

watch(isGlobalAdmin, (v) => { authed.value = v }, { immediate: true })

const tabs = [
  { key: 'picks',    label: '📋 Draft Picks'     },
  { key: 'points',   label: '🏆 Log Points'      },
  { key: 'roster',   label: '🌴 Roster'          },
  { key: 'couples',  label: '❤️ Couples'         },
  { key: 'override', label: '✏️ Override Points' },
  { key: 'reset',    label: '⚠️ Reset'           },
]
const activeTab = ref('picks')

// ── Draft picks ──
const draftSelections = reactive({})
managers.forEach(m => {
  draftSelections[mgrKey(m)] = [...(gameState.managerPicks[mgrKey(m)] || ['', ''])]
  while (draftSelections[mgrKey(m)].length < 2) draftSelections[mgrKey(m)].push('')
})

function savePick(m) {
  pickError.value = ''
  const key = mgrKey(m)
  try {
    const picks = draftSelections[key].filter(Boolean)
    setManagerPicks(key, picks, { league: m.league })
  } catch (e) {
    pickError.value = e.message
  }
}

function togglePickLock() {
  setPickLock(!gameState.picksLocked)
}

const allIslanderNames = computed(() => {
  const og    = islanders.map(i => i.name)
  const bombs = gameState.bombshells.map(b => b.name)
  return [...og, ...bombs]
})

// ── Log points ──
const logForm = reactive({ islander: '', eventId: '', episode: '', note: '' })
const logSuccess = ref(false)
let logTimer = null

const islanderLog = computed(() =>
  logForm.islander ? (gameState.islanderEvents[logForm.islander] || []) : []
)
const islanderTotal = computed(() => getIslanderPoints(logForm.islander))

function submitLog() {
  logEvent(logForm.islander, logForm.eventId, logForm.episode, logForm.note)
  logForm.eventId = ''; logForm.episode = ''; logForm.note = ''
  logSuccess.value = true
  clearTimeout(logTimer)
  logTimer = setTimeout(() => { logSuccess.value = false }, 2500)
}

// ── Roster ──
const bombForm      = reactive({ name: '', gender: 'female', file: null })
const bombFileInput = ref(null)
const bombUploadErr = ref('')

function resizeToBase64(file, maxSize = 300) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const ratio  = Math.min(maxSize / img.width, maxSize / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

async function addBombshell() {
  if (!bombForm.name.trim()) return
  bombUploading.value = true
  bombUploadErr.value = ''
  try {
    let photo = null
    if (bombForm.file) {
      photo = await resizeToBase64(bombForm.file)
    }
    storeAddBombshell(bombForm.name.trim(), null, bombForm.gender, photo)
    bombForm.name   = ''
    bombForm.gender = 'female'
    bombForm.file   = null
    if (bombFileInput.value) bombFileInput.value.value = ''
  } catch (e) {
    bombUploadErr.value = 'Image processing failed. Try a different photo.'
  } finally {
    bombUploading.value = false
  }
}

// ── Couples ──
const coupleForm = reactive({ a: '', b: '' })

const couplesList = computed(() => gameState.couples)

function coupleUp() {
  if (!coupleForm.a || !coupleForm.b || coupleForm.a === coupleForm.b) return
  setCouple(coupleForm.a, coupleForm.b)
  coupleForm.a = ''
  coupleForm.b = ''
}

// ── Override Points ──
const islAdj        = reactive({})
const mgrAdj        = reactive({})
const showOvConfirm = ref(false)
const ovChanges     = ref([])
const ovSaved       = ref(false)
let ovSavedTimer    = null

function initOvAdj() {
  allIslanderNames.value.forEach(name => {
    islAdj[name] = gameState.islanderAdjustments[name] ?? 0
  })
  managers.forEach(m => {
    mgrAdj[mgrKey(m)] = gameState.managerAdjustments[mgrKey(m)] ?? 0
  })
}

watch(activeTab, (tab) => { if (tab === 'override') initOvAdj() })

function ovIslanderTotal(name) {
  const adj = Number.isFinite(islAdj[name]) ? islAdj[name] : 0
  return getIslanderEventPoints(name) + adj
}

function ovMgrTotal(m) {
  const adj = Number.isFinite(mgrAdj[mgrKey(m)]) ? mgrAdj[mgrKey(m)] : 0
  return getManagerPicksScore(mgrKey(m)) + adj
}

function reviewOvChanges() {
  const changes = []
  allIslanderNames.value.forEach(name => {
    const oldAdj = gameState.islanderAdjustments[name] ?? 0
    const newAdj = Number.isFinite(islAdj[name]) ? islAdj[name] : 0
    if (oldAdj !== newAdj) {
      const base = getIslanderEventPoints(name)
      changes.push({ label: `${name} (islander)`, from: base + oldAdj, to: base + newAdj })
    }
  })
  managers.forEach(m => {
    const key    = mgrKey(m)
    const oldAdj = gameState.managerAdjustments[key] ?? 0
    const newAdj = Number.isFinite(mgrAdj[key]) ? mgrAdj[key] : 0
    if (oldAdj !== newAdj) {
      const label = m.storeKey ? `${m.name} (Casa)` : m.name
      changes.push({ label: `${label} (manager)`, from: getManagerPicksScore(key) + oldAdj, to: getManagerPicksScore(key) + newAdj })
    }
  })
  ovChanges.value = changes
  showOvConfirm.value = true
}

function saveOvChanges() {
  const iMap = {}
  allIslanderNames.value.forEach(name => {
    iMap[name] = Number.isFinite(islAdj[name]) ? islAdj[name] : 0
  })
  const mMap = {}
  managers.forEach(m => {
    mMap[mgrKey(m)] = Number.isFinite(mgrAdj[mgrKey(m)]) ? mgrAdj[mgrKey(m)] : 0
  })
  setAdjustments(iMap, mMap)
  showOvConfirm.value = false
  ovSaved.value = true
  clearTimeout(ovSavedTimer)
  ovSavedTimer = setTimeout(() => { ovSaved.value = false }, 2500)
}

// ── Reset ──
const resetMsg = ref('')
let resetTimer = null

function confirmReset(type) {
  if (!confirm(`Are you sure you want to reset ${type}? This cannot be undone.`)) return
  if (type === 'points') {
    resetPoints()
    resetMsg.value = 'All points cleared.'
  } else if (type === 'picks') {
    resetPicks()
    managers.forEach(m => { draftSelections[mgrKey(m)] = ['', ''] })
    resetMsg.value = 'All draft picks cleared.'
  } else {
    resetAll()
    managers.forEach(m => { draftSelections[mgrKey(m)] = ['', ''] })
    resetMsg.value = 'Everything has been reset.'
  }
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => { resetMsg.value = '' }, 3000)
}
</script>

<style scoped>
.admin-page { padding: 40px 0 60px; }

/* Auth */
.auth-card {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.auth-lede { color: var(--text-mid); font-weight: 700; }
.auth-input {
  padding: 12px 16px;
  border: 2px solid var(--pink-light);
  border-radius: 10px;
  font-size: 1rem;
  font-family: 'Nunito', sans-serif;
  outline: none;
}
.auth-input:focus { border-color: var(--pink); }
.auth-err { color: #c00; font-weight: 700; font-size: .9rem; }

/* Admin header */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.lock-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: 2px solid var(--pink-light);
  background: #fff;
  font-weight: 900;
  cursor: pointer;
  color: var(--text-mid);
}
.lock-btn.locked { background: #fff3cd; border-color: #ffc107; color: #856404; }
.lock-notice {
  background: #fff8e1;
  border: 2px solid #ffc107;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  color: #856404;
  margin-bottom: 16px;
}
.file-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 800;
  font-size: .85rem;
  color: var(--text-mid);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.tab-btn {
  padding: 10px 20px;
  border-radius: 999px;
  border: 2px solid var(--pink-light);
  background: #fff;
  font-weight: 800;
  font-size: .9rem;
  cursor: pointer;
  color: var(--text-mid);
  transition: all .2s;
}
.tab-btn.active { background: var(--pink); border-color: var(--pink); color: #fff; }

/* Panel */
.tab-panel {
  background: rgba(255,255,255,.9);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
}
.panel-title { font-family: 'Pacifico', cursive; color: var(--pink); font-size: 1.4rem; margin-bottom: 8px; }
.panel-sub   { color: var(--text-mid); margin-bottom: 24px; font-weight: 700; }

/* Picks */
.picks-grid { display: flex; flex-direction: column; gap: 12px; }
.pick-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 10px;
  border-left: 4px solid;
  flex-wrap: wrap;
}
.pick-mgr { min-width: 130px; font-weight: 800; }
.pick-selects { display: flex; gap: 10px; flex: 1; flex-wrap: wrap; }
.pick-select {
  flex: 1;
  min-width: 160px;
  padding: 8px 12px;
  border: 2px solid var(--pink-light);
  border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  font-size: .9rem;
  font-weight: 700;
  outline: none;
  background: #fff;
  cursor: pointer;
}
.pick-select:focus { border-color: var(--pink); }

/* Log form */
.log-form { display: flex; flex-direction: column; gap: 14px; max-width: 560px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-row label { font-weight: 800; font-size: .9rem; color: var(--text-mid); }
.form-row label em { font-weight: 400; }

.event-history { margin-top: 32px; }
.event-history h4 { font-weight: 900; color: var(--text-mid); margin-bottom: 12px; }
.event-list { display: flex; flex-direction: column; gap: 8px; max-height: 360px; overflow-y: auto; }
.event-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: .88rem;
  font-weight: 700;
  flex-wrap: wrap;
}
.ev-pos { background: #d4edda; }
.ev-neg { background: #f8d7da; }
.ev-pts { font-size: 1rem; font-weight: 900; min-width: 44px; }
.ev-label { flex: 1; }
.ev-ep    { color: #666; font-size: .8rem; }
.ev-note  { color: #555; font-style: italic; font-size: .8rem; flex-basis: 100%; padding-left: 54px; margin-top: -6px; }
.ev-del {
  background: none; border: none; cursor: pointer; color: #c00;
  font-size: 1rem; padding: 0 4px; margin-left: auto;
}
.ev-del:hover { color: #800; }
.ev-total { margin-top: 12px; font-weight: 900; color: var(--pink); }

/* Roster */
.sub-panel-head { font-weight: 900; font-size: 1rem; color: var(--text-mid); margin-bottom: 12px; text-transform: uppercase; letter-spacing: .05em; }
.roster-grid { display: flex; flex-direction: column; gap: 8px; }
.roster-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--cream);
  border-radius: 10px;
  flex-wrap: wrap;
}
.roster-swatch {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}
.bomb-swatch { background: #FF8C00; font-size: 1.2rem; }
.roster-name { flex: 1; font-weight: 800; }
.roster-pts  { color: var(--pink); font-weight: 900; min-width: 60px; text-align: right; }

.bomb-add { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.bomb-add input[type="text"] { flex: 1; min-width: 160px; }
.bomb-gender { flex: 0 0 auto; width: auto; }
.bomb-upload-btn {
  padding: 8px 14px;
  border: 2px dashed var(--pink-light);
  border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  font-size: .85rem;
  font-weight: 700;
  color: var(--text-mid);
  cursor: pointer;
  white-space: nowrap;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: border-color .2s, color .2s;
}
.bomb-upload-btn:hover { border-color: var(--pink); color: var(--pink); }

.empty-msg { color: var(--text-mid); font-weight: 700; margin-top: 12px; }

/* Buttons */
.btn-pink {
  background: var(--pink);
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 999px;
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: .95rem;
  cursor: pointer;
  transition: background .2s, transform .2s;
  align-self: flex-start;
}
.btn-pink:hover:not(:disabled) { background: var(--pink-dark); transform: translateY(-2px); }
.btn-pink:disabled { opacity: .5; cursor: not-allowed; }

.btn-ghost {
  background: transparent;
  border: 2px solid var(--pink-light);
  color: var(--text-mid);
  padding: 8px 20px;
  border-radius: 999px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  cursor: pointer;
}
.btn-ghost:hover { background: var(--pink-pale); }

.toggle-elim-btn {
  border: none;
  border-radius: 999px;
  padding: 6px 16px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: .8rem;
  cursor: pointer;
}
.btn-elim    { background: #f8d7da; color: #721c24; }
.btn-restore { background: #d4edda; color: #155724; }

.reset-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
.btn-danger {
  background: #dc3545;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 999px;
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  cursor: pointer;
  transition: background .2s;
}
.btn-danger:hover { background: #a71d2a; }

.danger-text { color: #721c24; }
.success-msg { color: #155724; font-weight: 800; margin-top: 12px; }

/* Couples tab */
.couple-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.couple-heart { font-size: 1.2rem; color: #c2185b; flex-shrink: 0; }

.couples-list { display: flex; flex-direction: column; gap: 8px; }
.couple-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fce4ec;
  border-radius: 10px;
  flex-wrap: wrap;
  gap: 10px;
}
.couple-names { font-weight: 800; font-size: 1rem; color: #880e4f; }

/* Override Points tab */
.ov-table { display: flex; flex-direction: column; gap: 6px; }

.ov-head {
  display: grid;
  grid-template-columns: 1fr 90px 90px 80px;
  gap: 8px;
  padding: 4px 14px;
  font-size: .75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-mid);
}

.ov-row {
  display: grid;
  grid-template-columns: 1fr 90px 90px 80px;
  gap: 8px;
  align-items: center;
  padding: 8px 14px;
  background: var(--cream);
  border-radius: 10px;
}

.ov-r    { text-align: right; }
.ov-name { font-weight: 800; }
.ov-dim  { color: var(--text-mid); font-weight: 700; }
.ov-bold { font-weight: 900; }
.ov-pos  { color: #155724; }
.ov-neg  { color: #721c24; }

.ov-input {
  width: 100%;
  padding: 5px 8px;
  border: 2px solid var(--pink-light);
  border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  font-size: .9rem;
  font-weight: 800;
  text-align: right;
  outline: none;
  background: #fff;
  box-sizing: border-box;
}
.ov-input:focus { border-color: var(--pink); }

.ov-confirm {
  margin-top: 24px;
  background: #fff8e1;
  border: 2px solid #ffc107;
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ov-confirm-title { font-family: 'Pacifico', cursive; color: #856404; font-size: 1.1rem; }

.ov-change-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255,255,255,.75);
  border-radius: 8px;
  font-size: .9rem;
}
.ovc-label { font-weight: 800; }
.ovc-arrow { color: var(--text-mid); }
.ovc-arrow strong { color: var(--pink); }

.ov-confirm-actions { display: flex; gap: 12px; flex-wrap: wrap; }
</style>

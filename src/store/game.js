import { reactive, ref } from 'vue'
import { db, isFirebaseConfigured } from '../firebase.js'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { allEvents } from '../data/pointEvents.js'
import { managers } from '../data/managers.js'
import { validatePick } from '../utils/pickValidation.js'

const STATE_DOC   = db ? doc(db, 'league', 'gameState') : null
const COUPLES_DOC = db ? doc(db, 'league', 'couples') : null   // isolated so main persist() can never wipe it

function defaultState() {
  return {
    managerPicks:        {},
    pickBaselines:       {},
    managerBanked:       {},
    islanderEvents:      {},
    eliminated:          [],
    bombshells:          [],
    islanderAdjustments: {},
    managerAdjustments:  {},
    picksLocked:         false,
  }
}

export const gameState = reactive({ ...defaultState(), couples: [] })
export const isReady   = ref(false)

// Accepts both old object format { A: B, B: A } and new array format [{ a, b }]
function normaliseCouples(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  const seen = new Set()
  const arr  = []
  for (const [a, b] of Object.entries(raw)) {
    const key = [a, b].sort().join('|')
    if (!seen.has(key)) { seen.add(key); arr.push({ a, b }) }
  }
  return arr
}

// Deep-clone through JSON to strip Vue Proxy wrappers before sending to Firestore
function plain(val) {
  return JSON.parse(JSON.stringify(val))
}

function persist() {
  if (!db || !STATE_DOC) return Promise.resolve()
  return setDoc(STATE_DOC, plain({
    managerPicks:        gameState.managerPicks,
    pickBaselines:       gameState.pickBaselines,
    managerBanked:       gameState.managerBanked,
    islanderEvents:      gameState.islanderEvents,
    eliminated:          gameState.eliminated,
    bombshells:          gameState.bombshells,
    islanderAdjustments: gameState.islanderAdjustments,
    managerAdjustments:  gameState.managerAdjustments,
    picksLocked:         gameState.picksLocked,
  }))
}

function persistCouples() {
  if (!db || !COUPLES_DOC) return Promise.resolve()
  return setDoc(COUPLES_DOC, { pairs: plain(gameState.couples) })
}

export function initStore() {
  if (!isFirebaseConfigured || !db) {
    console.warn(
      'Firebase is not configured. Add a .env file with VITE_FIREBASE_* values for live league sync.'
    )
    isReady.value = true
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let stateReady   = false
    let couplesReady = false

    const timeout = setTimeout(() => {
      if (!isReady.value) {
        console.warn('Firestore timed out — loading with local defaults.')
        isReady.value = true
        resolve()
      }
    }, 10_000)

    function tryResolve() {
      if (stateReady && couplesReady && !isReady.value) {
        clearTimeout(timeout)
        isReady.value = true
        resolve()
      }
    }

    onSnapshot(
      STATE_DOC,
      (snap) => {
        const data = snap.exists() ? snap.data() : {}
        Object.assign(gameState, {
          managerPicks:        data.managerPicks        ?? {},
          pickBaselines:       data.pickBaselines       ?? {},
          managerBanked:       data.managerBanked       ?? {},
          islanderEvents:      data.islanderEvents      ?? {},
          eliminated:          data.eliminated          ?? [],
          bombshells:          data.bombshells          ?? [],
          islanderAdjustments: data.islanderAdjustments ?? {},
          managerAdjustments:  data.managerAdjustments  ?? {},
          picksLocked:         data.picksLocked         ?? false,
        })
        if (!stateReady) { stateReady = true; tryResolve() }
      },
      (err) => {
        console.error('Firestore error:', err)
        stateReady = true
        tryResolve()
      }
    )

    onSnapshot(
      COUPLES_DOC,
      (snap) => {
        const data = snap.exists() ? snap.data() : {}
        gameState.couples = normaliseCouples(data.pairs)
        if (!couplesReady) { couplesReady = true; tryResolve() }
      },
      (err) => {
        console.error('Firestore couples error:', err)
        couplesReady = true
        tryResolve()
      }
    )
  })
}

// ── Helpers ──────────────────────────────────────────────

export function getIslanderEventPoints(name) {
  return (gameState.islanderEvents[name] ?? []).reduce((s, e) => s + e.points, 0)
}

export function getIslanderPoints(name) {
  return getIslanderEventPoints(name) + (gameState.islanderAdjustments[name] ?? 0)
}

export function getManagerPicksScore(managerName) {
  const picks     = gameState.managerPicks[managerName]  ?? []
  const baselines = gameState.pickBaselines[managerName] ?? {}
  const banked    = gameState.managerBanked[managerName]  ?? 0
  const activeEarned = picks.reduce((s, isl) =>
    s + (getIslanderPoints(isl) - (baselines[isl] ?? 0)), 0
  )
  return activeEarned + banked
}

export function getManagerScore(managerName) {
  return getManagerPicksScore(managerName) + (gameState.managerAdjustments[managerName] ?? 0)
}

export function getPartner(name) {
  const pair = gameState.couples.find(c => c.a === name || c.b === name)
  if (!pair) return null
  return pair.a === name ? pair.b : pair.a
}

export function isEliminated(name) {
  return gameState.eliminated.includes(name)
}

export function setAdjustments(islanderMap, managerMap) {
  gameState.islanderAdjustments = islanderMap
  gameState.managerAdjustments  = managerMap
  persist()
}

// ── Mutations ─────────────────────────────────────────────

export function setPickLock(locked) {
  gameState.picksLocked = locked
  persist()
}

export function setManagerPicks(managerName, newPicks, { league = 'villa' } = {}) {
  if (gameState.picksLocked) {
    throw new Error('Picks are locked. Tap Unlock Picks in Commissioner Tools to make changes.')
  }

  const leagueManagers = managers.filter(m => m.league === league)
  const picksByMember = {}
  for (const m of leagueManagers) {
    const key = m.storeKey ?? m.name
    picksByMember[key] = gameState.managerPicks[key] ?? []
  }

  const err = validatePick({
    picksByMember,
    memberKey: managerName,
    newIds: newPicks,
    memberCount: leagueManagers.length,
    islanderName: (id) => id,
  })
  if (err) throw new Error(err)

  const oldPicks = gameState.managerPicks[managerName] ?? []

  if (!gameState.pickBaselines[managerName]) gameState.pickBaselines[managerName] = {}
  if (gameState.managerBanked[managerName] == null) gameState.managerBanked[managerName] = 0

  oldPicks.forEach(isl => {
    if (!newPicks.includes(isl)) {
      const baseline = gameState.pickBaselines[managerName][isl] ?? 0
      const earned   = getIslanderPoints(isl) - baseline
      gameState.managerBanked[managerName] += earned
      delete gameState.pickBaselines[managerName][isl]
    }
  })

  newPicks.forEach(isl => {
    if (!oldPicks.includes(isl)) {
      gameState.pickBaselines[managerName][isl] = getIslanderPoints(isl)
    }
  })

  gameState.managerPicks[managerName] = newPicks
  persist()
}

export function logEvent(islanderName, eventId, episode = '', note = '') {
  const eventDef = allEvents.find(e => e.id === eventId)
  if (!eventDef) return
  if (!gameState.islanderEvents[islanderName]) {
    gameState.islanderEvents[islanderName] = []
  }
  gameState.islanderEvents[islanderName].push({
    eventId,
    label:   eventDef.label,
    points:  eventDef.points,
    episode,
    note,
    ts: new Date().toISOString(),
  })
  persist()
}

export function removeEvent(islanderName, index) {
  if (gameState.islanderEvents[islanderName]) {
    gameState.islanderEvents[islanderName].splice(index, 1)
    persist()
  }
}

export function toggleEliminated(name) {
  const idx = gameState.eliminated.indexOf(name)
  if (idx === -1) gameState.eliminated.push(name)
  else gameState.eliminated.splice(idx, 1)
  persist()
}

export function addBombshell(name, gradient, gender = 'female', photo = '') {
  if (!gameState.bombshells.find(b => b.name === name)) {
    gameState.bombshells.push({
      name,
      gender,
      photo,
      gradient: gradient || 'linear-gradient(135deg, #FF1B8D, #FF8C00)',
    })
    persist()
  }
}

export function removeBombshell(name) {
  const idx = gameState.bombshells.findIndex(b => b.name === name)
  if (idx !== -1) {
    gameState.bombshells.splice(idx, 1)
    persist()
  }
}

export function setCouple(nameA, nameB) {
  gameState.couples = gameState.couples.filter(
    c => c.a !== nameA && c.b !== nameA && c.a !== nameB && c.b !== nameB
  )
  gameState.couples.push({ a: nameA, b: nameB })
  persistCouples()
}

export function removeCouple(name) {
  gameState.couples = gameState.couples.filter(c => c.a !== name && c.b !== name)
  persistCouples()
}

export function resetPoints() {
  gameState.islanderEvents      = {}
  gameState.islanderAdjustments = {}
  gameState.managerAdjustments  = {}
  gameState.pickBaselines       = {}
  gameState.managerBanked       = {}
  persist()
}

export function resetPicks() {
  gameState.managerPicks  = {}
  gameState.pickBaselines = {}
  gameState.managerBanked = {}
  persist()
}

export function resetAll() {
  Object.assign(gameState, defaultState())
  gameState.couples = []
  persist()
  persistCouples()
}

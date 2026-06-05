import { reactive, ref } from 'vue'
import { db } from '../firebase.js'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { allEvents } from '../data/pointEvents.js'

const STATE_DOC = doc(db, 'league', 'gameState')

function defaultState() {
  return {
    managerPicks:        {},  // { managerName: [islanderName, ...] }
    pickBaselines:       {},  // { managerName: { islanderName: pointsAtPickup } }
    managerBanked:       {},  // { managerName: totalBankedPtsFromDroppedIslanders }
    islanderEvents:      {},
    eliminated:          [],
    bombshells:          [],
    couples:             {},  // { islanderName: partnerName } bidirectional
    islanderAdjustments: {},
    managerAdjustments:  {},
  }
}

export const gameState = reactive(defaultState())
export const isReady   = ref(false)

// Deep-clone through JSON to strip Vue Proxy wrappers before sending to Firestore
function plain(val) {
  return JSON.parse(JSON.stringify(val))
}

function persist() {
  return setDoc(STATE_DOC, plain({
    managerPicks:        gameState.managerPicks,
    pickBaselines:       gameState.pickBaselines,
    managerBanked:       gameState.managerBanked,
    islanderEvents:      gameState.islanderEvents,
    eliminated:          gameState.eliminated,
    bombshells:          gameState.bombshells,
    couples:             gameState.couples,
    islanderAdjustments: gameState.islanderAdjustments,
    managerAdjustments:  gameState.managerAdjustments,
  }))
}

export function initStore() {
  return new Promise((resolve) => {
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
          couples:             data.couples             ?? {},
          islanderAdjustments: data.islanderAdjustments ?? {},
          managerAdjustments:  data.managerAdjustments  ?? {},
        })
        if (!isReady.value) {
          isReady.value = true
          resolve()
        }
      },
      (err) => {
        console.error('Firestore error:', err)
        isReady.value = true
        resolve()
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

// Points a manager has earned from their CURRENT picks (above each islander's baseline at pickup)
// plus any points banked from previously held islanders
export function getManagerPicksScore(managerName) {
  const picks    = gameState.managerPicks[managerName]  ?? []
  const baselines = gameState.pickBaselines[managerName] ?? {}
  const banked   = gameState.managerBanked[managerName]  ?? 0

  const activeEarned = picks.reduce((s, isl) =>
    s + (getIslanderPoints(isl) - (baselines[isl] ?? 0)), 0
  )

  return activeEarned + banked
}

export function getManagerScore(managerName) {
  return getManagerPicksScore(managerName) + (gameState.managerAdjustments[managerName] ?? 0)
}

export function setAdjustments(islanderMap, managerMap) {
  gameState.islanderAdjustments = islanderMap
  gameState.managerAdjustments  = managerMap
  persist()
}

export function isEliminated(name) {
  return gameState.eliminated.includes(name)
}

// ── Mutations ─────────────────────────────────────────────

export function setManagerPicks(managerName, newPicks) {
  const oldPicks = gameState.managerPicks[managerName] ?? []

  if (!gameState.pickBaselines[managerName]) gameState.pickBaselines[managerName] = {}
  if (gameState.managerBanked[managerName] == null) gameState.managerBanked[managerName] = 0

  // Bank earned points for any islander being dropped
  oldPicks.forEach(isl => {
    if (!newPicks.includes(isl)) {
      const baseline = gameState.pickBaselines[managerName][isl] ?? 0
      const earned   = getIslanderPoints(isl) - baseline
      gameState.managerBanked[managerName] += earned
      delete gameState.pickBaselines[managerName][isl]
    }
  })

  // Record baseline for any islander being newly added
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

export function addBombshell(name, gradient, gender = 'female') {
  if (!gameState.bombshells.find(b => b.name === name)) {
    gameState.bombshells.push({
      name,
      gender,
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
  // Clear any existing partners for either islander first
  if (gameState.couples[nameA]) delete gameState.couples[gameState.couples[nameA]]
  if (gameState.couples[nameB]) delete gameState.couples[gameState.couples[nameB]]
  gameState.couples[nameA] = nameB
  gameState.couples[nameB] = nameA
  persist()
}

export function removeCouple(name) {
  const partner = gameState.couples[name]
  if (partner) delete gameState.couples[partner]
  delete gameState.couples[name]
  persist()
}

// Wipe only point-related data; keeps picks and baselines intact
export function resetPoints() {
  gameState.islanderEvents      = {}
  gameState.islanderAdjustments = {}
  gameState.managerAdjustments  = {}
  gameState.pickBaselines       = {}
  gameState.managerBanked       = {}
  persist()
}

// Wipe picks and all tenure tracking; keeps point events
export function resetPicks() {
  gameState.managerPicks  = {}
  gameState.pickBaselines = {}
  gameState.managerBanked = {}
  persist()
}

export function resetAll() {
  Object.assign(gameState, defaultState())
  persist()
}

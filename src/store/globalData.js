import { reactive, ref } from 'vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase.js'
import { islanders as staticIslanders } from '../data/islanders.js'
import { allEvents } from '../data/pointEvents.js'
import { ensureGlobalDataSeeded, SEASON_ID } from '../utils/bootstrap.js'

export const globalReady = ref(false)
export const activeSeasonId = ref(SEASON_ID)

export const globalState = reactive({
  seasons: [],
  islanders: [],
  scoringCategories: [],
  episodes: [],
  pointEvents: [],
})

function staticFallbackIslanders() {
  return staticIslanders.map(isl => ({
    id: String(isl.id),
    seasonId: SEASON_ID,
    name: isl.name,
    imageUrl: isl.photo,
    category: isl.gender === 'female' ? 'girl' : 'boy',
    status: 'active',
    gradient: isl.gradient,
  }))
}

function staticFallbackCategories() {
  return allEvents.map(e => ({
    id: e.id,
    name: e.label,
    points: e.points,
    type: e.points >= 0 ? (e.id.match(/funniest|messiest|finest|best_couple|toxic/) ? 'weekly_bonus' : 'positive') : 'negative',
    description: e.label,
  }))
}

export function getIslanderById(id) {
  return globalState.islanders.find(i => i.id === id)
}

export function getIslanderPoints(islanderId) {
  return globalState.pointEvents
    .filter(e => e.islanderId === islanderId)
    .reduce((sum, e) => sum + (e.points ?? 0), 0)
}

export function initGlobalData() {
  if (!isFirebaseConfigured || !db) {
    globalState.islanders = staticFallbackIslanders()
    globalState.scoringCategories = staticFallbackCategories()
    globalState.seasons = [{ id: SEASON_ID, name: 'Summer 2026', year: 2026, status: 'active' }]
    globalReady.value = true
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let pending = 5
    const done = () => {
      if (--pending === 0) {
        globalReady.value = true
        resolve()
      }
    }

    const timeout = setTimeout(() => {
      if (!globalReady.value) {
        globalReady.value = true
        resolve()
      }
    }, 10_000)

    const finish = () => {
      clearTimeout(timeout)
      if (!globalReady.value) {
        globalReady.value = true
        resolve()
      }
    }

    ensureGlobalDataSeeded().finally(() => {
      onSnapshot(collection(db, 'seasons'), (snap) => {
        globalState.seasons = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (globalState.seasons.length) activeSeasonId.value = globalState.seasons[0].id
      }, finish)
      done()

      onSnapshot(
        query(collection(db, 'islanders'), where('seasonId', '==', SEASON_ID)),
        (snap) => {
          globalState.islanders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        },
        finish
      )
      done()

      onSnapshot(collection(db, 'scoring_categories'), (snap) => {
        globalState.scoringCategories = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      }, finish)
      done()

      onSnapshot(
        query(collection(db, 'episodes'), orderBy('episodeNumber', 'asc')),
        (snap) => {
          globalState.episodes = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        },
        finish
      )
      done()

      onSnapshot(collection(db, 'point_events'), (snap) => {
        globalState.pointEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      }, finish)
      done()
    })
  })
}

// ── Global admin mutations ────────────────────────────────

export async function addIslander(data) {
  if (!db) throw new Error('Firebase not configured')
  const ref = await addDoc(collection(db, 'islanders'), {
    seasonId: activeSeasonId.value,
    status: 'active',
    createdAt: new Date().toISOString(),
    ...data,
  })
  return ref.id
}

export async function updateIslander(id, data) {
  if (!db) throw new Error('Firebase not configured')
  await updateDoc(doc(db, 'islanders', id), data)
}

export async function deleteIslander(id) {
  if (!db) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, 'islanders', id))
}

export async function addEpisode({ episodeNumber, airDate }) {
  if (!db) throw new Error('Firebase not configured')
  const ref = await addDoc(collection(db, 'episodes'), {
    seasonId: activeSeasonId.value,
    episodeNumber,
    airDate,
    status: 'draft',
    createdAt: new Date().toISOString(),
  })
  return ref.id
}

export async function publishEpisode(episodeId) {
  if (!db) throw new Error('Firebase not configured')
  await updateDoc(doc(db, 'episodes', episodeId), { status: 'published' })
}

export async function addPointEvent({ episodeId, islanderId, scoringCategoryId, points, description, createdBy }) {
  if (!db) throw new Error('Firebase not configured')
  const ref = await addDoc(collection(db, 'point_events'), {
    episodeId,
    islanderId,
    scoringCategoryId,
    points,
    description,
    createdBy,
    createdAt: new Date().toISOString(),
  })
  return ref.id
}

export async function removePointEvent(eventId) {
  if (!db) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, 'point_events', eventId))
}

export async function upsertScoringCategory(id, data) {
  if (!db) throw new Error('Firebase not configured')
  await setDoc(doc(db, 'scoring_categories', id), data, { merge: true })
}

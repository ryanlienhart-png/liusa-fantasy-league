import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { islanders as staticIslanders } from '../data/islanders.js'
import { positiveEvents, negativeEvents, bonusEvents } from '../data/pointEvents.js'
import { MAIN_LEAGUES } from '../data/mainLeagues.js'
import { mgrKey } from '../data/managers.js'

const SEASON_ID = 'villa-league-2026'

export async function ensureGlobalDataSeeded() {
  if (!db) return false

  const seasonRef = doc(db, 'seasons', SEASON_ID)
  const seasonSnap = await getDoc(seasonRef)
  if (seasonSnap.exists()) return false

  const batch = writeBatch(db)

  batch.set(seasonRef, {
    name: 'Summer 2026',
    year: 2026,
    status: 'active',
    createdAt: new Date().toISOString(),
  })

  for (const isl of staticIslanders) {
    const category = isl.gender === 'female' ? 'girl' : 'boy'
    const ref = doc(db, 'islanders', String(isl.id))
    batch.set(ref, {
      seasonId: SEASON_ID,
      name: isl.name,
      imageUrl: isl.photo,
      category,
      status: 'active',
      gradient: isl.gradient,
      createdAt: new Date().toISOString(),
    })
  }

  const allCategories = [
    ...positiveEvents.map(e => ({ ...e, type: 'positive' })),
    ...negativeEvents.map(e => ({ ...e, type: 'negative' })),
    ...bonusEvents.map(e => ({ ...e, type: 'weekly_bonus' })),
  ]

  for (const cat of allCategories) {
    const ref = doc(db, 'scoring_categories', cat.id)
    batch.set(ref, {
      name: cat.label,
      points: cat.points,
      type: cat.type,
      description: cat.label,
    })
  }

  await batch.commit()
  return true
}

export async function getActiveSeasonId() {
  if (!db) return SEASON_ID
  const snap = await getDocs(query(collection(db, 'seasons'), limit(1)))
  if (snap.empty) return SEASON_ID
  return snap.docs[0].id
}

export async function ensureMainLeaguesSeeded() {
  if (!db) return false

  let seeded = false

  for (const league of MAIN_LEAGUES) {
    const leagueRef = doc(db, 'leagues', league.id)
    const leagueSnap = await getDoc(leagueRef)
    if (leagueSnap.exists()) continue

    seeded = true
    const batch = writeBatch(db)

    batch.set(leagueRef, {
      name: league.name,
      seasonId: SEASON_ID,
      hostUserId: null,
      inviteCode: league.inviteCode,
      privacy: 'public',
      isMain: true,
      picksLocked: false,
      createdAt: new Date().toISOString(),
    })

    for (const manager of league.managers) {
      const memberRef = doc(db, 'league_members', `${league.id}_${mgrKey(manager)}`)
      batch.set(memberRef, {
        leagueId: league.id,
        legacyKey: mgrKey(manager),
        userName: manager.name,
        color: manager.color,
        photo: manager.photo,
        role: manager.isHost ? 'host' : 'member',
        isLegacy: true,
        joinedAt: new Date().toISOString(),
      })
    }

    await batch.commit()
  }

  return seeded
}

export { SEASON_ID }

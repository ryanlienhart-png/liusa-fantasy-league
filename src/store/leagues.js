import { reactive, ref } from 'vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase.js'
import { generateInviteCode } from '../utils/inviteCode.js'
import { SEASON_ID } from '../utils/bootstrap.js'
import { getIslanderPoints, globalState } from './globalData.js'
import { validatePick, maxClaimsPerIslander } from '../utils/pickValidation.js'

export const leaguesReady = ref(false)
export const myLeagues = ref([])
export const activeLeague = ref(null)
export const activeLeagueMembers = ref([])
export const activeLeaguePicks = ref([])

const leagueCache = reactive({})

export function getManagerScore(leagueId, userId) {
  const picks = activeLeaguePicks.value.filter(p => p.userId === userId)
  if (!picks.length && leagueId !== activeLeague.value?.id) {
    const cached = leagueCache[leagueId]
    if (cached?.picks) {
      const userPicks = cached.picks.filter(p => p.userId === userId)
      return userPicks.reduce((sum, p) => sum + getIslanderPoints(p.islanderId), 0)
    }
    return 0
  }
  return picks.reduce((sum, p) => sum + getIslanderPoints(p.islanderId), 0)
}

export function getUserPicks(userId) {
  return activeLeaguePicks.value
    .filter(p => p.userId === userId)
    .sort((a, b) => a.pickSlot - b.pickSlot)
}

export function initLeaguesForUser(userId) {
  if (!userId || !isFirebaseConfigured || !db) {
    leaguesReady.value = true
    myLeagues.value = []
    return () => {}
  }

  const q = query(
    collection(db, 'league_members'),
    where('userId', '==', userId)
  )

  return onSnapshot(q, async (snap) => {
    const memberships = snap.docs.map(d => ({ memberDocId: d.id, ...d.data() }))
    const leagues = []
    for (const m of memberships) {
      const leagueSnap = await getDoc(doc(db, 'leagues', m.leagueId))
      if (leagueSnap.exists()) {
        leagues.push({
          ...leagueSnap.data(),
          id: leagueSnap.id,
          memberRole: m.role,
        })
      }
    }
    myLeagues.value = leagues
    leaguesReady.value = true
  })
}

export function watchLeague(leagueId) {
  if (!leagueId || !db) return () => {}

  let unsubMembers = () => {}
  let unsubPicks = () => {}

  const unsubLeague = onSnapshot(doc(db, 'leagues', leagueId), (snap) => {
    if (snap.exists()) {
      activeLeague.value = { id: snap.id, ...snap.data() }
    } else {
      activeLeague.value = null
    }
  })

  unsubMembers = onSnapshot(
    query(collection(db, 'league_members'), where('leagueId', '==', leagueId)),
    (snap) => {
      activeLeagueMembers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
  )

  unsubPicks = onSnapshot(
    query(collection(db, 'manager_picks'), where('leagueId', '==', leagueId)),
    (snap) => {
      activeLeaguePicks.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      leagueCache[leagueId] = { picks: activeLeaguePicks.value }
    }
  )

  return () => {
    unsubLeague()
    unsubMembers()
    unsubPicks()
  }
}

export async function createLeague({ name, privacy, hostUserId, hostName }) {
  if (!db) throw new Error('Firebase not configured')

  let inviteCode = generateInviteCode()
  let attempts = 0
  while (attempts < 10) {
    const existing = await getDocs(query(collection(db, 'leagues'), where('inviteCode', '==', inviteCode)))
    if (existing.empty) break
    inviteCode = generateInviteCode()
    attempts++
  }

  const leagueRef = await addDoc(collection(db, 'leagues'), {
    name,
    seasonId: SEASON_ID,
    hostUserId,
    inviteCode,
    privacy: privacy ?? 'public',
    picksLocked: false,
    createdAt: new Date().toISOString(),
  })

  await addDoc(collection(db, 'league_members'), {
    leagueId: leagueRef.id,
    userId: hostUserId,
    userName: hostName,
    role: 'host',
    joinedAt: new Date().toISOString(),
  })

  return leagueRef.id
}

export async function joinLeagueByCode({ inviteCode, userId, userName }) {
  if (!db) throw new Error('Firebase not configured')

  const code = inviteCode.trim().toUpperCase()
  const snap = await getDocs(query(collection(db, 'leagues'), where('inviteCode', '==', code)))
  if (snap.empty) throw new Error('Invalid invite code.')

  const league = snap.docs[0]
  const existing = await getDocs(query(
    collection(db, 'league_members'),
    where('leagueId', '==', league.id),
    where('userId', '==', userId)
  ))
  if (!existing.empty) return league.id

  await addDoc(collection(db, 'league_members'), {
    leagueId: league.id,
    userId,
    userName,
    role: 'member',
    joinedAt: new Date().toISOString(),
  })

  return league.id
}

function memberKey(pick) {
  return pick.userId ?? pick.legacyKey
}

function buildPicksByMember(picks, members, userId) {
  const map = {}
  for (const m of members) {
    const key = m.userId ?? m.legacyKey
    map[key] = picks
      .filter(p => memberKey(p) === key)
      .sort((a, b) => a.pickSlot - b.pickSlot)
      .map(p => p.islanderId)
  }
  return map
}

function islanderLabel(id) {
  return globalState.islanders.find(i => i.id === id)?.name ?? id
}

export async function validateLeaguePick({ leagueId, userId, pickSlot, islanderId }) {
  const leagueSnap = await getDoc(doc(db, 'leagues', leagueId))
  if (leagueSnap.exists() && leagueSnap.data().picksLocked) {
    return 'Picks are locked. Contact your league host to unlock.'
  }

  const membersSnap = await getDocs(query(collection(db, 'league_members'), where('leagueId', '==', leagueId)))
  const members = membersSnap.docs.map(d => d.data())
  const picksSnap = await getDocs(query(collection(db, 'manager_picks'), where('leagueId', '==', leagueId)))
  const allPicks = picksSnap.docs.map(d => d.data())

  const current = allPicks.filter(p => p.userId === userId)
  const newIds = [1, 2].map(slot => {
    if (slot === pickSlot) return islanderId || ''
    return current.find(p => p.pickSlot === slot)?.islanderId ?? ''
  })

  return validatePick({
    picksByMember: buildPicksByMember(allPicks, members, userId),
    memberKey: userId,
    newIds,
    memberCount: members.length,
    islanderName: islanderLabel,
  })
}

export { maxClaimsPerIslander }

export async function setManagerPick({ leagueId, userId, pickSlot, islanderId }) {
  if (!db) throw new Error('Firebase not configured')

  if (islanderId) {
    const err = await validateLeaguePick({ leagueId, userId, pickSlot, islanderId })
    if (err) throw new Error(err)
  }

  const existing = await getDocs(query(
    collection(db, 'manager_picks'),
    where('leagueId', '==', leagueId),
    where('userId', '==', userId),
    where('pickSlot', '==', pickSlot)
  ))

  if (existing.empty) {
    await addDoc(collection(db, 'manager_picks'), {
      leagueId,
      userId,
      islanderId,
      pickSlot,
      createdAt: new Date().toISOString(),
    })
  } else {
    await updateDoc(existing.docs[0].ref, {
      islanderId,
      updatedAt: new Date().toISOString(),
    })
  }
}

export async function clearManagerPick({ leagueId, userId, pickSlot }) {
  if (!db) throw new Error('Firebase not configured')

  const leagueSnap = await getDoc(doc(db, 'leagues', leagueId))
  if (leagueSnap.exists() && leagueSnap.data().picksLocked) {
    throw new Error('Picks are locked. Contact your league host to unlock.')
  }

  const existing = await getDocs(query(
    collection(db, 'manager_picks'),
    where('leagueId', '==', leagueId),
    where('userId', '==', userId),
    where('pickSlot', '==', pickSlot)
  ))
  for (const d of existing.docs) {
    await deleteDoc(d.ref)
  }
}

export async function updateLeague(leagueId, data) {
  if (!db) throw new Error('Firebase not configured')
  await updateDoc(doc(db, 'leagues', leagueId), data)
}

export async function setLeaguePickLock(leagueId, locked) {
  await updateLeague(leagueId, { picksLocked: locked })
}

export async function removeMember(memberDocId) {
  if (!db) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, 'league_members', memberDocId))
}

export async function getLeagueById(leagueId) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'leagues', leagueId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

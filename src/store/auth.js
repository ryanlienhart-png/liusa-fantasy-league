import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase.js'
import { resolveUserRole } from '../config/admins.js'

export const currentUser = ref(null)
export const userProfile = ref(null)
export const authReady = ref(false)

export const isSignedIn = computed(() => Boolean(currentUser.value))
export const isGlobalAdmin = computed(() => userProfile.value?.role === 'global_admin')

function buildProfile(user, existing = {}, nameOverride = null) {
  const name = nameOverride ?? existing.name ?? user.displayName ?? user.email?.split('@')[0] ?? 'Manager'
  const email = existing.email ?? user.email
  const role = resolveUserRole({ email })

  return {
    email,
    name,
    avatarUrl: existing.avatarUrl ?? user.photoURL ?? '',
    role,
    createdAt: existing.createdAt ?? new Date().toISOString(),
  }
}

async function loadOrCreateProfile(user, nameOverride = null) {
  if (!db) {
    userProfile.value = { id: user.uid, ...buildProfile(user, {}, nameOverride) }
    return
  }

  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  if (snap.exists()) {
    const existing = snap.data()
    const profile = buildProfile(user, existing, nameOverride)
    const updates = {}
    if (profile.role !== existing.role) updates.role = profile.role
    if (nameOverride && profile.name !== existing.name) updates.name = profile.name
    if (Object.keys(updates).length) await setDoc(userRef, updates, { merge: true })
    userProfile.value = { id: user.uid, ...profile }
    return
  }

  const profile = buildProfile(user, {}, nameOverride)
  await setDoc(userRef, profile)
  userProfile.value = { id: user.uid, ...profile }
}

export function initAuth() {
  if (!isFirebaseConfigured || !auth) {
    authReady.value = true
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      currentUser.value = user
      if (user) {
        await loadOrCreateProfile(user)
      } else {
        userProfile.value = null
      }
      authReady.value = true
      resolve()
    })
  })
}

export async function signUp({ name, email, password }) {
  if (!auth) throw new Error('Firebase is not configured.')
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  await loadOrCreateProfile(cred.user, name)
  return cred.user
}

export async function logIn({ email, password }) {
  if (!auth) throw new Error('Firebase is not configured.')
  const cred = await signInWithEmailAndPassword(auth, email, password)
  await loadOrCreateProfile(cred.user)
  return cred.user
}

export async function logOut() {
  if (!auth) return
  await signOut(auth)
  userProfile.value = null
}

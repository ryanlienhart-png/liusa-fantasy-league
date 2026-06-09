import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase.js'

export async function uploadIslanderPhoto(file, islanderName) {
  if (!storage) throw new Error('Firebase Storage is not configured.')
  if (!file?.type?.startsWith('image/')) throw new Error('Please choose an image file.')

  const safeName = islanderName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `islanders/${safeName}-${Date.now()}.${ext}`
  const storageRef = ref(storage, path)

  await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(storageRef)
}

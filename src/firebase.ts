import * as admin from 'firebase-admin'
import { cert } from 'firebase-admin/app'

// Initializing Firebase admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: cert(
        JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIAL as string)
      ),
    })
  } catch (error) {
    console.error('Firebase admin initialization error', error)
    throw new Error('Firebase admin initialization error')
  }
}

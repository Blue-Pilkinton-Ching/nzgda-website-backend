import * as admin from 'firebase-admin'

// Initializing Firebase admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    })
  } catch (error) {
    console.error('Firebase admin initialization error', error)
    throw new Error('Firebase admin initialization error')
  }
}

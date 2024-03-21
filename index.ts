import './src/server'

import * as admin from 'firebase-admin'
import * as AWS from 'aws-sdk'

import { config } from 'dotenv'

config()

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

// Init AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-2',
})

export default AWS
